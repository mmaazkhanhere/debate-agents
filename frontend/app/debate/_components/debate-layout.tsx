import AgentZone from "./agent_zone/agent-zone";
import ArenaBoard from "./arena_board/arena-board";
import ModeratorZone from "./moderator";

const DebateLayout = ({ debate, engine, onExit }: any) => {
    return (
        <>
            <ModeratorZone
                topic={debate.topic}
                round={engine.roundIndex + 1}
                totalRounds={debate.arguments.length}
                presenterName={engine.presenterName}
            />

            <ArenaBoard
                leftCards={engine.leftCards}
                rightCards={engine.rightCards}
                activeCardId={engine.activeCardId}
            />

            <AgentZone
                side="left"
                name={debate.debaters.left.name}
                confidence={engine.confidence.left}
                score={engine.scores.left}
                title={debate.debaters.left.title}
                avatar={debate.debaters.left.avatar}
                isActive={engine.activeSide === "left"}
                cardsRemaining={engine.leftCards.length}
            />

            <AgentZone
                side="right"
                name={debate.debaters.right.name}
                confidence={engine.confidence.right}
                score={engine.scores.right}
                title={debate.debaters.right.title}
                avatar={debate.debaters.right.avatar}
                isActive={engine.activeSide === "right"}
                cardsRemaining={engine.rightCards.length}
            />
        </>
    );
}

export default DebateLayout
