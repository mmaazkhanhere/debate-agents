import asyncio
import json
import logging
import re
import time
import uuid

from fastapi import HTTPException
from sqlalchemy import delete, func, select

from app.core.config import settings
from app.db.base import init_db as init_database
from app.db.models import DebateMetric, DebateRecord, DebateUsageCall, SessionRecord
from app.db.session import session_scope
from app.schemas.debate import DebateRequest
from src.utils import (
    DEBATE_CACHE_ENABLED as _DEFAULT_DEBATE_CACHE_ENABLED,
    DEBATE_LOCK_TTL_SECONDS as _DEFAULT_DEBATE_LOCK_TTL_SECONDS,
    acquire_generation_lock,
    build_cache_key,
    build_inflight_key,
    build_lock_key,
    get_cached_debate_id,
    get_inflight_debate_id,
    redis_client as _DEFAULT_REDIS_CLIENT,
    set_inflight_debate_id,
)

LOG = logging.getLogger("debate_api")

# Compatibility globals retained for monkeypatching in tests.
DEBATE_CACHE_ENABLED = _DEFAULT_DEBATE_CACHE_ENABLED
DEBATE_LOCK_TTL_SECONDS = _DEFAULT_DEBATE_LOCK_TTL_SECONDS
redis_client = _DEFAULT_REDIS_CLIENT


def _maybe_get_api_module():
    try:
        import api as api_module

        return api_module
    except Exception:
        return None


def _get_cache_enabled() -> bool:
    api_module = _maybe_get_api_module()
    if api_module is not None and hasattr(api_module, "DEBATE_CACHE_ENABLED"):
        return bool(getattr(api_module, "DEBATE_CACHE_ENABLED"))
    return bool(DEBATE_CACHE_ENABLED)


def _get_lock_ttl_seconds() -> int:
    api_module = _maybe_get_api_module()
    if api_module is not None and hasattr(api_module, "DEBATE_LOCK_TTL_SECONDS"):
        try:
            return int(getattr(api_module, "DEBATE_LOCK_TTL_SECONDS"))
        except (TypeError, ValueError):
            return int(DEBATE_LOCK_TTL_SECONDS)
    return int(DEBATE_LOCK_TTL_SECONDS)


def _get_redis_client():
    api_module = _maybe_get_api_module()
    if api_module is not None and hasattr(api_module, "redis_client"):
        return getattr(api_module, "redis_client")
    return redis_client


def _get_flow_runner():
    api_module = _maybe_get_api_module()
    if api_module is not None and hasattr(api_module, "run_debate_flow"):
        return getattr(api_module, "run_debate_flow")

    from src.flow import run_debate_flow

    return run_debate_flow


def init_db() -> None:
    init_database()


def upsert_session(session_id: str, user_id: str | None) -> None:
    now = int(time.time())
    expires_at = now + settings.session_ttl_seconds

    with session_scope() as db:
        existing = db.get(SessionRecord, session_id)
        if existing is None:
            db.add(
                SessionRecord(
                    session_id=session_id,
                    user_id=user_id,
                    created_at=now,
                    expires_at=expires_at,
                    last_seen_at=now,
                )
            )
            return

        if existing.user_id is None and user_id is not None:
            existing.user_id = user_id
        existing.expires_at = expires_at
        existing.last_seen_at = now


def create_debate(
    debate_id: str,
    session_id: str,
    user_id: str | None,
    topic: str,
    debater_1: str,
    debater_2: str,
) -> None:
    now = int(time.time())
    with session_scope() as db:
        db.add(
            DebateRecord(
                debate_id=debate_id,
                session_id=session_id,
                user_id=user_id,
                topic=topic,
                debater_1=debater_1,
                debater_2=debater_2,
                created_at=now,
                status="running",
                completed_at=None,
                error_message=None,
                summary=None,
            )
        )


def get_debate_owner(debate_id: str) -> dict[str, str | None] | None:
    with session_scope() as db:
        row = db.execute(
            select(
                DebateRecord.debate_id,
                DebateRecord.session_id,
                DebateRecord.user_id,
            ).where(DebateRecord.debate_id == debate_id)
        ).one_or_none()
        if row is None:
            return None
        return dict(row._mapping)


def update_debate_status(
    debate_id: str,
    status: str,
    error_message: str | None = None,
) -> None:
    now = int(time.time())

    with session_scope() as db:
        debate = db.get(DebateRecord, debate_id)
        if debate is None:
            return

        debate.status = status
        if status == "completed":
            debate.completed_at = now
            debate.error_message = None
        elif status == "failed":
            debate.completed_at = now
            debate.error_message = error_message


def update_debate_summary(debate_id: str, summary: str) -> None:
    with session_scope() as db:
        debate = db.get(DebateRecord, debate_id)
        if debate is None:
            return
        debate.summary = summary


