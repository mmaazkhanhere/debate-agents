from debate.main import DebateFlow
def run():
    """Run the debate flow."""
    initial_state = {
        "topic": "Strict laws should regulate the development of Large Language Models",
    }

    flow = DebateFlow()
    final_result = flow.kickoff(inputs=initial_state)

    print("\n" + "=" * 40)
    print("DEBATE FINISHED")
    print("=" * 40)
    print(final_result)


if __name__ == "__main__":
    run()