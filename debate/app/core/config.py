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

