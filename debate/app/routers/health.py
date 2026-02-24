from fastapi import APIRouter

from app.use_cases import debate_orchestration

router = APIRouter()


@router.get("/health")
def get_health():
    return {"status": "ok"}


@router.get("/redis-test")
def redis_test():
    redis = debate_orchestration._get_redis_client()
    redis.set("ping", "pong")
    return {"value": redis.get("ping")}
