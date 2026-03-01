import asyncio

from app.celery_app import celery_app
from app.services import debate_service
from src.flow import run_debate_flow


def _run_async(coro):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    if loop.is_running():
        new_loop = asyncio.new_event_loop()
        try:
            return new_loop.run_until_complete(coro)
        finally:
            new_loop.close()

    return loop.run_until_complete(coro)


@celery_app.task(name="debate.run_debate")
def run_debate_task(
    debate_id: str,
    topic: str,
    debater_1: str,
    debater_2: str,
    cache_key: str | None = None,
    inflight_key: str | None = None,
    lock_key: str | None = None,
    lock_token: str | None = None,
) -> None:
    debate_service.init_db()
    _run_async(
        run_debate_flow(
            debate_id,
            topic,
            debater_1,
            debater_2,
            cache_key=cache_key,
            inflight_key=inflight_key,
            lock_key=lock_key,
            lock_token=lock_token,
        )
    )
