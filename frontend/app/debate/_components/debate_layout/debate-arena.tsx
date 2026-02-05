
import DebaterSection from "../agent_zone/debater-section";
import { ArenaBoard } from "../arena_board/arena-board";

type DebateArenaProps = {
    debate: any;
    engine: any;
}

const DebateArena = ({ debate, engine }: DebateArenaProps) => {
    return (
        <main className="relative flex flex-1 items-center justify-between px-12 py-8">
            {/* Left Agent */}
            <div className="z-10 w-80">
                <DebaterSection
                    side="left"
                    name={debate.debaters.left.name}
                    debaterConfidence={engine.confidence.left}
                    debaterScore={engine.scores.left}
                    title={debate.debaters.left.title}
                    avatar={debate.debaters.left.avatar}
                    isCurrentTurn={engine.activeSide === "left"}
                    cardsRemaining={3 - engine.leftCards.length}
                />
            </div>

            {/* Arena Board */}
            <section className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-4xl h-full">
                    <ArenaBoard
                        leftCards={engine.leftCards}
                        rightCards={engine.rightCards}
                        activeCardId={engine.activeCardId}
                        onCardSelect={engine.setSelectedCard}
                    />
                </div>
            </section>

            {/* Right Agent */}
            <div className="z-10 w-80">
                <DebaterSection
                    side="right"
                    name={debate.debaters.right.name}
                    debaterConfidence={engine.confidence.right}
                    debaterScore={engine.scores.right}
                    title={debate.debaters.right.title}
                    avatar={debate.debaters.right.avatar}
                    isCurrentTurn={engine.activeSide === "right"}
                    cardsRemaining={3 - engine.rightCards.length}
                />
            </div>
        </main>
    );
};

export default DebateArena;
