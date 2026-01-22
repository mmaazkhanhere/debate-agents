from pydantic import BaseModel, Field
from typing import Literal
from uuid import uuid4

class TurnArgument(BaseModel):
    type: Literal["attack", "defense", "counter", "framing", "clarification"] = Field(description="Strategic role of this response: attack = challenge opponent’s claim, defense = protect own claim, counter = rebut a specific point, framing = redefine the narrative, clarification = explain or refine a claim")
    text: str = Field(description="The debater’s argument expressed as a clear, persuasive, and logically structured paragraph.")
    confidence: int = Field(ge=1, le=100, description="Score high (80–100) when the argument is logically sound, well-evidenced, directly addresses the opponent, "
        "and clearly advances the debater’s position. "
        "Score medium (50–79) when the argument is reasonable but incomplete, weakly evidenced, or only partially engages the opponent. "
        "Score low (1–49) when the argument is speculative, vague, repetitive, off-topic, or fails to rebut key points.")

class DebateTurn(BaseModel):
    turn_id: str = Field(
        default_factory=lambda: str(uuid4()),
        description="System-generated unique identifier for this turn; used for tracking, ordering, and referencing."
    )
    debater: str = Field(description="Name of the debater who is arguing")
    argument: TurnArgument = Field(description="The debater’s response for this turn: a focused, persuasive argument that directly engages with the opponent’s previous points and advances the debate.")

class DebateState(BaseModel):
    topic: str = Field(
        default="",
        description="The central motion or topic being debated"
    )
    rounds: int = Field(
        default=1,
        description="Total number of debate rounds to run. One round is completed when both debaters have delivered an argument."
    )
    current_round: int = Field(
        default=1,
        description="The active round number; increments after both debaters complete a turn."
    )
    moderator_introduction: str = Field(
        default="",
        description="Neutral introduction by the moderator that frames the topic, stakes, and rules of the debate."
    )
    debater_1: str = Field(
        default="",
        description="Name of debater 1."
    )
    debater_2: str = Field(
        default="",
        description="Name of debater 2."
    )
    debater_1_persona: str = Field(
        default="",
        description="Strategic persona and debating style for debater 1 (values, tone, worldview, tactics)."
    )
    debater_2_persona: str = Field(
        default="",
        description="Strategic persona and debating style for debater 2 (values, tone, worldview, tactics)."
    )
    turns: list[DebateTurn] = Field(
        default_factory=list,
        description="Chronological log of all debate turns, used as conversational memory and grounding context."
    )


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
