import AgentZone from "./agent_zone/agent-zone";
import ArenaBoard from "./arena_board/arena-board";
import ModeratorZone from "./moderator";
import CardSpeechOverlay from "./card-speech-overlay";
import JudgePanel from "./judge/judge-panel";
import CardDetailModal from "./card-detail-modal";

const DebateLayout = ({ debate, engine, onExit }: any) => {
    const isJudging = engine.phase === "judging" || engine.phase === "verdict";

    const winner = engine.phase === "verdict"
        ? (debate.judges.filter((j: any) => j.vote === "left").length > debate.judges.filter((j: any) => j.vote === "right").length ? "left" : "right")
        : null;

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-50">
            <ModeratorZone
                topic={debate.topic}
                round={engine.roundIndex + 1}
                totalRounds={debate.arguments.length}
                presenterName={debate.presenter.name}
                announcement={engine.phase === "intro" ? debate.presenter.introText : undefined}
                onAnnouncementComplete={engine.phase === "intro" ? engine.nextRound : undefined}
            />

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

            {engine.currentArgument && (
                <CardSpeechOverlay
                    text={engine.currentArgument.text}
                    speaker={engine.activeSide === "left" ? debate.debaters.left.name : debate.debaters.right.name}
                    side={engine.activeSide || "left"}
                    isVisible={engine.phase === "speaking"}
                    onComplete={engine.applyReaction}
                />
            )}

            {isJudging && (
                <JudgePanel
                    judges={debate.judges}
                    revealedCount={engine.revealedJudges}
                    winner={winner}
                    debaterNames={{
                        left: debate.debaters.left.name,
                        right: debate.debaters.right.name
                    }}
                />
            )}

            <CardDetailModal
                isOpen={!!engine.selectedCard}
                onClose={() => engine.setSelectedCard(null)}
                card={engine.selectedCard}
            />
        </div>
    );
}

export default DebateLayout
