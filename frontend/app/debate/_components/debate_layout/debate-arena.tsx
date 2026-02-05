import AgentZone from "../agent_zone/agent-zone";
import ArenaBoard from "../arena_board/arena-board";

type DebateArenaProps = {
    debate: any;
    engine: any;
}

const DebateArena = ({ debate, engine }: DebateArenaProps) => {
    return (
        <main className="relative flex flex-1 items-center justify-between px-12 py-8">
            {/* Left Agent */}
            <div className="z-10 w-80">
                <AgentZone
                    side="left"
                    name={debate.debaters.left.name}
                    confidence={engine.confidence.left}
                    score={engine.scores.left}
                    title={debate.debaters.left.title}
                    avatar={debate.debaters.left.avatar}
                    isActive={engine.activeSide === "left"}
                    cardsRemaining={3 - engine.leftCards.length}
                />
            </div>

            {/* Arena Board */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-4xl h-full">
                    <ArenaBoard
                        leftCards={engine.leftCards}
                        rightCards={engine.rightCards}
                        activeCardId={engine.activeCardId}
                        onCardClick={engine.setSelectedCard}
                    />
                </div>
            </div>

            {/* Right Agent */}
            <div className="z-10 w-80">
                <AgentZone
                    side="right"
                    name={debate.debaters.right.name}
                    confidence={engine.confidence.right}
                    score={engine.scores.right}
                    title={debate.debaters.right.title}
                    avatar={debate.debaters.right.avatar}
                    isActive={engine.activeSide === "right"}
                    cardsRemaining={3 - engine.rightCards.length}
                />
            </div>
        </main>
    );
};

export default DebateArena;
