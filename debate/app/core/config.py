from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    api_title: str = Field(
        default="Debate API",
        description="FastAPI application title shown in docs and OpenAPI.",
    )
    cors_allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:8000",
            "http://localhost:3000",
            "http://localhost:5173",
        ],
        description="CORS allowlist for browser clients.",
    )

    database_url_override: str | None = Field(
        default=None,
        description="Optional full database URL; if unset, SQLite is used.",
    )

    # SQLite Settings
    sqlite_database_path: Path = Field(
        default=Path("data") / "debate.db",
        description="SQLite file path used when no database_url_override is set.",
    )
    sqlalchemy_echo_sql: bool = Field(
        default=False,
        description="If true, SQLAlchemy logs executed SQL statements.",
    )

    sqlite_connection_timeout_seconds: float = Field(
        default=5.0,
        ge=0.0,
        description="SQLite connection timeout.",
    )
    sqlite_busy_timeout_ms: int = Field(
        default=5000,
        ge=0,
        description="SQLite busy timeout (ms).",
    )

    session_expiration_seconds: int = Field(
        default=24 * 60 * 60,
        description="How long a user session remains valid.",
    )
    debate_retention_window_seconds: int = Field(
        default=7 * 24 * 60 * 60,
        description="How long debate records are kept before cleanup.",
    )

    # Redis Settings
    redis_hostname: str = Field(
        default="localhost",
        description="Redis host for caching and event streams.",
    )
    redis_port: int = Field(default=6379, ge=1, le=65535)
    celery_broker_url: str | None = Field(
        default=None,
        description="Optional Celery broker URL; defaults to Redis host/port.",
    )
    celery_result_backend: str | None = Field(
        default=None,
        description="Optional Celery result backend URL; defaults to broker URL.",
    )

    # Redis Cache Settings
    enable_debate_cache: bool = Field(
        default=True,
        description="Toggle debate generation cache.",
    )
    debate_cache_entry_ttl_seconds: int = Field(
        default=1800,
        ge=1,
        description="TTL for cached debate entries.",
    )
    debate_generation_lock_ttl_seconds: int = Field(
        default=240,
        ge=1,
        description="TTL for debate generation lock keys.",
    )

    cache_lock_poll_attempts: int = Field(
        default=2,
        ge=1,
        description="How many times to poll for cache lock release.",
    )
    cache_lock_poll_interval_seconds: float = Field(
        default=0.3,
        ge=0.0,
        description="Delay between cache lock polling attempts.",
    )
    stream_idle_poll_interval_seconds: float = Field(
        default=0.0,
        ge=0.0,
        description="Sleep interval when SSE stream is idle.",
    )
    redis_stream_read_batch_size: int = Field(
        default=1,
        ge=1,
        description="Max Redis stream entries read per poll.",
    )
    redis_stream_block_timeout_ms: int = Field(
        default=10000,
        ge=1,
        description="Redis stream blocking read timeout (ms).",
    )


    # LLM Models Settings 
    debater_one_llm_model: str = Field(
        default="groq/llama-3.1-8b-instant",
        description="Model for debater one.",
    )
    debater_two_llm_model: str = Field(
        default="groq/qwen/qwen3-32b",
        description="Model for debater two.",
    )
    judge_llm_model: str = Field(
        default="groq/llama-3.3-70b-versatile",
        description="Model for the judge.",
    )
    presenter_llm_model: str = Field(
        default="groq/openai/gpt-oss-120b",
        description="Model for the presenter.",
    )
    summary_llm_model: str = Field(
        default="groq/openai/gpt-oss-120b",
        description="Model for summaries.",
    )

    # Delay settings in the debate to avoid rate limits
    intro_delay_seconds: float = Field(
        default=10.0,
        ge=0.0,
        description="Delay before the intro phase.",
    )
    turn_delay_seconds: float = Field(
        default=18.0,
        ge=0.0,
        description="Delay between debate turns.",
    )
    conclusion_delay_seconds: float = Field(
        default=0.0,
        ge=0.0,
        description="Delay before the conclusion phase.",
    )
    judge_delay_seconds: float = Field(
        default=0.0,
        ge=0.0,
        description="Delay before judge output.",
    )
    debate_retry_max_attempts: int = Field(
        default=4,
        ge=1,
        description="Max attempts for transient/rate-limit failures in debate generation.",
    )
    debate_retry_initial_wait_seconds: float = Field(
        default=1.0,
        ge=0.0,
        description="Initial backoff delay for debate retries.",
    )
    debate_retry_max_wait_seconds: float = Field(
        default=20.0,
        ge=0.0,
        description="Maximum backoff delay for debate retries.",
    )

    @field_validator("cors_allowed_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url_override and self.database_url_override.strip():
            return self.database_url_override
        db_path = self.sqlite_database_path
        if not db_path.is_absolute():
            db_path = (Path.cwd() / db_path).resolve()
        return f"sqlite:///{db_path.as_posix()}"


settings = Settings()
