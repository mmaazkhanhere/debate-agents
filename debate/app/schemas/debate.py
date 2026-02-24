from pydantic import BaseModel


class DebateRequest(BaseModel):
    topic: str
    debater_1: str
    debater_2: str
    session_id: str
    user_id: str | None = None

