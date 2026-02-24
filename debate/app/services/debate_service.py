import time

from sqlalchemy import func, select
from app.db.base import init_db as init_database
from app.db.models import DebateMetric, DebateRecord, DebateUsageCall, SessionRecord
from app.db.session import session_scope


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
