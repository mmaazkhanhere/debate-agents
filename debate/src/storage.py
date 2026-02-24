import sqlite3
from contextlib import contextmanager
from pathlib import Path

from app.core.config import settings
from app.helpers import debate_helpers
from app.db.session import get_sqlite_database_path, reconfigure_database
from app.services import debate_service

DB_PATH = get_sqlite_database_path() or (Path.cwd() / "data" / "debate.db")
SESSION_TTL_SECONDS = settings.session_ttl_seconds
DEBATE_RETENTION_SECONDS = settings.debate_retention_seconds
SQLITE_CONNECT_TIMEOUT_SECONDS = settings.sqlite_connect_timeout_seconds
SQLITE_BUSY_TIMEOUT_MS = settings.sqlite_busy_timeout_ms


def _refresh_db_path_from_engine() -> None:
    global DB_PATH
    resolved = get_sqlite_database_path()
    if resolved is not None:
        DB_PATH = resolved


def _connect() -> sqlite3.Connection:
    _refresh_db_path_from_engine()
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(
        DB_PATH,
        timeout=SQLITE_CONNECT_TIMEOUT_SECONDS,
        check_same_thread=False,
    )
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute(f"PRAGMA busy_timeout={SQLITE_BUSY_TIMEOUT_MS};")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


@contextmanager
def get_db():
    conn = _connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    # Keep compatibility with tests that monkeypatch DB_PATH before init_db().
    db_path = Path(DB_PATH)
    if not db_path.is_absolute():
        db_path = (Path.cwd() / db_path).resolve()
    reconfigure_database(f"sqlite:///{db_path.as_posix()}")
    debate_service.init_db()


def upsert_session(session_id: str, user_id: str | None) -> None:
    debate_service.upsert_session(session_id, user_id)


def create_debate(
    debate_id: str,
    session_id: str,
    user_id: str | None,
    topic: str,
    debater_1: str,
    debater_2: str,
) -> None:
    debate_service.create_debate(debate_id, session_id, user_id, topic, debater_1, debater_2)


def get_debate_owner(debate_id: str):
    return debate_service.get_debate_owner(debate_id)


def update_debate_status(
    debate_id: str,
    status: str,
    error_message: str | None = None,
) -> None:
    debate_service.update_debate_status(debate_id, status, error_message)


def update_debate_summary(debate_id: str, summary: str) -> None:
    debate_service.update_debate_summary(debate_id, summary)


def is_authorized(debate_id: str, session_id: str, user_id: str | None) -> bool:
    return debate_helpers.is_authorized(debate_id, session_id, user_id)


def cleanup_expired_sessions() -> int:
    return debate_helpers.cleanup_expired_sessions()


def cleanup_old_debates(max_age_seconds: int = DEBATE_RETENTION_SECONDS) -> int:
    return debate_helpers.cleanup_old_debates(max_age_seconds=max_age_seconds)


def record_llm_call(
    debate_id: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    cost_usd: float,
) -> None:
    debate_helpers.record_llm_call(
        debate_id=debate_id,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=cost_usd,
    )


def update_debate_metrics(
    debate_id: str,
    tokens_delta: int,
    cost_delta: float,
    duration_seconds: int | None = None,
) -> None:
    debate_service.update_debate_metrics(
        debate_id=debate_id,
        tokens_delta=tokens_delta,
        cost_delta=cost_delta,
        duration_seconds=duration_seconds,
    )


def finalize_debate_duration(debate_id: str) -> None:
    debate_service.finalize_debate_duration(debate_id)


def list_debates_with_metrics(session_id: str, user_id: str | None):
    return debate_service.list_debates_with_metrics(session_id, user_id)


def get_debate_analytics_totals(session_id: str, user_id: str | None):
    return debate_service.get_debate_analytics_totals(session_id, user_id)


def get_cost_breakdown_for_debates(debate_ids: list[str]) -> dict[str, list[dict]]:
    return debate_service.get_cost_breakdown_for_debates(debate_ids)
