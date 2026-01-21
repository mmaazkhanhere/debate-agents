import time
import uuid
import asyncio

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, BackgroundTasks
from sse_starlette.sse import EventSourceResponse

from src.flow import run_debate_flow
from src.utils import redis_client
from pydantic import BaseModel

class DebateRequest(BaseModel):
    topic: str
    debater_1: str
    debater_2: str


app: FastAPI = FastAPI()

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
def start_debate(req: DebateRequest, bg: BackgroundTasks):
    debate_id: str = str(uuid.uuid4())
    bg.add_task(
        run_debate_flow,
        debate_id,
        req.topic,
        req.debater_1,
        req.debater_2,
    )
    return {"debate_id": debate_id}


@app.get("/debate/{debate_id}/events")
async def debate_events(debate_id: str):
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
                continue

            for _, messages in events:
                for msg_id, fields in messages:
                    last_id = msg_id
                    yield {
                        "event": fields["event"],
                        "data": fields["data"],
                    }

            await asyncio.sleep(0)

    return EventSourceResponse(generator())