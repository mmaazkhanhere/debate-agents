import CardSpeechOverlay from "../card-speech-overlay";
import JudgePanel from "../judge/judge-panel";
import CardDetailModal from "../card-detail-modal";

type DebateOverlaysProps = {
    debate: any;
    engine: any;
    judges: any[];
    isJudging: boolean;
    winner: string | null;
}

const DebateOverlays = ({
    debate,
    engine,
    judges,
    isJudging,
    winner,
}: DebateOverlaysProps) => {
    return (
        <>
            {/* Speech Overlay */}
            {engine.currentArgument && (
                <CardSpeechOverlay
                    text={engine.currentArgument.text}
                    speaker={
                        engine.activeSide === "left"
                            ? debate.debaters.left.name
                            : debate.debaters.right.name
                    }
                    side={engine.activeSide || "left"}
                    isVisible={engine.phase === "speaking"}
                    onComplete={engine.completeArgument}
                />
            )}

            {/* Judge Panel */}
            {isJudging && judges.length > 0 && (
                <JudgePanel
                    judges={judges}
                    revealedCount={engine.revealedJudges}
                    winner={winner}
                    debaterNames={{
                        left: debate.debaters.left.name,
                        right: debate.debaters.right.name,
                    }}
                />
            )}

            {/* Card Detail Modal */}
            <CardDetailModal
                isOpen={!!engine.selectedCard}
                onClose={() => engine.setSelectedCard(null)}
                card={engine.selectedCard}
            />
        </>
    );
};

export default DebateOverlays;
