import warnings
import uuid
import asyncio
from app.core.logger import logger

from app.cache import (
    DEBATE_CACHE_ENABLED,
    DEBATE_CACHE_TTL_SECONDS,
    delete_inflight_debate_id,
    release_generation_lock,
    set_cached_debate_id,
)

from .helpers import history_as_text,  append_turn, load_persona
from .storage import (
    update_debate_status,
    finalize_debate_duration,
    update_debate_summary,
    update_debate_metrics,
)
from .pricing import debate_usage_as_text, record_usage_from_llm, record_usage_from_response
from .prompts import (
    presenter_introduction_prompt,
    presenter_conclusion_prompt,
    debate_summary_prompt,
)
from .schemas import DebateState
from app.core.config import settings

from crewai import LLM
from crewai.flow.flow import Flow, listen, start, router, or_
from src.events import publish

from .crew import Debate  # your factory that builds agents & tasks
from .crew import DEBATER_1_MODEL, DEBATER_2_MODEL, JUDGE_MODEL, PRESENTER_MODEL, SUMMARY_MODEL
from .events import DebateEventListener

# -----------------------------------------------------------------------------
# Environment / warnings / logging
# -----------------------------------------------------------------------------

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

INTRO_DELAY_SECONDS = settings.intro_delay_seconds
TURN_DELAY_SECONDS = settings.turn_delay_seconds
CONCLUSION_DELAY_SECONDS = settings.conclusion_delay_seconds
JUDGE_DELAY_SECONDS = settings.judge_delay_seconds


