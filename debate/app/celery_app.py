from celery import Celery

from app.core.config import settings


def _build_redis_url() -> str:
    if settings.celery_broker_url and settings.celery_broker_url.strip():
        return settings.celery_broker_url
    return f"redis://{settings.redis_hostname}:{settings.redis_port}/0"


def _build_result_backend_url(broker_url: str) -> str:
    if settings.celery_result_backend and settings.celery_result_backend.strip():
        return settings.celery_result_backend
    return broker_url


_broker_url = _build_redis_url()

celery_app = Celery(
    "debate",
    broker=_broker_url,
    backend=_build_result_backend_url(_broker_url),
    include=["app.tasks.debate_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    task_track_started=True,
    worker_prefetch_multiplier=1,
)
