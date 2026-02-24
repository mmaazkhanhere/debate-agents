from sqlalchemy import inspect

import app.db.session as db_session
from app.db.models import Base


def _migrate_legacy_tables() -> None:
    inspector = inspect(db_session.engine)
    table_names = set(inspector.get_table_names())
    if "debates" not in table_names:
        return

    existing_columns = {column["name"] for column in inspector.get_columns("debates")}
    missing_columns = []
    if "completed_at" not in existing_columns:
        missing_columns.append("ALTER TABLE debates ADD COLUMN completed_at INTEGER NULL")
    if "error_message" not in existing_columns:
        missing_columns.append("ALTER TABLE debates ADD COLUMN error_message TEXT NULL")
    if "summary" not in existing_columns:
        missing_columns.append("ALTER TABLE debates ADD COLUMN summary TEXT NULL")

    if not missing_columns:
        return

    with db_session.engine.begin() as conn:
        for statement in missing_columns:
            conn.exec_driver_sql(statement)


def init_db() -> None:
    Base.metadata.create_all(bind=db_session.engine)
    _migrate_legacy_tables()

