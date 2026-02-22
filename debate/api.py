import time
import uuid
import asyncio
import json
import logging

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, HTTPException, Query
from sse_starlette.sse import EventSourceResponse

from src.flow import run_debate_flow
from src.utils import (
    redis_client,
    DEBATE_CACHE_ENABLED,
    DEBATE_LOCK_TTL_SECONDS,
    build_cache_key,
    build_lock_key,
    build_inflight_key,
    get_cached_debate_id,
    acquire_generation_lock,
    set_inflight_debate_id,
    get_inflight_debate_id,
)
from src.storage import (
    init_db,
    upsert_session,
    create_debate,
    get_debate_owner,
    cleanup_expired_sessions,
    cleanup_old_debates,
)
from pydantic import BaseModel

class DebateRequest(BaseModel):
    topic: str
    debater_1: str
    debater_2: str
    session_id: str
    user_id: str | None = None


app: FastAPI = FastAPI()
LOG = logging.getLogger("debate_api")

init_db()

origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"Process time: {process_time}")
    return response

@app.get("/health")
def get_health():
    return {"status": "ok"}


@app.get("/redis-test")
def redis_test():
    redis_client.set("ping", "pong")
    return {"value": redis_client.get("ping")}

@app.post("/debate")
async def start_debate(req: DebateRequest):
    if not req.session_id or not req.session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    upsert_session(req.session_id, req.user_id)
    cleanup_expired_sessions()
    cleanup_old_debates()

    cache_key = build_cache_key(
        topic=req.topic,
        debater_1=req.debater_1,
        debater_2=req.debater_2,
        user_id=req.user_id,
        session_id=req.session_id,
    )
    lock_key = build_lock_key(cache_key)
    inflight_key = build_inflight_key(cache_key)

    if DEBATE_CACHE_ENABLED:
        cached_id = get_cached_debate_id(cache_key)
        if cached_id:
            LOG.info(
                "cache_hit",
                extra={
                    "debate_id": cached_id,
                    "session_id": req.session_id,
                    "user_id": req.user_id,
                    "cache_key": cache_key,
                },
            )
            return {"debate_id": cached_id, "cached": True}

        LOG.info(
            "cache_miss",
            extra={
                "session_id": req.session_id,
                "user_id": req.user_id,
                "cache_key": cache_key,
            },
        )
        lock_token = acquire_generation_lock(lock_key, DEBATE_LOCK_TTL_SECONDS)
        if not lock_token:
            inflight_id = get_inflight_debate_id(inflight_key)
            if inflight_id:
                LOG.info(
                    "cache_lock_busy_inflight",
                    extra={
                        "debate_id": inflight_id,
                        "session_id": req.session_id,
                        "user_id": req.user_id,
                        "cache_key": cache_key,
                    },
                )
                return {"debate_id": inflight_id, "cached": False, "inflight": True}

            # Briefly wait for the other request to fill the cache/inflight entry.
            for _ in range(2):
                await asyncio.sleep(0.3)
                cached_id = get_cached_debate_id(cache_key)
                if cached_id:
                    LOG.info(
                        "cache_hit_after_wait",
                        extra={
                            "debate_id": cached_id,
                            "session_id": req.session_id,
                            "user_id": req.user_id,
                            "cache_key": cache_key,
                        },
                    )
                    return {"debate_id": cached_id, "cached": True}
                inflight_id = get_inflight_debate_id(inflight_key)
                if inflight_id:
                    LOG.info(
                        "cache_lock_busy_inflight_after_wait",
                        extra={
                            "debate_id": inflight_id,
                            "session_id": req.session_id,
                            "user_id": req.user_id,
                            "cache_key": cache_key,
                        },
                    )
                    return {"debate_id": inflight_id, "cached": False, "inflight": True}

            # Try to acquire lock again before giving up.
            lock_token = acquire_generation_lock(lock_key, DEBATE_LOCK_TTL_SECONDS)
            if not lock_token:
                LOG.warning(
                    "cache_lock_busy_no_inflight",
                    extra={
                        "session_id": req.session_id,
                        "user_id": req.user_id,
                        "cache_key": cache_key,
                    },
                )
                raise HTTPException(
                    status_code=409,
                    detail="debate generation in progress, retry shortly",
                )
        else:
            LOG.info(
                "cache_lock_acquired",
                extra={
                    "session_id": req.session_id,
                    "user_id": req.user_id,
                    "cache_key": cache_key,
                },
            )
    else:
        lock_token = None

    debate_id: str = str(uuid.uuid4())
    create_debate(
        debate_id=debate_id,
        session_id=req.session_id,
        user_id=req.user_id,
        topic=req.topic,
        debater_1=req.debater_1,
        debater_2=req.debater_2,
    )
    if DEBATE_CACHE_ENABLED:
        set_inflight_debate_id(inflight_key, debate_id, DEBATE_LOCK_TTL_SECONDS)

    LOG.info(
        "Debate created",
        extra={
            "debate_id": debate_id,
            "session_id": req.session_id,
            "user_id": req.user_id,
        },
    )
    asyncio.create_task(
        run_debate_flow(
            debate_id,
            req.topic,
            req.debater_1,
            req.debater_2,
            cache_key=cache_key if DEBATE_CACHE_ENABLED else None,
            inflight_key=inflight_key if DEBATE_CACHE_ENABLED else None,
            lock_key=lock_key if DEBATE_CACHE_ENABLED else None,
            lock_token=lock_token if DEBATE_CACHE_ENABLED else None,
        )
    )
    return {"debate_id": debate_id, "cached": False}


