from pydantic import BaseModel, Field
from typing import Literal

class TurnArgument(BaseModel):
    type: Literal["attack", "defense", "counter", "framing", "clarification"]
    text: str
    confidence: int = Field(ge=1, le=100)

class DebateTurn(BaseModel):
    turn_id: str = Field(description="Unique identifier for the turn")
    debater: str = Field(description="Name of the debater")
    argument: TurnArgument = Field(description="Argument made by the debater")
    
# class StanceStrategy(BaseModel):
#     stance: str = Field(description="Your ideological stance on the topic. Select either Pro or Against")
#     stance_summary: str = Field(description="A concise summary of your ideological stance", max_length=100)
#     core_positions: List[str] = Field(description="Core positions of your ideological stance", max_items=3)

class DebateState(BaseModel):
    topic: str = ""
    rounds: int = 0
    current_round: int = 1
    moderator_introduction: str = ""
    debater_1: str = ""
    debater_2: str = ""
    debater_1_persona: str = ""
    debater_2_persona: str = ""
    turns: list[DebateTurn] = Field(default_factory=list)
    # @property
    # def transcript_text(self) -> str:
    #     """Human-readable transcript for judge input or logs."""
    #     lines: list[str] = []
    #     for idx, t in enumerate(self.turns, start=1):
    #         joined = " ".join(arg.text.strip() for arg in t.arguments)
    #         lines.append(f"{idx:02d}. {t.debater}: {joined}")
    #     return "\n".join(lines)

# class Score(BaseModel):
#     debater_1: int
#     debater_2: int

# class BestQuotes(BaseModel):
#     debater_1: str
#     debater_2: str

# class JudgeVerdict(BaseModel):
#     judge: str
#     winner: str # debater_1 | debater_2
#     confidence: float
#     score: Score
#     best_quotes: BestQuotes
#     reasoning: str
