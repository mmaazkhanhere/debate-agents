import json
import redis
import os

from .models import DebateTurn

from pathlib import Path

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

OUTPUT_FILE = Path("debate_round.json")

def append_turn(turn: DebateTurn):
    data = []

    if OUTPUT_FILE.exists():
        try:
            content = OUTPUT_FILE.read_text(encoding="utf-8").strip()
            if content:
                data = json.loads(content)
                if not isinstance(data, list):
                    raise ValueError("JSON root is not a list")
        except (json.JSONDecodeError, ValueError):
            data = []

    # Check for duplicate turn_id to prevent same turn being added multiple times
    turn_dict = turn.model_dump()
    for existing_turn in data:
        if existing_turn.get("turn_id") == turn_dict["turn_id"]:
            print(f"Duplicate turn_id detected, skipping: {turn_dict['turn_id']}")
            return

    data.append(turn_dict)

    temp_file = OUTPUT_FILE.with_suffix(".tmp")
    temp_file.write_text(json.dumps(data, indent=2), encoding="utf-8")
    temp_file.replace(OUTPUT_FILE)



def load_persona(debater_name: str) -> str:
    """Load persona YAML from the knowledge folder."""
    # Convert name to file format: "Elon Musk" -> "elon_musk"
    filename = debater_name.lower().replace(" ", "_")
    
    # Try common extensions
    for ext in [".yaml", ".yml", ".txt"]:
        path = Path("knowledge") / f"{filename}{ext}"
        if path.exists():
            return path.read_text(encoding="utf-8")
    
    # Fallback if not found
    return f"Persona profile for {debater_name}"

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    decode_responses=True,
)