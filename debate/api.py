import asyncio

from app.main import app
from app.services import debate_service
from src.flow import run_debate_flow

# Backward-compatible module attributes used by existing tests/integrations.
DEBATE_CACHE_ENABLED = debate_service.DEBATE_CACHE_ENABLED
DEBATE_LOCK_TTL_SECONDS = debate_service.DEBATE_LOCK_TTL_SECONDS
redis_client = debate_service.redis_client

__all__ = [
    "app",
    "asyncio",
    "run_debate_flow",
    "DEBATE_CACHE_ENABLED",
    "DEBATE_LOCK_TTL_SECONDS",
    "redis_client",
]
