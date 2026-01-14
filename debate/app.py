import logging
import warnings
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from crewai.flow.flow import Flow, listen, start
from crewai.project import CrewBase, agent, crew, task
from crewai import LLM
from crewai import Agent, Crew, Process, Task
import json
from pathlib import Path

load_dotenv()

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

LOG = logging.getLogger("debate_flow")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

@CrewBase
class Debate():
    """Debate crew"""

    agents_config = 'src/debate/config/agents.yaml'
    tasks_config = 'src/debate/config/tasks.yaml'

    @agent
    def debater_1(self) -> Agent:
        return Agent(
            config=self.agents_config['debater_1'],
            verbose=True
        )

    @agent
    def debater_2(self) -> Agent:
        return Agent(
            config=self.agents_config['debater_2'],
            verbose=True
        )

    @task
    def generate_debater_1_answer(self) -> Task:
        return Task(
            config=self.tasks_config['generate_debate_turn'],
            output_pydantic=DebateTurn,
            agent=self.debater_1()
        )

    @task
    def generate_debater_2_answer(self) -> Task:
        return Task(
            config=self.tasks_config['generate_debate_turn'],
            output_pydantic=DebateTurn,
            agent=self.debater_2()
        )

class TurnArgument(BaseModel):
    type: str # attack | defense | counter | framing | clarification
    text: str
    confidence: int = Field(ge=1, le=100)

class DebateTurn(BaseModel):
    turn_id: str
    debater: str
    argument: TurnArgument

class DebateState(BaseModel):
    topic: str = "" 
    rounds: int = 1
    moderator_introduction: str = ""
    turns: list[DebateTurn] = Field(default_factory=list)

OUTPUT_FILE = Path("debate_round.json")

def append_turn(turn: DebateTurn):
    if OUTPUT_FILE.exists():
        data = json.loads(OUTPUT_FILE.read_text())
    else:
        data = []

    data.append(turn.model_dump())
    OUTPUT_FILE.write_text(json.dumps(data, indent=2))

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
        result= crew.kickoff(inputs={"topic": self.state.topic})
        turn = result.pydantic
        turn_text = turn.argument.text
        LOG.info(f"Turn: {turn_text}")
        self.state.turns.append(turn)
        append_turn(turn)
        self.state.rounds += 1

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
        result= crew.kickoff(inputs={"topic": self.state.topic})
        turn = result.pydantic
        turn_text = turn.argument.text
        LOG.info(f"Turn: {turn_text}")
        self.state.turns.append(turn)
        append_turn(turn)
        self.state.rounds += 1

        LOG.info(f"State 2: {self.state}")


debate_flow = DebateFlow()
#debate_flow.plot("my_flow_plot")
debate_flow.kickoff({"topic": "Should Artificial Intelligence Be Regulated by Governments? "})