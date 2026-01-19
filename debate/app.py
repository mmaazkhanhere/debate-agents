from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, Request
from src.debate.main import run_debate_flow
import time

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
    return response

@app.get("/health")
def get_health():
    return {"status": "ok"}

@app.post("/debate")
def create_debate(topic: str, debater_1: str, debater_2: str):
    return run_debate_flow(topic, debater_1, debater_2)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept() # accpet websocket connection to allow bidirectional communication
    while True: #continuously receive messages from the client
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")