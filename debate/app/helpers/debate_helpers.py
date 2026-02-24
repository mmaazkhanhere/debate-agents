import time

from sqlalchemy import delete

from app.core.config import settings
from app.db.models import DebateRecord, DebateUsageCall, SessionRecord
from app.db.session import session_scope
from app.services import debate_service


def is_authorized(debate_id: str, session_id: str, user_id: str | None) -> bool:
    owner = debate_service.get_debate_owner(debate_id)
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
