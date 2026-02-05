
import DebaterSection from "../agent_zone/debater-section";
import { ArenaBoard } from "../arena_board/arena-board";

type DebateArenaProps = {
    debate: any;
    engine: any;
}

const DebateArena = ({ debate, engine }: DebateArenaProps) => {
    return (
        <main className="relative flex flex-1 flex-col items-stretch gap-6 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-12 md:py-8 md:pb-10">
            {/* Left Agent */}
            <div className="z-10 order-1 w-full md:w-80">
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
            <section className="relative order-2 flex min-h-[320px] w-full flex-1 items-center justify-center md:absolute md:inset-0 md:min-h-0">
                <div className="h-full w-full max-w-4xl">
                    <ArenaBoard
                        leftCards={engine.leftCards}
                        rightCards={engine.rightCards}
                        activeCardId={engine.activeCardId}
                        onCardSelect={engine.setSelectedCard}
                    />
                </div>
            </section>

            {/* Right Agent */}
            <div className="z-10 order-3 w-full md:w-80">
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
