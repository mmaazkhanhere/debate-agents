import logging


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
print(result.token_usage)
