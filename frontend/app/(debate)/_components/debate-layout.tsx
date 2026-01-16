import AgentZone from "./agent_zone/agent-zone";

const DebateLayout = ({ debate, engine, onExit }) => {
    return (
        <>
            <ModeratorZone
                topic={debate.topic}
                round={engine.roundIndex + 1}
                totalRounds={debate.arguments.length}
            />

            <ArenaBoard
                leftCards={engine.leftCards}
                rightCards={engine.rightCards}
            />

            <AgentZone
                side="left"
                name={debate.debaters.left.name}
                confidence={engine.confidence.left}
                score={engine.scores.left}
            />

            <AgentZone
                side="right"
                name={debate.debaters.right.name}
                confidence={engine.confidence.right}
                score={engine.scores.right}
            />
        </>
    );
}

export default DebateLayout