class DebateFlow(Flow[DebateState]):

    def __init__(self):
        super().__init__()
        self.debate = Debate()
        self._debate_token_usage = {
            "total_tokens": 0,
            "prompt_tokens": 0,
            "cached_prompt_tokens": 0,
            "completion_tokens": 0,
            "successful_requests": 0,
        }
        self._cost_by_model: dict[str, float] = {}

    @start()
    async def presenter_introduction(self):
        logger.info(f"Introducing the debate topic: {self.state.topic}")
        topic: str = self.state.topic
        llm = LLM(model=PRESENTER_MODEL)
        debate_introduction = llm.call(
            presenter_introduction_prompt(topic, self.state.debater_1, self.state.debater_2)
        )
        record_usage_from_llm(
            llm=llm,
            model=PRESENTER_MODEL,
            debate_token_usage=self._debate_token_usage,
            cost_by_model=self._cost_by_model,
            debate_id=self.state.debate_id,
        )
        logger.info(f"Debate Introduction: {debate_introduction}")
        self.state.presenter_introduction = debate_introduction

        publish(
            self.state.debate_id,
            "presenter_intro_done",
            {
                "agent": "presenter_agent",
                "topic": topic,
                "output": debate_introduction,
            },
        )

        # Load personas at the start of the debate
        logger.info(f"Loading personas for {self.state.debater_1} and {self.state.debater_2}")
        self.state.debater_1_persona = load_persona(self.state.debater_1)
        self.state.debater_2_persona = load_persona(self.state.debater_2)

        if INTRO_DELAY_SECONDS > 0:
            await asyncio.sleep(INTRO_DELAY_SECONDS)


    @listen(or_(presenter_introduction, "next_round"))
    async def debater_1_answer(self):
        logger.info(f"Debater_1 Answering - Round {self.state.current_round}")
        
        # Inject persona only in the first round
        p1 = self.state.debater_1_persona if self.state.current_round == 1 else ""
        p2 = self.state.debater_2_persona if self.state.current_round == 1 else ""


        debater_1_response = self.debate.debater_1_crew().kickoff(inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "debater_1_persona": p1,
            "debater_2_persona": p2,
            "history": history_as_text(self.state.turns)

        })
        record_usage_from_response(
            response=debater_1_response,
            model=DEBATER_1_MODEL,
            debate_token_usage=self._debate_token_usage,
            cost_by_model=self._cost_by_model,
            debate_id=self.state.debate_id,
        )

        turn = debater_1_response.pydantic 
        turn.debater = self.state.debater_1 
        
        turn.turn_id = str(uuid.uuid4()) 
        turn_text = turn.argument.text 
        logger.info(f"Turn: {turn_text}") 
        
        self.state.turns.append(turn) 
        append_turn(turn, self.state.debate_id)

        if TURN_DELAY_SECONDS > 0:
            await asyncio.sleep(TURN_DELAY_SECONDS)



    @listen(debater_1_answer)
    async def debater_2_answer(self):
        logger.info(f"Debater_2 Answering - Round {self.state.current_round}")

        p1 = self.state.debater_1_persona if self.state.current_round == 1 else ""
        p2 = self.state.debater_2_persona if self.state.current_round == 1 else ""

        debate_2_response = self.debate.debater_2_crew().kickoff(inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "debater_1_persona": p1,
            "debater_2_persona": p2,
            "history": history_as_text(self.state.turns)

        })
        record_usage_from_response(
            response=debate_2_response,
            model=DEBATER_2_MODEL,
            debate_token_usage=self._debate_token_usage,
            cost_by_model=self._cost_by_model,
            debate_id=self.state.debate_id,
        )

        turn = debate_2_response.pydantic  
        turn.debater = self.state.debater_2 
        turn.turn_id = str(uuid.uuid4()) 
        turn_text = turn.argument.text
        
        logger.info(f"Turn: {turn_text}") 
        
        self.state.turns.append(turn)
        append_turn(turn, self.state.debate_id)

        if TURN_DELAY_SECONDS > 0:
            await asyncio.sleep(TURN_DELAY_SECONDS)


    @router(debater_2_answer)
    def round_router(self):
        self.state.current_round += 1

        if self.state.current_round < self.state.total_rounds:
            return "next_round"
        else:
            return "conclude_debate"


    @listen("conclude_debate")
    async def presenter_conclusion(self):
        logger.info("Presenter Concluding the debate")
        llm = LLM(model=PRESENTER_MODEL)
        
        debate_conclusion = llm.call(
            presenter_conclusion_prompt(
                self.state.topic,
                self.state.debater_1,
                self.state.debater_2,
                self.state.turns,
            )
        )
        record_usage_from_llm(
            llm=llm,
            model=PRESENTER_MODEL,
            debate_token_usage=self._debate_token_usage,
            cost_by_model=self._cost_by_model,
            debate_id=self.state.debate_id,
        )

        publish(
            self.state.debate_id,
            "presenter_conclusion_done",
            {
                "agent": "presenter_agent",
                "topic": self.state.topic,
                "output": debate_conclusion,
            },
        )
        if CONCLUSION_DELAY_SECONDS > 0:
            await asyncio.sleep(CONCLUSION_DELAY_SECONDS)


    @listen("presenter_conclusion")
    async def judge_debate(self):
        logger.info("Judging the debate")
        judge_response = self.debate.judge_crew().kickoff(inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "history": history_as_text(self.state.turns)
        })
        record_usage_from_response(
            response=judge_response,
            model=JUDGE_MODEL,
            debate_token_usage=self._debate_token_usage,
            cost_by_model=self._cost_by_model,
            debate_id=self.state.debate_id,
        )
        usage_text = debate_usage_as_text(self._debate_token_usage)
        update_debate_metrics(
            self.state.debate_id,
            tokens_delta=self._debate_token_usage["total_tokens"],
            cost_delta=round(sum(self._cost_by_model.values()), 6),
        )
        publish(
            self.state.debate_id,
            "debate_token_usage_done",
            {
                "agent": "system",
                "output": usage_text,
            },
        )
        logger.info("Debate usage (intro to judgement): %s", usage_text)

        logger.info("Debate Winner: ", judge_response.pydantic)
        self.state.judge_verdicts = judge_response.pydantic
        # self.state.winner = judge_response.pydantic
        if JUDGE_DELAY_SECONDS > 0:
            await asyncio.sleep(JUDGE_DELAY_SECONDS)

    @listen("judge_debate")
    async def generate_debate_summary(self):
        logger.info("Generating debate summary")
        debate_turns = self.state.turns
        judge_verdicts = self.state.judge_verdicts
        winner = self.state.winner
        
        llm = LLM(model=SUMMARY_MODEL)

        debate_summary = llm.call(
            debate_summary_prompt(debate_turns, judge_verdicts, winner)
        )

        publish(
            self.state.debate_id,
            "debate_summary_done",
            {
                "agent": "None",
                "topic": self.state.topic,
                "output": debate_summary,
            },
        )
        update_debate_summary(self.state.debate_id, debate_summary)
        

async def run_debate_flow(
    debate_id: str,
    topic: str,
    debater_1: str,
    debater_2: str,
    cache_key: str | None = None,
    inflight_key: str | None = None,
    lock_key: str | None = None,
    lock_token: str | None = None,
):
    listener = DebateEventListener(debate_id)
    flow = DebateFlow()
    inputs = {
        "debate_id": debate_id,
        "topic": topic,
        "debater_1": debater_1,
        "debater_2": debater_2,
    }
    try:
        await flow.kickoff_async(inputs=inputs)
        update_debate_status(debate_id, "completed")
        finalize_debate_duration(debate_id)
        if DEBATE_CACHE_ENABLED and cache_key:
            set_cached_debate_id(cache_key, debate_id, DEBATE_CACHE_TTL_SECONDS)
            logger.info("cache_write", extra={"debate_id": debate_id, "cache_key": cache_key})
        publish(
            debate_id,
            "debate_completed",
            {"agent": "system", "output": "debate completed"},
        )
    except Exception as exc:
        update_debate_status(debate_id, "failed", error_message=str(exc))
        finalize_debate_duration(debate_id)
        logger.exception("flow_failed", extra={"debate_id": debate_id})
        publish(
            debate_id,
            "debate_failed",
            {"agent": "system", "output": "debate failed"},
        )
        raise
    finally:
        if inflight_key:
            delete_inflight_debate_id(inflight_key)
        if lock_key and lock_token:
            release_generation_lock(lock_key, lock_token)


