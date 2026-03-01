from fastapi import APIRouter

from app.cache import events_redis_client, redis_client

router = APIRouter()


@router.get("/health")
def get_health():
    return {"status": "ok"}


@router.get("/redis-test")
def redis_test():
    cache_key = "ping:cache"
    events_key = "ping:events"

    redis_client.set(cache_key, "pong")
    events_redis_client.set(events_key, "pong")

    return {
        "cache_redis": redis_client.get(cache_key),
        "events_redis": events_redis_client.get(events_key),
    }
