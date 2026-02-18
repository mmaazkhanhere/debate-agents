import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "data" / "debate.db"
SESSION_TTL_SECONDS = 24 * 60 * 60
DEBATE_RETENTION_SECONDS = 7 * 24 * 60 * 60


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=5, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
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
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NULL,
                created_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                last_seen_at INTEGER NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS debates (
                debate_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                user_id TEXT NULL,
                topic TEXT NOT NULL,
                debater_1 TEXT NOT NULL,
                debater_2 TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                status TEXT NOT NULL
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_debates_session_id ON debates(session_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_debates_user_id ON debates(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_debates_created_at ON debates(created_at)")


def upsert_session(session_id: str, user_id: str | None) -> None:
    now = int(time.time())
    expires_at = now + SESSION_TTL_SECONDS
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO sessions (session_id, user_id, created_at, expires_at, last_seen_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(session_id) DO UPDATE SET
                user_id = CASE
                    WHEN sessions.user_id IS NULL AND excluded.user_id IS NOT NULL
                    THEN excluded.user_id
                    ELSE sessions.user_id
                END,
                last_seen_at = excluded.last_seen_at
            """,
            (session_id, user_id, now, expires_at, now),
        )


def create_debate(
    debate_id: str,
    session_id: str,
    user_id: str | None,
    topic: str,
    debater_1: str,
    debater_2: str,
) -> None:
    now = int(time.time())
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO debates (
                debate_id,
                session_id,
                user_id,
                topic,
                debater_1,
                debater_2,
                created_at,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (debate_id, session_id, user_id, topic, debater_1, debater_2, now, "running"),
        )


def get_debate_owner(debate_id: str) -> sqlite3.Row | None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT debate_id, session_id, user_id FROM debates WHERE debate_id = ?",
            (debate_id,),
        ).fetchone()
        return row


def is_authorized(debate_id: str, session_id: str, user_id: str | None) -> bool:
    owner = get_debate_owner(debate_id)
    if not owner:
        return False
    if owner["user_id"]:
        return user_id is not None and owner["user_id"] == user_id
    return owner["session_id"] == session_id


def cleanup_expired_sessions() -> int:
    now = int(time.time())
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM sessions WHERE expires_at < ?",
            (now,),
        )
        return cur.rowcount


def cleanup_old_debates(max_age_seconds: int = DEBATE_RETENTION_SECONDS) -> int:
    threshold = int(time.time()) - max_age_seconds
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM debates WHERE created_at < ?",
            (threshold,),
        )
        return cur.rowcount
