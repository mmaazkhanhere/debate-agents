
from .schemas import DebateTurn
import json
from pathlib import Path

from typing import Iterable

OUTPUT_FILE = Path("debate_round.json")

def history_as_text(turns: Iterable[object]) -> str:
    """
    Convert structured debate turns into an LLM-safe text history.
    """
    turns_list = list(turns)
    if not turns_list:
        return "No prior debate history."

    lines: list[str] = []
    for i, turn in enumerate(turns_list, start=1):
        argument = getattr(turn, "argument", None)
        argument_type = getattr(argument, "type", "unknown")
        argument_confidence = getattr(argument, "confidence", "unknown")
        argument_text = getattr(argument, "text", "")
        debater = getattr(turn, "debater", "unknown")
        lines.append(
            "Round {i} -- {debater} ({arg_type}, confidence {confidence}/100):\n{arg_text}".format(
                i=i,
                debater=debater,
                arg_type=argument_type,
                confidence=argument_confidence,
                arg_text=argument_text,
            )
        )

    return "\n\n".join(lines)


def append_turn(turn: DebateTurn) -> None:
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
