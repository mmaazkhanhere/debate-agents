from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Debate API"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:8000",
            "http://localhost:3000",
            "http://localhost:5173",
        ]
    )

    database_url: str | None = None
    sqlite_db_path: Path = Path("data") / "debate.db"
    sql_echo: bool = False

    session_ttl_seconds: int = 24 * 60 * 60
    debate_retention_seconds: int = 7 * 24 * 60 * 60

    redis_host: str = "localhost"
    redis_port: int = Field(default=6379, ge=1, le=65535)
    debate_cache_enabled: bool = True
    debate_cache_ttl_seconds: int = Field(default=1800, ge=1)
    debate_lock_ttl_seconds: int = Field(default=240, ge=1)

    cache_lock_check_attempts: int = Field(default=2, ge=1)
    cache_lock_check_sleep_seconds: float = Field(default=0.3, ge=0.0)
    stream_idle_sleep_seconds: float = Field(default=0.0, ge=0.0)
    redis_stream_read_count: int = Field(default=1, ge=1)
    redis_stream_block_ms: int = Field(default=10000, ge=1)

    sqlite_connect_timeout_seconds: float = Field(default=5.0, ge=0.0)
    sqlite_busy_timeout_ms: int = Field(default=5000, ge=0)

    debater_1_model: str = "groq/llama-3.1-8b-instant"
    debater_2_model: str = "groq/qwen/qwen3-32b"
    judge_model: str = "groq/llama-3.3-70b-versatile"
    presenter_model: str = "groq/openai/gpt-oss-120b"
    summary_model: str = "groq/openai/gpt-oss-120b"

    intro_sleep_sec: float = Field(default=10.0, ge=0.0)
    turn_sleep_sec: float = Field(default=18.0, ge=0.0)
    conclude_sleep_sec: float = Field(default=0.0, ge=0.0)
    judge_sleep_sec: float = Field(default=0.0, ge=0.0)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url and self.database_url.strip():
            return self.database_url
        db_path = self.sqlite_db_path
        if not db_path.is_absolute():
            db_path = (Path.cwd() / db_path).resolve()
        return f"sqlite:///{db_path.as_posix()}"


settings = Settings()
