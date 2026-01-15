from debate.models import DebateTurn
import json

from pathlib import Path

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

    data.append(turn.model_dump())

    temp_file = OUTPUT_FILE.with_suffix(".tmp")
    temp_file.write_text(json.dumps(data, indent=2), encoding="utf-8")
    temp_file.replace(OUTPUT_FILE)