def is_authorized(debate_id: str, session_id: str, user_id: str | None) -> bool:
    owner = get_debate_owner(debate_id)
    if not owner:
        return False
    owner_user_id = owner.get("user_id")
    if owner_user_id:
        return bool(user_id and owner_user_id == user_id)
    return owner.get("session_id") == session_id


def cleanup_expired_sessions() -> int:
    now = int(time.time())
    with session_scope() as db:
        result = db.execute(delete(SessionRecord).where(SessionRecord.expires_at < now))
        return int(result.rowcount or 0)


def cleanup_old_debates(max_age_seconds: int | None = None) -> int:
    age = max_age_seconds if max_age_seconds is not None else settings.debate_retention_seconds
    threshold = int(time.time()) - age
    with session_scope() as db:
        result = db.execute(delete(DebateRecord).where(DebateRecord.created_at < threshold))
        return int(result.rowcount or 0)


def record_llm_call(
    debate_id: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    cost_usd: float,
) -> None:
    now = int(time.time())
    with session_scope() as db:
        db.add(
            DebateUsageCall(
                debate_id=debate_id,
                model=model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_usd=cost_usd,
                created_at=now,
            )
        )


def update_debate_metrics(
    debate_id: str,
    tokens_delta: int,
    cost_delta: float,
    duration_seconds: int | None = None,
) -> None:
    now = int(time.time())
    with session_scope() as db:
        existing = db.get(DebateMetric, debate_id)
        if existing is None:
            db.add(
                DebateMetric(
                    debate_id=debate_id,
                    total_tokens=max(0, int(tokens_delta)),
                    total_cost_usd=max(0.0, float(cost_delta)),
                    duration_seconds=duration_seconds,
                    updated_at=now,
                )
            )
            return

        existing.total_tokens = max(0, existing.total_tokens + int(tokens_delta))
        existing.total_cost_usd = max(0.0, existing.total_cost_usd + float(cost_delta))
        if duration_seconds is not None:
            existing.duration_seconds = duration_seconds
        existing.updated_at = now


def finalize_debate_duration(debate_id: str) -> None:
    with session_scope() as db:
        debate = db.get(DebateRecord, debate_id)
        if debate is None:
            return
        if debate.created_at is None or debate.completed_at is None:
            return

        duration_seconds = max(0, int(debate.completed_at - debate.created_at))
        existing = db.get(DebateMetric, debate_id)
        now = int(time.time())
        if existing is None:
            db.add(
                DebateMetric(
                    debate_id=debate_id,
                    total_tokens=0,
                    total_cost_usd=0.0,
                    duration_seconds=duration_seconds,
                    updated_at=now,
                )
            )
            return

        existing.duration_seconds = duration_seconds
        existing.updated_at = now


def list_debates_with_metrics(session_id: str, user_id: str | None) -> list[dict]:
    with session_scope() as db:
        stmt = (
            select(
                DebateRecord.debate_id,
                DebateRecord.topic,
                DebateRecord.debater_1,
                DebateRecord.debater_2,
                DebateRecord.status,
                DebateRecord.created_at,
                DebateRecord.completed_at,
                DebateRecord.error_message,
                DebateRecord.summary,
                func.coalesce(DebateMetric.total_tokens, 0).label("total_tokens"),
                func.coalesce(DebateMetric.total_cost_usd, 0.0).label("total_cost_usd"),
                func.coalesce(DebateMetric.duration_seconds, 0).label("duration_seconds"),
            )
            .outerjoin(DebateMetric, DebateMetric.debate_id == DebateRecord.debate_id)
            .order_by(DebateRecord.created_at.desc())
        )

        if user_id:
            stmt = stmt.where(DebateRecord.user_id == user_id)
        else:
            stmt = stmt.where(
                DebateRecord.session_id == session_id,
                DebateRecord.user_id.is_(None),
            )

        rows = db.execute(stmt).all()
        return [dict(row._mapping) for row in rows]


def get_debate_analytics_totals(session_id: str, user_id: str | None) -> dict | None:
    with session_scope() as db:
        stmt = select(
            func.count(DebateRecord.debate_id).label("debate_count"),
            func.coalesce(func.sum(func.coalesce(DebateMetric.total_tokens, 0)), 0).label(
                "total_tokens"
            ),
            func.coalesce(func.sum(func.coalesce(DebateMetric.total_cost_usd, 0.0)), 0.0).label(
                "total_cost_usd"
            ),
            func.coalesce(
                func.sum(func.coalesce(DebateMetric.duration_seconds, 0)),
                0,
            ).label("total_duration_seconds"),
        ).outerjoin(DebateMetric, DebateMetric.debate_id == DebateRecord.debate_id)

        if user_id:
            stmt = stmt.where(DebateRecord.user_id == user_id)
        else:
            stmt = stmt.where(
                DebateRecord.session_id == session_id,
                DebateRecord.user_id.is_(None),
            )

        row = db.execute(stmt).one_or_none()
        if row is None:
            return None
        return dict(row._mapping)


