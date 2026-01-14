from debate.models import DebateTurn
from crewai import Agent, Crew, Process, Task
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
            verbose=True
        )

    @agent
    def debater_2(self) -> Agent:
        return Agent(
            config=self.agents_config['debater_2'],
            verbose=True
        )

    # @agent
    # def logical_analyst_judge(self) -> Agent:
    #     return Agent(
    #         config=self.agents_config['logical_analyst_judge'],
    #         verbose=True
    #     )

    # @agent
    # def debate_strategist_judge(self) -> Agent:
    #     return Agent(
    #         config=self.agents_config['debate_strategist_judge'],
    #         verbose=True
    #     )

    # @agent
    # def persuasion_judge(self) -> Agent:
    #     return Agent(
    #         config=self.agents_config['persuasion_judge'],
    #         verbose=True
        # )

    # @task
    # def debater_1_prepare_stance(self) -> Task:
    #     return Task(
    #         config=self.tasks_config['debater_1_prepare_stance'],
    #         output_pydantic=StanceStrategy
    #     )

    # @task
    # def debater_2_prepare_stance(self) -> Task:
    #     return Task(
    #         config=self.tasks_config['debater_2_prepare_stance'],
    #         output_pydantic=StanceStrategy
    #     )

    # @task
    # def generate_debate_turn(self) -> Task:
    #     return Task(
    #         config=self.tasks_config['generate_debate_turn'],
    #         output_pydantic=DebateTurn
    #     )

    # @task
    # def logical_analyst_verdict(self) -> Task:
    #     return Task(
    #         config=self.tasks_config['logical_analyst_verdict'],
    #         output_pydantic=JudgeVerdict
    #     )

    # @task
    # def debate_strategist_verdict(self) -> Task:
    #     return Task(
    #         config=self.tasks_config['debate_strategist_verdict'],
    #         output_pydantic=JudgeVerdict
    #     )

    # @task
    # def persuasion_verdict(self) -> Task:
    #     return Task(
    #         config=self.tasks_config['persuasion_verdict'],
    #         output_pydantic=JudgeVerdict
    #     )


    @task
    def generate_debater_1_answer(self) -> Task:
        return Task(
            config=self.tasks_config['generate_debate_turn'],
            output_pydantic=DebateTurn,
            agent=self.debater_1(),
            tools=[],
            tool_choice='none',
        )

    @task
    def generate_debater_2_answer(self) -> Task:
        return Task(
            config=self.tasks_config['generate_debate_turn'],
            output_pydantic=DebateTurn,
            agent=self.debater_2(),
            tools=[],
            tool_choice='none',
        )