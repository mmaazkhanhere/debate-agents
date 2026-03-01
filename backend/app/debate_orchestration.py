import asyncio
import json
import logging
import re
import uuid

from fastapi import HTTPException

from app.core.config import settings
from app.helpers import debate_helpers
from app.schemas.debate import DebateRequest
from app.services import debate_service
from app.cache import (
    DEBATE_CACHE_ENABLED as _DEFAULT_DEBATE_CACHE_ENABLED,
    DEBATE_LOCK_TTL_SECONDS as _DEFAULT_DEBATE_LOCK_TTL_SECONDS,
    acquire_generation_lock,
    build_cache_key,
    build_inflight_key,
    build_lock_key,
    delete_inflight_debate_id,
    get_cached_debate_id,
    get_inflight_debate_id,
    events_redis_client as _DEFAULT_EVENTS_REDIS_CLIENT,
    release_generation_lock,
    set_inflight_debate_id,
)

LOG = logging.getLogger("debate_api")

# Compatibility globals retained for monkeypatching in tests.
DEBATE_CACHE_ENABLED = _DEFAULT_DEBATE_CACHE_ENABLED
DEBATE_LOCK_TTL_SECONDS = _DEFAULT_DEBATE_LOCK_TTL_SECONDS
redis_client = _DEFAULT_EVENTS_REDIS_CLIENT
LOCK_CHECK_ATTEMPTS = settings.cache_lock_poll_attempts
LOCK_CHECK_SLEEP_SECONDS = settings.cache_lock_poll_interval_seconds
STREAM_IDLE_SLEEP_SECONDS = settings.stream_idle_poll_interval_seconds
REDIS_STREAM_READ_COUNT = settings.redis_stream_read_batch_size
REDIS_STREAM_BLOCK_MS = settings.redis_stream_block_timeout_ms


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


def _get_task_dispatcher():
    api_module = _maybe_get_api_module()
    if api_module is not None and hasattr(api_module, "enqueue_debate_task"):
        return getattr(api_module, "enqueue_debate_task")

    return enqueue_debate_task


def enqueue_debate_task(
    debate_id: str,
    topic: str,
    debater_1: str,
    debater_2: str,
    cache_key: str | None = None,
    inflight_key: str | None = None,
    lock_key: str | None = None,
    lock_token: str | None = None,
) -> str:
    from app.tasks.debate_tasks import run_debate_task

    result = run_debate_task.delay(
        debate_id,
        topic,
        debater_1,
        debater_2,
        cache_key=cache_key,
        inflight_key=inflight_key,
        lock_key=lock_key,
        lock_token=lock_token,
    )
    return result.id


async def start_debate(req: DebateRequest) -> dict:
    if not req.session_id or not req.session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    cache_enabled = _get_cache_enabled()
    lock_ttl_seconds = _get_lock_ttl_seconds()

    debate_service.upsert_session(req.session_id, req.user_id)
    debate_helpers.cleanup_expired_sessions()
    debate_helpers.cleanup_old_debates()

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

            for _ in range(LOCK_CHECK_ATTEMPTS):
                await asyncio.sleep(LOCK_CHECK_SLEEP_SECONDS)
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
    debate_service.create_debate(
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

    task_dispatcher = _get_task_dispatcher()
    try:
        task_dispatcher(
            debate_id,
            req.topic,
            req.debater_1,
            req.debater_2,
            cache_key=cache_key if cache_enabled else None,
            inflight_key=inflight_key if cache_enabled else None,
            lock_key=lock_key if cache_enabled else None,
            lock_token=lock_token if cache_enabled else None,
        )
    except Exception as exc:
        if cache_enabled and inflight_key:
            delete_inflight_debate_id(inflight_key)
        if cache_enabled and lock_key and lock_token:
            release_generation_lock(lock_key, lock_token)
        debate_service.update_debate_status(debate_id, "failed", error_message=str(exc))
        raise HTTPException(status_code=503, detail="failed to queue debate") from exc

    return {"debate_id": debate_id, "cached": False}


def validate_stream_access(debate_id: str, session_id: str, user_id: str | None) -> None:
    if not session_id or not session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    owner = debate_service.get_debate_owner(debate_id)
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
        events = redis.xread(
            {stream: last_id},
            count=REDIS_STREAM_READ_COUNT,
            block=REDIS_STREAM_BLOCK_MS,
        )
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

        await asyncio.sleep(STREAM_IDLE_SLEEP_SECONDS)
