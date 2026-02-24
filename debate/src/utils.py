import json

from .models import DebateTurn

from pathlib import Path

from app.cache import (
    REDIS_HOST,
    REDIS_PORT,
    DEBATE_CACHE_ENABLED,
    DEBATE_CACHE_TTL_SECONDS,
    DEBATE_LOCK_TTL_SECONDS,
    acquire_generation_lock,
    build_cache_key,
    build_inflight_key,
    build_lock_key,
    delete_inflight_debate_id,
    get_cached_debate_id,
    get_inflight_debate_id,
    redis_client,
    release_generation_lock,
    set_cached_debate_id,
    set_inflight_debate_id,
)

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
