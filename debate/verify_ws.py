import logging

from crewai.events import (
    CrewKickoffStartedEvent,
    CrewKickoffCompletedEvent,
    AgentExecutionCompletedEvent,
    FlowStartedEvent
)
from crewai.events import BaseEventListener

from crewai.flow import Flow, listen, start

LOG = logging.getLogger("debate_flow")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)


class MyCustomListener(BaseEventListener):
    def __init__(self):
        super().__init__()

    def setup_listeners(self, crewai_event_bus):
        @crewai_event_bus.on(CrewKickoffStartedEvent)
        def on_crew_started(source, event):
            print(f"Crew '{event.crew_name}' has started!")

        @crewai_event_bus.on(CrewKickoffCompletedEvent)
        def on_crew_completed(source, event):
            print(f"Crew '{event.crew_name}' completed! Output: {event.output}")

        @crewai_event_bus.on(AgentExecutionCompletedEvent)
        def on_agent_done(source, event):
            print(f"Agent '{event.agent.role}' finished task")


my_listener = MyCustomListener()

# main.py or flow.py
from crewai import Agent, Crew, Task, LLM
from crewai.flow import Flow, listen, start


researcher = Agent(
    role="Math Tutor",
    goal="Give simple explanation to the problem and solve it",
    backstory="Expert maths teacher",
)

research_task = Task(
    description="Solve the problem: {topic}",
    expected_output="Solution and short explanation",
    agent=researcher,
)

crew = Crew(agents=[researcher], tasks=[research_task])
result = crew.kickoff(inputs={"topic": "What is the square root of 16?"})
