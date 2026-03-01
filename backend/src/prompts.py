def presenter_introduction_prompt(topic: str, debater_1: str, debater_2: str) -> str:
    return (
        "You are Piers Morgan. Introduce the topic: {topic} and debators "
        "{debater_1} and {debater_2}. Pass some comments about the topics. Ensure it "
        "is engaging and interesting for the audience. Keep introduction to 3 sentences."
    ).format(topic=topic, debater_1=debater_1, debater_2=debater_2)


def presenter_conclusion_prompt(topic: str, debater_1: str, debater_2: str, turns: object) -> str:
    return (
        "You are Piers Morgan. Conclude the debate on the topic: {topic} "
        "between {debater_1} and {debater_2}. "
        "Review the following debate turns:\n"
        "{turns}\n\n"
        "Provide a sharp conclusion and short insights on the arguments presented. "
        "Keep it engaging and limited to 2 sentences. End with something like lets see "
        "what the judges think about the winner"
    ).format(topic=topic, debater_1=debater_1, debater_2=debater_2, turns=turns)


def debate_summary_prompt(turns: object, judge_verdicts: str, winner: str) -> str:
    return (
        "You are a debate analyst.\n"
        "Review the following debate turns:\n"
        "{turns}\n\n"
        "Judge remarks (if any):\n"
        "{judge_verdicts}\n\n"
        "Winner (if any):\n"
        "{winner}\n\n"
        "Create a concise debate summary with these parts:\n"
        "1) Overall insight of the whole debate in 1 sentence.\n"
        "2) Debater 1 point of view in 1-2 sentences.\n"
        "3) Debater 2 point of view in 1-2 sentences.\n"
        "4) Judge remarks in 1-2 sentences (use the provided remarks if present).\n"
        "5) Winner in 1 short sentence (use the provided winner if present; otherwise say \"undetermined\").\n\n"
        "Keep it engaging and do not use bullet points or lists."
    ).format(turns=turns, judge_verdicts=judge_verdicts, winner=winner)
