from sqlalchemy import Float, Index, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class SessionRecord(Base):
    __tablename__ = "sessions"

    session_id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[int] = mapped_column(Integer, nullable=False)
    expires_at: Mapped[int] = mapped_column(Integer, nullable=False)
    last_seen_at: Mapped[int] = mapped_column(Integer, nullable=False)


class DebateRecord(Base):
    __tablename__ = "debates"
    __table_args__ = (
        Index("idx_debates_session_id", "session_id"),
        Index("idx_debates_user_id", "user_id"),
        Index("idx_debates_created_at", "created_at"),
    )

    debate_id: Mapped[str] = mapped_column(String, primary_key=True)
    session_id: Mapped[str] = mapped_column(String, nullable=False)
    user_id: Mapped[str | None] = mapped_column(String, nullable=True)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    debater_1: Mapped[str] = mapped_column(String, nullable=False)
    debater_2: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    completed_at: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(String, nullable=True)
    summary: Mapped[str | None] = mapped_column(String, nullable=True)


class DebateUsageCall(Base):
    __tablename__ = "debate_usage_calls"
    __table_args__ = (Index("idx_usage_calls_debate_id", "debate_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    debate_id: Mapped[str] = mapped_column(String, nullable=False)
    model: Mapped[str] = mapped_column(String, nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    output_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    cost_usd: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[int] = mapped_column(Integer, nullable=False)


class DebateMetric(Base):
    __tablename__ = "debate_metrics"

    debate_id: Mapped[str] = mapped_column(String, primary_key=True)
    total_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    total_cost_usd: Mapped[float] = mapped_column(Float, nullable=False)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    updated_at: Mapped[int] = mapped_column(Integer, nullable=False)

