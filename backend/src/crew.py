
from .tools.search_tool import WebSearchTool
from .schemas import DebateTurn, LogicalAnalystVerdict, DebateStrategistVerdict, PersuasionVerdict
from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task

from app.core.config import settings

DEBATER_1_MODEL = settings.debater_one_llm_model
DEBATER_2_MODEL = settings.debater_two_llm_model
JUDGE_MODEL = settings.judge_llm_model
PRESENTER_MODEL = settings.presenter_llm_model
SUMMARY_MODEL = settings.summary_llm_model


@CrewBase
class Debate():
    """Debate crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def debater_1(self) -> Agent:
        return Agent(
            config=self.agents_config['debater_1'],
            llm=LLM(model=DEBATER_1_MODEL)
        )

    @agent
    def debater_2(self) -> Agent:
        return Agent(
            config=self.agents_config['debater_2'],
            llm=LLM(model=DEBATER_2_MODEL)
        )

    @agent
    def logical_analyst_judge(self) -> Agent:
        return Agent(
            config=self.agents_config['logical_analyst_judge'],
            verbose=True,
            llm=LLM(model=JUDGE_MODEL)
        )

    @agent
    def debate_strategist_judge(self) -> Agent:
        return Agent(
            config=self.agents_config['debate_strategist_judge'],
            verbose=True,
            llm=LLM(model=JUDGE_MODEL)
        )

    @agent
    def persuasion_judge(self) -> Agent:
        return Agent(
            config=self.agents_config['persuasion_judge'],
            verbose=True,
            llm=LLM(model=JUDGE_MODEL)
        )

    @task
    def generate_debater_1_answer(self) -> Task:
        return Task(
            config=self.tasks_config['generate_answer_debater_1'],
            output_pydantic=DebateTurn,
            agent=self.debater_1(),
            tools=[WebSearchTool()],
        )

    @task
    def generate_debater_2_answer(self) -> Task:
        return Task(
            config=self.tasks_config['generate_answer_debater_2'],
            output_pydantic=DebateTurn,
            agent=self.debater_2(),
            tools=[WebSearchTool()],
        )


    @task
    def logical_analyst_verdict(self) -> Task:
        return Task(
            config=self.tasks_config['logical_analyst_verdict'],
            output_pydantic=LogicalAnalystVerdict,
            agent=self.logical_analyst_judge(),
        )

    @task
    def debate_strategist_verdict(self) -> Task:
        return Task(
            config=self.tasks_config['debate_strategist_verdict'],
            output_pydantic=DebateStrategistVerdict,
            agent=self.debate_strategist_judge(),
        )

    @task
    def persuasion_verdict(self) -> Task:
        return Task(
            config=self.tasks_config['persuasion_verdict'],
            output_pydantic=PersuasionVerdict,
            agent=self.persuasion_judge(),
        )



    @crew
    def debater_1_crew(self) -> Crew:
        return Crew(
            agents=[self.debater_1()],
            tasks=[self.generate_debater_1_answer()],
            verbose=True,
        )

    @crew
    def debater_2_crew(self) -> Crew:
        return Crew(
            agents=[self.debater_2()],
            tasks=[self.generate_debater_2_answer()],
            verbose=True,
        )

    @crew
    def judge_crew(self) -> Crew:
        return Crew(
            agents=[self.logical_analyst_judge(), self.debate_strategist_judge(), self.persuasion_judge()],
            tasks=[self.logical_analyst_verdict(), self.debate_strategist_verdict(), self.persuasion_verdict()],
            verbose=True,
        )
