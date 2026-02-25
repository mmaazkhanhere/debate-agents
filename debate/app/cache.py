import hashlib
import uuid

import redis

from app.core.config import settings

REDIS_HOST = settings.redis_hostname
REDIS_PORT = settings.redis_port

DEBATE_CACHE_ENABLED = settings.enable_debate_cache
DEBATE_CACHE_TTL_SECONDS = settings.debate_cache_entry_ttl_seconds
DEBATE_LOCK_TTL_SECONDS = settings.debate_generation_lock_ttl_seconds

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    decode_responses=True,
)


def _normalize_cache_input(value: str) -> str:
    if value is None:
        return ""
    collapsed = " ".join(value.strip().split())
    return collapsed.lower()


def build_cache_key(
    topic: str,
    debater_1: str,
    debater_2: str,
    user_id: str | None,
    session_id: str,
) -> str:
    scope = f"user:{user_id}" if user_id else f"session:{session_id}"
    normalized = "|".join(
        [
            _normalize_cache_input(topic),
            _normalize_cache_input(debater_1),
            _normalize_cache_input(debater_2),
        ]
    )
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return f"debate:cache:{scope}:{digest}"


def build_lock_key(cache_key: str) -> str:
    return cache_key.replace("debate:cache:", "debate:lock:", 1)


def build_inflight_key(cache_key: str) -> str:
    return cache_key.replace("debate:cache:", "debate:inflight:", 1)


def get_cached_debate_id(cache_key: str) -> str | None:
    return redis_client.get(cache_key)


def set_cached_debate_id(cache_key: str, debate_id: str, ttl_seconds: int) -> None:
    redis_client.setex(cache_key, ttl_seconds, debate_id)


def acquire_generation_lock(lock_key: str, ttl_seconds: int) -> str | None:
    token = uuid.uuid4().hex
    acquired = redis_client.set(lock_key, token, nx=True, ex=ttl_seconds)
    return token if acquired else None


def release_generation_lock(lock_key: str, token: str) -> bool:
    script = """
    if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
    else
        return 0
    end
    """
    try:
        result = redis_client.eval(script, 1, lock_key, token)
        return result == 1
    except redis.RedisError:
        return False


def set_inflight_debate_id(inflight_key: str, debate_id: str, ttl_seconds: int) -> None:
    redis_client.setex(inflight_key, ttl_seconds, debate_id)


def get_inflight_debate_id(inflight_key: str) -> str | None:
    return redis_client.get(inflight_key)


def delete_inflight_debate_id(inflight_key: str) -> None:
    redis_client.delete(inflight_key)
