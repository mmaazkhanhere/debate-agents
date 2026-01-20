import asyncio
from fastapi import FastAPI, WebSocket
from crewai import Agent, Task, Crew, Process

app: FastAPI = FastAPI()
agent_output_queue = asyncio.Queue()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    question = await websocket.receive_text()
    await websocket.send_text(f"🧠 Crew solving the question: {question}\n")

    asyncio.create_task(run_crews(question))

    while True:
        message = await agent_output_queue.get()
        await websocket.send_text(message)
        if message == "[DONE]":
            break


async def run_crews(question: str):
    #Agents
    solver_agent = Agent(
        role="Solution Provider",
        goal="Solve the question and return answer only",
        backstory="You are a smart assistant that can solve any question",
    )

    explainer_agent = Agent(
        role="Explanation Provider",
        goal="Explain the solution in simple terms",
        backstory="You are a smart assistant that can explain any solution",
    )

    solving_task = Task(
        description=f"Solve the question: {question}",
        expected_output="The answer to the question.",
        agent=solver_agent
    )


    explaining_task = Task(
        description=f"Explain the solution: {question}",
        expected_output="The explanation of the solution.",
        agent=explainer_agent
    )


    solution_crew = Crew(
        agents=[solver_agent],
        tasks=[solving_task],
        process=Process.sequential
    )

    solution_answer = await asyncio.to_thread(solution_crew.kickoff)
    await agent_output_queue.put(f"✅ Solution generated:\n{solution_answer}\n")

    explanation_crew = Crew(
        agents=[explainer_agent],
        tasks=[explaining_task],
        process=Process.sequential
    )

    explanation_answer = await asyncio.to_thread(explanation_crew.kickoff)
    await agent_output_queue.put(f"✅ Explanation generated:\n{explanation_answer}\n")

    await agent_output_queue.put("[DONE]")

