import logging
import warnings
import uuid
import asyncio
import os

from .utils import (
    append_turn,
    load_persona,
    DEBATE_CACHE_ENABLED,
    DEBATE_CACHE_TTL_SECONDS,
    set_cached_debate_id,
    release_generation_lock,
    delete_inflight_debate_id,
)
from .storage import (
    update_debate_status,
    finalize_debate_duration,
    update_debate_summary,
    record_llm_call,
    update_debate_metrics,
)
from .pricing import compute_cost_usd
from .models import DebateState

from dotenv import load_dotenv
from pydantic import BaseModel, Field

from crewai import Crew, LLM
from crewai.flow.flow import Flow, listen, start, router, or_
from src.events import publish

from .crew import Debate  # your factory that builds agents & tasks
from .crew import DEBATER_1_MODEL, DEBATER_2_MODEL, JUDGE_MODEL, PRESENTER_MODEL
from .events import DebateEventListener

# -----------------------------------------------------------------------------
# Environment / warnings / logging
# -----------------------------------------------------------------------------

load_dotenv()
warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

LOG = logging.getLogger("debate_flow")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

INTRO_SLEEP_SEC = float(os.getenv("INTRO_SLEEP_SEC", "10"))
TURN_SLEEP_SEC = float(os.getenv("TURN_SLEEP_SEC", "18"))
CONCLUDE_SLEEP_SEC = float(os.getenv("CONCLUDE_SLEEP_SEC", "0"))
JUDGE_SLEEP_SEC = float(os.getenv("JUDGE_SLEEP_SEC", "0"))


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

    def _extract_usage_fields(self, usage: object) -> dict[str, int]:
        if usage is None:
            return {}
        if isinstance(usage, dict):
            src = usage
        else:
            src = {}
            for key in (
                "total_tokens",
                "prompt_tokens",
                "cached_prompt_tokens",
                "completion_tokens",
                "successful_requests",
            ):
                value = getattr(usage, key, None)
                if value is not None:
                    src[key] = value

        prompt_tokens = int(
            src.get("prompt_tokens")
            or src.get("input_tokens")
            or src.get("prompt_token_count")
            or 0
        )
        completion_tokens = int(
            src.get("completion_tokens")
            or src.get("output_tokens")
            or src.get("candidates_token_count")
            or 0
        )
        cached_prompt_tokens = int(
            src.get("cached_prompt_tokens")
            or src.get("cached_tokens")
            or 0
        )
        total_tokens = int(
            src.get("total_tokens")
            or src.get("total_token_count")
            or (prompt_tokens + completion_tokens)
        )
        successful_requests = int(src.get("successful_requests") or 1)
        return {
            "total_tokens": total_tokens,
            "prompt_tokens": prompt_tokens,
            "cached_prompt_tokens": cached_prompt_tokens,
            "completion_tokens": completion_tokens,
            "successful_requests": successful_requests,
        }

    def _accumulate_usage(self, usage: object) -> dict[str, int]:
        parsed = self._extract_usage_fields(usage)
        if not parsed:
            return {}
        for key, value in parsed.items():
            self._debate_token_usage[key] += value
        return parsed

    def _record_call_usage(self, model: str, usage: object) -> None:
        parsed = self._accumulate_usage(usage)
        if not parsed:
            return
        input_tokens = parsed["prompt_tokens"]
        output_tokens = parsed["completion_tokens"]
        cost_usd = compute_cost_usd(model, input_tokens, output_tokens)
        self._cost_by_model[model] = self._cost_by_model.get(model, 0.0) + cost_usd
        record_llm_call(
            debate_id=self.state.debate_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost_usd,
        )

    def _record_usage_from_response(self, response: object, model: str) -> None:
        usage = getattr(response, "token_usage", None)
        self._record_call_usage(model, usage)

    def _record_usage_from_llm(self, llm: LLM, model: str) -> None:
        try:
            self._record_call_usage(model, llm.get_token_usage_summary())
        except Exception:
            # If provider does not expose usage for direct LLM calls, skip.
            return

    def _debate_usage_as_text(self) -> str:
        usage = self._debate_token_usage
        return (
            f"total_tokens={usage['total_tokens']} "
            f"prompt_tokens={usage['prompt_tokens']} "
            f"cached_prompt_tokens={usage['cached_prompt_tokens']} "
            f"completion_tokens={usage['completion_tokens']} "
            f"successful_requests={usage['successful_requests']}"
        )


    def _history_as_text(self) -> str:
        """
        Convert structured debate turns into an LLM-safe text history.
        """
        if not self.state.turns:
            return "No prior debate history."

        lines = []
        for i, turn in enumerate(self.state.turns, start=1):
            lines.append(
                f"Round {i} — {turn.debater} ({turn.argument.type}, "
                f"confidence {turn.argument.confidence}/100):\n"
                f"{turn.argument.text}"
            )

        return "\n\n".join(lines)


    @start()
    async def presenter_introduction(self):
        LOG.info(f"Introducing the debate topic: {self.state.topic}")
        topic: str = self.state.topic
        llm = LLM(model=PRESENTER_MODEL)
        debate_introduction = llm.call(f"""You are Piers Morgan. Introduce the topic: {topic} and debators 
        {self.state.debater_1} and {self.state.debater_2}. Pass some comments about the topics. Ensure it 
        is engaging and interesting for the audience. Keep introduction to 3 sentences.
        """)
        self._record_usage_from_llm(llm, PRESENTER_MODEL)
        LOG.info(f"Debate Introduction: {debate_introduction}")
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
        LOG.info(f"Loading personas for {self.state.debater_1} and {self.state.debater_2}")
        self.state.debater_1_persona = load_persona(self.state.debater_1)
        self.state.debater_2_persona = load_persona(self.state.debater_2)

        if INTRO_SLEEP_SEC > 0:
            await asyncio.sleep(INTRO_SLEEP_SEC)


    @listen(or_(presenter_introduction, "next_round"))
    async def debater_1_answer(self):
        LOG.info(f"Debater_1 Answering - Round {self.state.current_round}")
        
        # Inject persona only in the first round
        p1 = self.state.debater_1_persona if self.state.current_round == 1 else ""
        p2 = self.state.debater_2_persona if self.state.current_round == 1 else ""


        debater_1_response = self.debate.debater_1_crew().kickoff(inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "debater_1_persona": p1,
            "debater_2_persona": p2,
            "history": self._history_as_text()

        })
        self._record_usage_from_response(debater_1_response, DEBATER_1_MODEL)

        turn = debater_1_response.pydantic 
        turn.debater = self.state.debater_1 
        
        turn.turn_id = str(uuid.uuid4()) 
        turn_text = turn.argument.text 
        LOG.info(f"Turn: {turn_text}") 
        
        self.state.turns.append(turn) 
        append_turn(turn)

        if TURN_SLEEP_SEC > 0:
            await asyncio.sleep(TURN_SLEEP_SEC)



    @listen(debater_1_answer)
    async def debater_2_answer(self):
        LOG.info(f"Debater_2 Answering - Round {self.state.current_round}")

        p1 = self.state.debater_1_persona if self.state.current_round == 1 else ""
        p2 = self.state.debater_2_persona if self.state.current_round == 1 else ""

        debate_2_response = self.debate.debater_2_crew().kickoff(inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "debater_1_persona": p1,
            "debater_2_persona": p2,
            "history": self._history_as_text()

        })
        self._record_usage_from_response(debate_2_response, DEBATER_2_MODEL)

        turn = debate_2_response.pydantic  
        turn.debater = self.state.debater_2 
        turn.turn_id = str(uuid.uuid4()) 
        turn_text = turn.argument.text
        
        LOG.info(f"Turn: {turn_text}") 
        
        self.state.turns.append(turn)
        append_turn(turn)

        if TURN_SLEEP_SEC > 0:
            await asyncio.sleep(TURN_SLEEP_SEC)


    @router(debater_2_answer)
    def round_router(self):
        self.state.current_round += 1

        if self.state.current_round < self.state.total_rounds:
            return "next_round"
        else:
            return "conclude_debate"


    @listen("conclude_debate")
    async def presenter_conclusion(self):
        LOG.info("Presenter Concluding the debate")
        llm = LLM(model=PRESENTER_MODEL)
        
        debate_conclusion = llm.call(f"""You are Piers Morgan. Conclude the debate on the topic: {self.state.topic} 
        between {self.state.debater_1} and {self.state.debater_2}. 
        Review the following debate turns:
        {self.state.turns}
        
        Provide a sharp conclusion and short insights on the arguments presented. 
        Keep it engaging and limited to 2 sentences. End with something like lets see
        what the judges think about the winner
        """)
        self._record_usage_from_llm(llm, PRESENTER_MODEL)

        publish(
            self.state.debate_id,
            "presenter_conclusion_done",
            {
                "agent": "presenter_agent",
                "topic": self.state.topic,
                "output": debate_conclusion,
            },
        )
        if CONCLUDE_SLEEP_SEC > 0:
            await asyncio.sleep(CONCLUDE_SLEEP_SEC)


    @listen("presenter_conclusion")
    async def judge_debate(self):
        LOG.info("Judging the debate")
        judge_response = self.debate.judge_crew().kickoff(inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "history": self._history_as_text()
        })
        self._record_usage_from_response(judge_response, JUDGE_MODEL)
        usage_text = self._debate_usage_as_text()
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
        LOG.info("Debate usage (intro to judgement): %s", usage_text)

        LOG.info("Debate Winner: ", judge_response.pydantic)
        self.state.judge_verdicts = judge_response.pydantic
        # self.state.winner = judge_response.pydantic
        if JUDGE_SLEEP_SEC > 0:
            await asyncio.sleep(JUDGE_SLEEP_SEC)

    @listen("judge_debate")
    async def generate_debate_summary(self):
        LOG.info("Generating debate summary")
        debate_turns = self.state.turns
        judge_verdicts = self.state.judge_verdicts
        winner = self.state.winner
        
        llm = LLM(model="groq/openai/gpt-oss-120b")

        debate_summary = llm.call(f"""You are a debate analyst.
        Review the following debate turns:
        {debate_turns}

        Judge remarks (if any):
        {judge_verdicts}

        Winner (if any):
        {winner}

        Create a concise debate summary with these parts:
        1) Overall insight of the whole debate in 1 sentence.
        2) Debater 1 point of view in 1-2 sentences.
        3) Debater 2 point of view in 1-2 sentences.
        4) Judge remarks in 1-2 sentences (use the provided remarks if present).
        5) Winner in 1 short sentence (use the provided winner if present; otherwise say "undetermined").

        Keep it engaging and do not use bullet points or lists.
        """)

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
            LOG.info("cache_write", extra={"debate_id": debate_id, "cache_key": cache_key})
        publish(
            debate_id,
            "debate_completed",
            {"agent": "system", "output": "debate completed"},
        )
    except Exception as exc:
        update_debate_status(debate_id, "failed", error_message=str(exc))
        finalize_debate_duration(debate_id)
        LOG.exception("flow_failed", extra={"debate_id": debate_id})
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

