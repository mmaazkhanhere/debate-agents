import logging
import warnings
import asyncio
import time

from debate.utils import append_turn, load_persona
from debate.models import DebateState

from dotenv import load_dotenv
from pydantic import BaseModel, Field

from crewai import Crew, LLM
from crewai.flow.flow import Flow, listen, start, router, or_

from .crew import Debate  # your factory that builds agents & tasks

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

    def __init__(self, agent_output_queue: asyncio.Queue):
        super().__init__()
        self.debate = Debate()
        self.agent_output_queue: asyncio.Queue = agent_output_queue

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
    async def moderator_topic_introduce(self):
        LOG.info(f"Introducing the topic: {self.state.topic}")
        topic: str = self.state.topic
        llm = LLM(model="groq/openai/gpt-oss-120b")
        topic_introduction = llm.call(f"""You are Piers Morgan. Introduce the topic: {topic} and pass
        some comments about the topics. Ensure it is engaging and interesting for the audience.
        Keep introduction to 3-4 sentences maximum.
        """)
        LOG.info(f"Topic Introduction: {topic_introduction}")
        self.state.moderator_introduction = topic_introduction
        await self.agent_output_queue.put(f"✅ Moderator Introduction:\n{topic_introduction}\n")

        # Load personas at the start of the debate
        LOG.info(f"Loading personas for {self.state.debater_1} and {self.state.debater_2}")
        self.state.debater_1_persona = load_persona(self.state.debater_1)
        self.state.debater_2_persona = load_persona(self.state.debater_2)
        await asyncio.sleep(5)

    @listen(or_(moderator_topic_introduce, "next_round"))
    async def debater_1_answer(self):
        LOG.info(f"Debater_1 Answering - Round {self.state.current_round}")
        task = self.debate.generate_debater_1_answer()
        agent = self.debate.debater_1()
        
        # Inject persona only in the first round
        p1 = self.state.debater_1_persona if self.state.current_round == 1 else ""
        p2 = self.state.debater_2_persona if self.state.current_round == 1 else ""

        debate_1_crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=True,
        )

        debate_1_response = await asyncio.to_thread(debate_1_crew.kickoff, inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "debater_1_persona": p1,
            "debater_2_persona": p2,
            "history": self._history_as_text()

        })

        turn = debate_1_response.pydantic
        await self.agent_output_queue.put(f"✅ Debater 1 Answer:\n{turn.argument.text}\n")
        
        turn_text = turn.argument.text
        LOG.info(f"Turn: {turn_text}")
        self.state.turns.append(turn)
        append_turn(turn)
        await asyncio.sleep(5)

    @listen(debater_1_answer)
    async def debater_2_answer(self):
        LOG.info(f"Debater_2 Answering - Round {self.state.current_round}")
        task = self.debate.generate_debater_2_answer()
        agent = self.debate.debater_2()

        debate_2_crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=True,
        )

        p1 = self.state.debater_1_persona if self.state.current_round == 1 else ""
        p2 = self.state.debater_2_persona if self.state.current_round == 1 else ""

        debate_2_response = await asyncio.to_thread(debate_2_crew.kickoff, inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "debater_1_persona": p1,
            "debater_2_persona": p2,
            "history": self._history_as_text()

        })
        turn = debate_2_response.pydantic
        await self.agent_output_queue.put(f"✅ Debater 2 Answer:\n{turn.argument.text}\n")
        
        turn_text = turn.argument.text
        LOG.info(f"Turn: {turn_text}")
        self.state.turns.append(turn)
        append_turn(turn)
        await asyncio.sleep(5)

    @router(debater_2_answer)
    def round_router(self):
        if self.state.current_round < 1:
            self.state.current_round += 1
            LOG.info(f"Moving to round {self.state.current_round}")
            return "next_round"
        else:
            LOG.info("Debate rounds completed")
            return "finish"

    @listen("finish")
    async def conclude_debate(self):
        print("\n" + "="*50)
        print("DEBATE HAS ENDED")
        print("="*50 + "\n")
        LOG.info("Debate has ended")
        await self.agent_output_queue.put("[DONE]")


async def run_debate_flow(topic: str, debater_1: str, debater_2: str, agent_output_queue: asyncio.Queue):
    debate_flow = DebateFlow(agent_output_queue)
    return await debate_flow.kickoff_async(
        inputs={"topic": topic, "debater_1": debater_1, "debater_2": debater_2},
    )