def get_cost_breakdown_for_debates(debate_ids: list[str]) -> dict[str, list[dict]]:
    if not debate_ids:
        return {}

    with session_scope() as db:
        rows = db.execute(
            select(
                DebateUsageCall.debate_id,
                DebateUsageCall.model,
                func.coalesce(func.sum(DebateUsageCall.input_tokens), 0).label("input_tokens"),
                func.coalesce(func.sum(DebateUsageCall.output_tokens), 0).label("output_tokens"),
                func.coalesce(func.sum(DebateUsageCall.cost_usd), 0.0).label("cost_usd"),
            )
            .where(DebateUsageCall.debate_id.in_(debate_ids))
            .group_by(DebateUsageCall.debate_id, DebateUsageCall.model)
            .order_by(DebateUsageCall.debate_id, func.sum(DebateUsageCall.cost_usd).desc())
        ).all()

    breakdown: dict[str, list[dict]] = {debate_id: [] for debate_id in debate_ids}
    for row in rows:
        mapped = dict(row._mapping)
        input_tokens = int(mapped["input_tokens"])
        output_tokens = int(mapped["output_tokens"])
        breakdown[mapped["debate_id"]].append(
            {
                "model": mapped["model"],
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens,
                "cost_usd": round(float(mapped["cost_usd"]), 6),
            }
        )
    return breakdown


def _build_debate_item(row: dict, cost_breakdown_by_debate: dict[str, list[dict]]) -> dict:
    return {
        "debate_id": row["debate_id"],
        "topic": row["topic"],
        "debater_1": row["debater_1"],
        "debater_2": row["debater_2"],
        "status": row["status"],
        "created_at": row["created_at"],
        "completed_at": row["completed_at"],
        "error_message": row["error_message"],
        "summary": row["summary"],
        "total_tokens": row["total_tokens"],
        "total_cost_usd": row["total_cost_usd"],
        "cost_breakdown": cost_breakdown_by_debate.get(row["debate_id"], []),
        "duration_seconds": row["duration_seconds"],
    }


async def start_debate(req: DebateRequest) -> dict:
    if not req.session_id or not req.session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    cache_enabled = _get_cache_enabled()
    lock_ttl_seconds = _get_lock_ttl_seconds()

    upsert_session(req.session_id, req.user_id)
    cleanup_expired_sessions()
    cleanup_old_debates()

    cache_key = build_cache_key(
        topic=req.topic,
        debater_1=req.debater_1,
        debater_2=req.debater_2,
        user_id=req.user_id,
        session_id=req.session_id,
    )
    lock_key = build_lock_key(cache_key)
    inflight_key = build_inflight_key(cache_key)

    if cache_enabled:
        cached_id = get_cached_debate_id(cache_key)
        if cached_id:
            LOG.info(
                "cache_hit",
                extra={
                    "debate_id": cached_id,
                    "session_id": req.session_id,
                    "user_id": req.user_id,
                    "cache_key": cache_key,
                },
            )
            return {"debate_id": cached_id, "cached": True}

        LOG.info(
            "cache_miss",
            extra={
                "session_id": req.session_id,
                "user_id": req.user_id,
                "cache_key": cache_key,
            },
        )

        lock_token = acquire_generation_lock(lock_key, lock_ttl_seconds)
        if not lock_token:
            inflight_id = get_inflight_debate_id(inflight_key)
            if inflight_id:
                LOG.info(
                    "cache_lock_busy_inflight",
                    extra={
                        "debate_id": inflight_id,
                        "session_id": req.session_id,
                        "user_id": req.user_id,
                        "cache_key": cache_key,
                    },
                )
                return {"debate_id": inflight_id, "cached": False, "inflight": True}

            for _ in range(2):
                await asyncio.sleep(0.3)
                cached_id = get_cached_debate_id(cache_key)
                if cached_id:
                    LOG.info(
                        "cache_hit_after_wait",
                        extra={
                            "debate_id": cached_id,
                            "session_id": req.session_id,
                            "user_id": req.user_id,
                            "cache_key": cache_key,
                        },
                    )
                    return {"debate_id": cached_id, "cached": True}

                inflight_id = get_inflight_debate_id(inflight_key)
                if inflight_id:
                    LOG.info(
                        "cache_lock_busy_inflight_after_wait",
                        extra={
                            "debate_id": inflight_id,
                            "session_id": req.session_id,
                            "user_id": req.user_id,
                            "cache_key": cache_key,
                        },
                    )
                    return {"debate_id": inflight_id, "cached": False, "inflight": True}

            lock_token = acquire_generation_lock(lock_key, lock_ttl_seconds)
            if not lock_token:
                LOG.warning(
                    "cache_lock_busy_no_inflight",
                    extra={
                        "session_id": req.session_id,
                        "user_id": req.user_id,
                        "cache_key": cache_key,
                    },
                )
                raise HTTPException(
                    status_code=409,
                    detail="debate generation in progress, retry shortly",
                )
        else:
            LOG.info(
                "cache_lock_acquired",
                extra={
                    "session_id": req.session_id,
                    "user_id": req.user_id,
                    "cache_key": cache_key,
                },
            )
    else:
        lock_token = None

    debate_id = str(uuid.uuid4())
    create_debate(
        debate_id=debate_id,
        session_id=req.session_id,
        user_id=req.user_id,
        topic=req.topic,
        debater_1=req.debater_1,
        debater_2=req.debater_2,
    )

    if cache_enabled:
        set_inflight_debate_id(inflight_key, debate_id, lock_ttl_seconds)

    LOG.info(
        "Debate created",
        extra={
            "debate_id": debate_id,
            "session_id": req.session_id,
            "user_id": req.user_id,
        },
    )

    flow_runner = _get_flow_runner()
    asyncio.create_task(
        flow_runner(
            debate_id,
            req.topic,
            req.debater_1,
            req.debater_2,
            cache_key=cache_key if cache_enabled else None,
            inflight_key=inflight_key if cache_enabled else None,
            lock_key=lock_key if cache_enabled else None,
            lock_token=lock_token if cache_enabled else None,
        )
    )

    return {"debate_id": debate_id, "cached": False}


