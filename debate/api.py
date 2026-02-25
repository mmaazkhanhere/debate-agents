import asyncio

from app.main import app
from app import debate_orchestration
from src.flow import run_debate_flow

# Backward-compatible module attributes used by existing tests/integrations.
DEBATE_CACHE_ENABLED = debate_orchestration.DEBATE_CACHE_ENABLED
DEBATE_LOCK_TTL_SECONDS = debate_orchestration.DEBATE_LOCK_TTL_SECONDS
redis_client = debate_orchestration.redis_client

__all__ = [
    "app",
    "asyncio",
    "run_debate_flow",
    "DEBATE_CACHE_ENABLED",
    "DEBATE_LOCK_TTL_SECONDS",
    "redis_client",
]
