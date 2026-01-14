import json

from pathlib import Path
from src.debate.models import DebateTurn

OUTPUT_FILE = Path("debate_round.json")

def append_turn(turn: DebateTurn):
    if OUTPUT_FILE.exists():
        data = json.loads(OUTPUT_FILE.read_text())
    else:
        data = []

    data.append(turn.model_dump())
    OUTPUT_FILE.write_text(json.dumps(data, indent=2))