def validate_stream_access(debate_id: str, session_id: str, user_id: str | None) -> None:
    if not session_id or not session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    owner = get_debate_owner(debate_id)
    if not owner:
        raise HTTPException(status_code=404, detail="debate not found")

    if owner["user_id"]:
        if not user_id or owner["user_id"] != user_id:
            LOG.warning(
                "Unauthorized debate stream access",
                extra={
                    "debate_id": debate_id,
                    "session_id": session_id,
                    "user_id": user_id,
                },
            )
            raise HTTPException(status_code=403, detail="not authorized")
    elif owner["session_id"] != session_id:
        LOG.warning(
            "Unauthorized debate stream access",
            extra={
                "debate_id": debate_id,
                "session_id": session_id,
                "user_id": user_id,
            },
        )
        raise HTTPException(status_code=403, detail="not authorized")


async def stream_debate_events(debate_id: str):
    stream = f"debate:{debate_id}"
    last_id = "0-0"
    redis = _get_redis_client()

    while True:
        events = redis.xread({stream: last_id}, count=1, block=10000)
        if not events:
            yield {"event": "ping", "data": "{}"}

        for _, messages in events:
            for msg_id, fields in messages:
                last_id = msg_id

                raw_data = json.loads(fields["data"])
                agent = raw_data["agent"].strip()
                output = raw_data["output"]

                try:
                    output_json = json.loads(output)
                except json.JSONDecodeError:
                    json_match = re.search(r"(\{.*\})", output, re.DOTALL)
                    if json_match:
                        try:
                            output_json = json.loads(json_match.group(1))
                        except json.JSONDecodeError:
                            output_json = {"text": output}
                    else:
                        output_json = {"text": output}

                yield {
                    "event": fields["event"],
                    "data": json.dumps({"agent": agent, **output_json}),
                }

        await asyncio.sleep(0)


def get_debates(session_id: str, user_id: str | None) -> dict:
    if not session_id or not session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    rows = list_debates_with_metrics(session_id, user_id)
    debate_ids = [row["debate_id"] for row in rows]
    cost_breakdown_by_debate = get_cost_breakdown_for_debates(debate_ids)
    debates = [_build_debate_item(row, cost_breakdown_by_debate) for row in rows]
    return {"debates": debates}


def get_debates_analytics(session_id: str, user_id: str | None) -> dict:
    if not session_id or not session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    row = get_debate_analytics_totals(session_id, user_id)
    if not row:
        return {
            "debate_count": 0,
            "total_tokens": 0,
            "total_cost_usd": 0.0,
            "total_duration_seconds": 0,
        }

    return {
        "debate_count": row["debate_count"],
        "total_tokens": row["total_tokens"],
        "total_cost_usd": row["total_cost_usd"],
        "total_duration_seconds": row["total_duration_seconds"],
    }


def get_debates_overview(session_id: str, user_id: str | None) -> dict:
    debates = get_debates(session_id, user_id)["debates"]
    analytics = get_debates_analytics(session_id, user_id)
    return {"analytics": analytics, "debates": debates}

