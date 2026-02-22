import json
import redis
import os
import hashlib
import time
import uuid

from .models import DebateTurn

from pathlib import Path

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

OUTPUT_FILE = Path("debate_round.json")

DEBATE_CACHE_ENABLED = os.getenv("DEBATE_CACHE_ENABLED", "true").strip().lower() in {
    "1",
    "true",
    "yes",
    "y",
}
DEBATE_CACHE_TTL_SECONDS = int(os.getenv("DEBATE_CACHE_TTL_SECONDS", "1800"))
DEBATE_LOCK_TTL_SECONDS = int(os.getenv("DEBATE_LOCK_TTL_SECONDS", "240"))

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


def _normalize_cache_input(value: str) -> str:
    if value is None:
        return ""
    collapsed = " ".join(value.strip().split())
    return collapsed.lower()


def build_cache_key(
    topic: str,
    debater_1: str,
    debater_2: str,
    user_id: str | None,
    session_id: str,
) -> str:
    scope = f"user:{user_id}" if user_id else f"session:{session_id}"
    normalized = "|".join(
        [
            _normalize_cache_input(topic),
            _normalize_cache_input(debater_1),
            _normalize_cache_input(debater_2),
        ]
    )
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return f"debate:cache:{scope}:{digest}"


def build_lock_key(cache_key: str) -> str:
    return cache_key.replace("debate:cache:", "debate:lock:", 1)


def build_inflight_key(cache_key: str) -> str:
    return cache_key.replace("debate:cache:", "debate:inflight:", 1)


def get_cached_debate_id(cache_key: str) -> str | None:
    return redis_client.get(cache_key)


def set_cached_debate_id(cache_key: str, debate_id: str, ttl_seconds: int) -> None:
    redis_client.setex(cache_key, ttl_seconds, debate_id)


def acquire_generation_lock(lock_key: str, ttl_seconds: int) -> str | None:
    token = uuid.uuid4().hex
    acquired = redis_client.set(lock_key, token, nx=True, ex=ttl_seconds)
    return token if acquired else None


def release_generation_lock(lock_key: str, token: str) -> bool:
    script = """
    if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
    else
        return 0
    end
    """
    try:
        result = redis_client.eval(script, 1, lock_key, token)
        return result == 1
    except redis.RedisError:
        return False


def set_inflight_debate_id(inflight_key: str, debate_id: str, ttl_seconds: int) -> None:
    redis_client.setex(inflight_key, ttl_seconds, debate_id)


def get_inflight_debate_id(inflight_key: str) -> str | None:
    return redis_client.get(inflight_key)


def delete_inflight_debate_id(inflight_key: str) -> None:
    redis_client.delete(inflight_key)