@app.get("/debate/{debate_id}/events")
async def debate_events(
    debate_id: str,
    session_id: str = Query(...),
    user_id: str | None = Query(default=None),
):
    if not session_id or not session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    owner = get_debate_owner(debate_id)
    if not owner:
        raise HTTPException(status_code=404, detail="debate not found")
    if owner["user_id"]:
        if not user_id or owner["user_id"] != user_id:
            LOG.warning(
                "Unauthorized debate stream access",
                extra={
                    "debate_id": debate_id,
                    "session_id": session_id,
                    "user_id": user_id,
                },
            )
            raise HTTPException(status_code=403, detail="not authorized")
    else:
        if owner["session_id"] != session_id:
            LOG.warning(
                "Unauthorized debate stream access",
                extra={
                    "debate_id": debate_id,
                    "session_id": session_id,
                    "user_id": user_id,
                },
            )
            raise HTTPException(status_code=403, detail="not authorized")

    stream = f"debate:{debate_id}"
    last_id = "0-0"

    async def generator():
        nonlocal last_id

        while True:
            events = redis_client.xread(
                {stream: last_id},
                count=1,
                block=10000,
            )

            if not events:
                yield {
                    "event": "ping",
                    "data": "{}",
                }

            for _, messages in events:
                for msg_id, fields in messages:
                    last_id = msg_id

                    raw_data = json.loads(fields["data"])   # 1️⃣ parse Redis data
                    agent = raw_data["agent"].strip()

                    output = raw_data["output"]

                    # 2️⃣ parse output IF it is JSON
                    try:
                        # Try direct parse first
                        output_json = json.loads(output)
                    except json.JSONDecodeError:
                        # If direct parse fails, try to find JSON block
                        import re
                        json_match = re.search(r"(\{.*\})", output, re.DOTALL)
                        if json_match:
                            try:
                                output_json = json.loads(json_match.group(1))
                            except json.JSONDecodeError:
                                output_json = {"text": output}
                        else:
                            output_json = {"text": output}

                    yield {
                        "event": fields["event"],
                        "data": json.dumps({
                            "agent": agent,
                            **output_json
                        })
                    }

            await asyncio.sleep(0)

    return EventSourceResponse(generator())
