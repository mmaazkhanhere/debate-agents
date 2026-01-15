from debate.utils import append_turn, load_persona
from debate.models import DebateState
import logging
import warnings

from dotenv import load_dotenv
from pydantic import BaseModel, Field

from crewai import Crew, LLM
from crewai.flow.flow import Flow, listen, start, router

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

# class DebateFlow(Flow[DebateState]):
#     def __init__(self):
#         super().__init__()
#         self.debate = Debate()

#     @start()
#     def prepare_debate(self):
#         LOG.info("\n--- Preparing Debate ---")

#         if not self.state.topic:
#             raise ValueError("Debate topic must be provided.")

#         prep_crew = Crew(
#             agents=[
#                 self.debate.debater_1(),
#                 self.debate.debater_2(),
#             ],
#             tasks=[
#                 self.debate.debater_1_prepare_stance(),
#                 self.debate.debater_2_prepare_stance(),
#             ],
#             verbose=True,
#         )

#         prep_crew.kickoff(inputs={"topic": self.state.topic})

#     @listen(prepare_debate)
#     def conduct_debate_rounds(self):
#         """Conduct debate rounds"""
#         LOG.info("Conducting Debate Rounds")

#         for round_number in range(1, self.state.rounds):
#             self._run_single_turn(
#                 debater_id="debater_1",
#                 agent=self.debate.debater_1(),
#                 round_number=round_number,
#             )

#             self._run_single_turn(
#                 debater_id="debater_2",
#                 agent=self.debate.debater_2(),
#                 round_number=round_number,
#             )

#     def _run_single_turn(self, debater_id: str, agent, round_number: int):
#         """Run a single debate turn and update history."""
#         task = self.debate.generate_debate_turn()
#         task.agent = agent

#         crew = Crew(
#             agents=[agent],
#             tasks=[task],
#             verbose=True,
#         )

#         result = crew.kickoff(
#             inputs={
#                 "topic": self.state.topic,
#                 "current_debater": debater_id,
#                 "history": "\n".join(self.state.history),
#             }
#         )

#         turn = result.pydantic
#         turn_text = " ".join(arg.text for arg in turn.arguments)

#         self.state.history.append(
#             f"{debater_id} (Round {round_number}): {turn_text}"
#         )

#     @listen(conduct_debate_rounds)
#     def judge_debate(self):
#         """Run final judging panel."""
#         print("\n--- Judging Debate ---")

#         judging_crew = Crew(
#             agents=[
#                 self.debate.logical_analyst_judge(),
#                 self.debate.debate_strategist_judge(),
#                 self.debate.persuasion_judge(),
#             ],
#             tasks=[
#                 self.debate.logical_analyst_verdict(),
#                 self.debate.debate_strategist_verdict(),
#                 self.debate.persuasion_verdict(),
#             ],
#             verbose=True,
#         )

#         result = judging_crew.kickoff(
#             inputs={
#                 "topic": self.state.topic,
#                 "history": "\n".join(self.state.history),
#             }
#         )

#         return result


class DebateFlow(Flow[DebateState]):

    def __init__(self):
        super().__init__()
        self.debate = Debate()

    @start()
    def moderator_topic_introduce(self):
        LOG.info(f"Introducing the topic: {self.state.topic}")
        topic: str = self.state.topic
        llm = LLM(model="groq/openai/gpt-oss-120b")
        topic_introduction = llm.call(f"""You are Piers Morgan. Introduce the topic: {topic} and pass
        some comments about the topics. Ensure it is engaging and interesting for the audience.
        Keep introduction to 3-4 sentences maximum.
        """)
        LOG.info(f"Topic Introduction: {topic_introduction}")
        self.state.moderator_introduction = topic_introduction

        # Load personas at the start of the debate
        LOG.info(f"Loading personas for {self.state.debater_1} and {self.state.debater_2}")
        self.state.debater_1_persona = load_persona(self.state.debater_1)
        self.state.debater_2_persona = load_persona(self.state.debater_2)

    @listen(moderator_topic_introduce)
    def debater_1_answer(self):
        LOG.info("Debater_1 Answering")
        task = self.debate.generate_debater_1_answer()
        agent = self.debate.debater_1()
        crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=True,
        )
        result = crew.kickoff(inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "debater_1_persona": self.state.debater_1_persona,
            "debater_2_persona": self.state.debater_2_persona
        })
        turn = result.pydantic
        turn_text = turn.argument.text
        LOG.info(f"Turn: {turn_text}")
        self.state.turns.append(turn)
        append_turn(turn)

        LOG.info(f"State: {self.state}")

    @listen(debater_1_answer)
    def debater_2_answer(self):
        LOG.info("Debater_2 Answering")
        task = self.debate.generate_debater_2_answer()
        agent = self.debate.debater_2()
        crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=True,
        )
        result = crew.kickoff(inputs={
            "topic": self.state.topic, 
            "debater_1": self.state.debater_1, 
            "debater_2": self.state.debater_2,
            "debater_1_persona": self.state.debater_1_persona,
            "debater_2_persona": self.state.debater_2_persona
        })
        turn = result.pydantic
        turn_text = turn.argument.text
        LOG.info(f"Turn: {turn_text}")
        self.state.turns.append(turn)
        append_turn(turn)

        LOG.info(f"State 2: {self.state}")


def run_debate_flow(topic: str, debater_1: str, debater_2: str):
    debate_flow = DebateFlow()
    result = debate_flow.kickoff({"topic": topic, "debater_1": debater_1, "debater_2": debater_2})
    return result