
from .models import DebateTurn, JudgeVerdictResponse, DebateWinner
from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task


@CrewBase
class Debate():
    """Debate crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def debater_1(self) -> Agent:
        return Agent(
            config=self.agents_config['debater_1'],
            llm=LLM(model="groq/llama-3.1-8b-instant")
        )

    @agent
    def debater_2(self) -> Agent:
        return Agent(
            config=self.agents_config['debater_2'],
            llm=LLM(model="groq/openai/gpt-oss-20b")
        )

    @agent
    def logical_analyst_judge(self) -> Agent:
        return Agent(
            config=self.agents_config['logical_analyst_judge'],
            verbose=True,
            llm=LLM(model="groq/llama-3.3-70b-versatile")
        )

    @agent
    def debate_strategist_judge(self) -> Agent:
        return Agent(
            config=self.agents_config['debate_strategist_judge'],
            verbose=True,
            llm=LLM(model="groq/llama-3.3-70b-versatile")
        )

    @agent
    def persuasion_judge(self) -> Agent:
        return Agent(
            config=self.agents_config['persuasion_judge'],
            verbose=True,
            llm=LLM(model="groq/llama-3.3-70b-versatile")
        )

    @task
    def generate_debater_1_answer(self) -> Task:
        return Task(
            config=self.tasks_config['generate_answer_debater_1'],
            output_pydantic=DebateTurn,
            agent=self.debater_1(),
            tools=[],
        )

    @task
    def generate_debater_2_answer(self) -> Task:
        return Task(
            config=self.tasks_config['generate_answer_debater_2'],
            output_pydantic=DebateTurn,
            agent=self.debater_2(),
            tools=[],
        )


    @task
    def logical_analyst_verdict(self) -> Task:
        return Task(
            config=self.tasks_config['logical_analyst_verdict'],
            output_pydantic=JudgeVerdictResponse
        )

    @task
    def debate_strategist_verdict(self) -> Task:
        return Task(
            config=self.tasks_config['debate_strategist_verdict'],
            output_pydantic=JudgeVerdictResponse
        )

    @task
    def persuasion_verdict(self) -> Task:
        return Task(
            config=self.tasks_config['persuasion_verdict'],
            output_pydantic=JudgeVerdictResponse
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
            response_format=DebateWinner
        )
