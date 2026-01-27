import json
import redis
from crewai.events import BaseEventListener, AgentExecutionCompletedEvent, LLMCallCompletedEvent

redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

def publish(debate_id: str, event: str, data: dict):
    redis_client.xadd(
        f"debate:{debate_id}",
        {
            "event": event,
            "data": json.dumps(data),
        },
        maxlen=1000,
        approximate=True,
    )

class DebateEventListener(BaseEventListener):
    def __init__(self, debate_id: str):
        super().__init__()
        self.debate_id = debate_id

    def setup_listeners(self, crewai_event_bus):

        @crewai_event_bus.on(AgentExecutionCompletedEvent)
        def on_agent_done(_, event):
            publish(
                self.debate_id,
                "agent_done",
                {
                    "agent": event.agent.role,
                    "output": event.output,
                },
            )