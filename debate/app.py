from fastapi import FastAPI
from src.debate.main import run_debate_flow

app: FastAPI = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/debate")
def create_debate(topic: str, debater_1: str, debater_2: str):
    return run_debate_flow(topic, debater_1, debater_2)