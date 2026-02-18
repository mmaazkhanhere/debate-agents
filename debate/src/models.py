from pydantic import BaseModel, Field, conint, conlist
from typing import Literal


# ---------- Shared constrained types ----------
Score0to10 = conint(ge=0, le=10)
Penalty0to5 = conint(ge=0, le=5)

# Exactly two debaters (index 0 = debater_1, index 1 = debater_2)
ScorePair = conlist(Score0to10, min_length=2, max_length=2)
PenaltyPair = conlist(Penalty0to5, min_length=2, max_length=2)



class TurnArgument(BaseModel):
    type: Literal["attack", "defense", "counter", "framing"] = Field(description="Strategic role of this response: attack = challenge opponent’s claim, defense = protect own claim, counter = rebut a specific point, framing = redefine the narrative, clarification = explain or refine a claim")
    text: str = Field(description="The debater’s argument expressed as a clear, persuasive, and logically structured paragraph.")
    confidence: int = Field(ge=1, le=100, description="Score high (80–100) when the argument is logically sound, well-evidenced, directly addresses the opponent, "
        "and clearly advances the debater’s position. "
        "Score medium (50–79) when the argument is reasonable but incomplete, weakly evidenced, or only partially engages the opponent. "
        "Score low (1–49) when the argument is speculative, vague, repetitive, off-topic, or fails to rebut key points.")

class DebateTurn(BaseModel):
    turn_id: str = Field(
        default="",
        description="System-generated unique identifier for this turn; used for tracking, ordering, and referencing. Format: turn-XXX"
    )
    debater: str = Field(default="", description="Name of the debater who is arguing")
    argument: TurnArgument = Field(description="The debater’s response for this turn: a focused, persuasive argument that directly engages with the opponent’s previous points and advances the debate.")

class DebateState(BaseModel):
    debate_id: str = Field(default="", description="Unique identifier for this debate session.")
    topic: str = Field(
        default="",
        description="The central motion or topic being debated"
    )
    total_rounds: int = Field(
        default=1,
        description="Total number of debate rounds to run. One round is completed when both debaters have delivered an argument."
    )
    current_round: int = Field(
        default=0,
        description="The active round number; increments after both debaters complete a turn."
    )
    presenter_introduction: str = Field(
        default="",
        description="Neutral introduction by the presenter that frames the topic, stakes, and rules of the debate."
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
    winner: str = Field(default="", description="Name of the winning debater")

# ================================
# Logical Analyst Output
# ================================
class LogicalAnalystRubric(BaseModel):
    validity_score: ScorePair = Field(
        description="Per-debater logical validity of inferences (0–10). Index 0=debater_1, 1=debater_2."
    )
    consistency_score: ScorePair = Field(
        description="Per-debater internal consistency across claims (0–10). Index 0=debater_1, 1=debater_2."
    )
    support_score: ScorePair = Field(
        description="Per-debater quality of support (reasons/evidence backing claims) (0–10). Index 0=debater_1, 1=debater_2."
    )
    fallacy_penalty: PenaltyPair = Field(
        description="Per-debater penalty for clear fallacies/contradictions (0–5). Higher = worse. Index 0=debater_1, 1=debater_2."
    )

class LogicalAnalystVerdict(BaseModel):
    judge: Literal["Dr. Asha Raman"] = Field(description="Name of the judge persona.")
    winner: str = Field(description="Name of the winning debater (must match one debater name in the transcript).")
    reasoning: str = Field(
        description="Exactly 2 short sentences: (1) winner’s strongest logical advantage, (2) loser’s decisive logical flaw."
    )
    rubric_score: LogicalAnalystRubric = Field(
        description="Rubric scores for both debaters (index 0=debater_1, index 1=debater_2)."
    )
    winner_weakness: str = Field(
        description="One short sentence describing a notable logical weakness of the winner."
    )


# ================================
# Debate Strategist Output
# ================================
class DebateStrategistRubric(BaseModel):
    responsiveness_score: ScorePair = Field(
        description="Per-debater directness/completeness in answering opponent’s strongest points (0–10). Index 0=debater_1, 1=debater_2."
    )
    clash_score: ScorePair = Field(
        description="Per-debater engagement with the central points of dispute (0–10). Index 0=debater_1, 1=debater_2."
    )
    defense_score: ScorePair = Field(
        description="Per-debater ability to protect key claims under attack (0–10). Index 0=debater_1, 1=debater_2."
    )
    exploitation_score: ScorePair = Field(
        description="Per-debater ability to capitalize on opponent weaknesses/concessions (0–10). Index 0=debater_1, 1=debater_2."
    )
    evasion_penalty: PenaltyPair = Field(
        description="Per-debater penalty for dodging, reframing away, or non-answers (0–5). Higher = worse. Index 0=debater_1, 1=debater_2."
    )

class DebateStrategistVerdict(BaseModel):
    judge: Literal["Marcus Reed"] = Field(description="Name of the judge persona.")
    winner: str = Field(description="Name of the winning debater (must match one debater name in the transcript).")
    reasoning: str = Field(
        description="Exactly 2 short sentences: (1) winner’s best strategic edge in the exchange, (2) loser’s key strategic failure."
    )
    rubric_score: DebateStrategistRubric = Field(
        description="Rubric scores for both debaters (index 0=debater_1, index 1=debater_2)."
    )
    winner_weakness: str = Field(
        description="One short sentence describing a notable strategic weakness of the winner."
    )


# ================================
# Persuasion Verdict Output
# ================================
class PersuasionRubric(BaseModel):
    clarity_score: ScorePair = Field(
        description="Per-debater clarity and intelligibility for a general audience (0–10). Index 0=debater_1, 1=debater_2."
    )
    structure_score: ScorePair = Field(
        description="Per-debater organization/signposting/narrative coherence (0–10). Index 0=debater_1, 1=debater_2."
    )
    rhetorical_impact_score: ScorePair = Field(
        description="Per-debater rhetorical force and memorability (0–10). Index 0=debater_1, 1=debater_2."
    )
    audience_connection_score: ScorePair = Field(
        description="Per-debater audience resonance/relatability (0–10). Index 0=debater_1, 1=debater_2."
    )
    obscurity_penalty: PenaltyPair = Field(
        description="Per-debater penalty for jargon, muddiness, or incoherence (0–5). Higher = worse. Index 0=debater_1, 1=debater_2."
    )

class PersuasionVerdict(BaseModel):
    judge: Literal["Elena Marquez"] = Field(description="Name of the judge persona.")
    winner: str = Field(description="Name of the winning debater (must match one debater name in the transcript).")
    reasoning: str = Field(
        description="Exactly 2 short sentences: (1) why winner persuades more clearly/strongly, (2) what most undermines the loser’s persuasiveness."
    )
    rubric_score: PersuasionRubric = Field(
        description="Rubric scores for both debaters (index 0=debater_1, index 1=debater_2)."
    )
    winner_weakness: str = Field(
        description="One short sentence describing a notable communication weakness of the winner."
    )

class DebateWinner(BaseModel):
    winner: str = Field(description="Name of the winning debater")