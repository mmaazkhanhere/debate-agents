from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

_database_url: str = settings.sqlalchemy_database_url


def _build_engine(database_url: str):
    connect_args: dict[str, object] = {}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    return create_engine(
        database_url,
        echo=settings.sql_echo,
        pool_pre_ping=True,
        connect_args=connect_args,
    )


engine = _build_engine(_database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)


def get_database_url() -> str:
    return _database_url


def get_sqlite_database_path() -> Path | None:
    url: URL = make_url(_database_url)
    if not url.drivername.startswith("sqlite"):
        return None
    if not url.database or url.database == ":memory:":
        return None
    return Path(url.database).resolve()


def reconfigure_database(database_url: str) -> None:
    global _database_url, engine, SessionLocal

    _database_url = database_url
    engine.dispose()
    engine = _build_engine(_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

