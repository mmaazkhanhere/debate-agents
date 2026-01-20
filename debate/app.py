import time
import asyncio

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from src.debate.main import run_debate_flow

agents_output_queue = asyncio.Queue()

app: FastAPI = FastAPI()

origins = [
    "http://localhost:8000",
    "http://localhost:3000"
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


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    topic: str,
    debater_1: str,
    debater_2: str
):
    await websocket.accept()
    await websocket.send_text("Starting the debate!")

    queue: asyncio.Queue[str] = asyncio.Queue()

    debate_task = asyncio.create_task(
        run_debate_flow(topic, debater_1, debater_2, queue)
    )

    try:
        while True:
            message = await queue.get()
            await websocket.send_text(message)

            if message == "[DONE]":
                await websocket.close()
                break

    except WebSocketDisconnect:
        print("Client disconnected")

    except Exception as e:
        print(f"WebSocket error: {e}")

    finally:
        if not debate_task.done():
            debate_task.cancel()

