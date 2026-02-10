import logging
import warnings
import uuid
import asyncio

from .utils import append_turn, load_persona
from .models import DebateState

from dotenv import load_dotenv
from pydantic import BaseModel, Field

from crewai import Crew, LLM
from crewai.flow.flow import Flow, listen, start, router, or_
from src.events import publish

from .crew import Debate  # your factory that builds agents & tasks
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


class DebateFlow(Flow[DebateState]):

    def __init__(self):
        super().__init__()
        self.debate = Debate()

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
        llm = LLM(model="groq/openai/gpt-oss-120b")
        debate_introduction = llm.call(f"""You are Piers Morgan. Introduce the topic: {topic} and debators 
        {self.state.debater_1} and {self.state.debater_2}. Pass some comments about the topics. Ensure it 
        is engaging and interesting for the audience. Keep introduction to 3 sentences.
        """)
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

        # time.sleep(10)


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

        turn = debater_1_response.pydantic 
        turn.debater = self.state.debater_1 
        
        turn.turn_id = str(uuid.uuid4()) 
        turn_text = turn.argument.text 
        LOG.info(f"Turn: {turn_text}") 
        
        self.state.turns.append(turn) 
        append_turn(turn)

        # await asyncio.sleep(18)



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

        turn = debate_2_response.pydantic  
        turn.debater = self.state.debater_2 
        turn.turn_id = str(uuid.uuid4()) 
        turn_text = turn.argument.text
        
        LOG.info(f"Turn: {turn_text}") 
        
        self.state.turns.append(turn)
        append_turn(turn)

        # await asyncio.sleep(18)


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
        llm = LLM(model="groq/openai/gpt-oss-120b")
        
        debate_conclusion = llm.call(f"""You are Piers Morgan. Conclude the debate on the topic: {self.state.topic} 
        between {self.state.debater_1} and {self.state.debater_2}. 
        Review the following debate turns:
        {self.state.turns}
        
        Provide a sharp conclusion and short insights on the arguments presented. 
        Keep it engaging and limited to 2 sentences. End with something like lets see
        what the judges think about the winner
        """)

        publish(
            self.state.debate_id,
            "presenter_conclusion_done",
            {
                "agent": "presenter_agent",
                "topic": self.state.topic,
                "output": debate_conclusion,
            },
        )


    @listen("presenter_conclusion")
    async def judge_debate(self):
        LOG.info("Judging the debate")
        judge_response = self.debate.judge_crew().kickoff(inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "history": self._history_as_text()
        })

        LOG.info("Debate Winner: ", judge_response.pydantic)
        self.state.winner = judge_response.pydantic
        

async def run_debate_flow(debate_id: str, topic: str, debater_1: str, debater_2: str):
    listener = DebateEventListener(debate_id)
    flow = DebateFlow()
    inputs={"debate_id": debate_id, "topic": topic, "debater_1": debater_1, "debater_2": debater_2}
    await flow.kickoff_async(inputs=inputs)