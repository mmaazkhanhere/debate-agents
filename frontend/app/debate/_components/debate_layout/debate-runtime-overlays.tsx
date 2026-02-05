import DebaterSpeechOverlay from "../debater_speech_overlay/debater-speech-overlay";
import JudgePanel from "../judge/judge-panel";
import CardDetailModal from "../card-detail-modal";

type DebateRuntimeOverlaysProps = {
    debate: any;
    engine: any;
    judges: any[];
    isJudging: boolean;
    winner: string | null;
}

const DebateRuntimeOverlays = ({
    debate,
    engine,
    judges,
    isJudging,
    winner,
}: DebateRuntimeOverlaysProps) => {
    return (
        <>
            {/* Speech Overlay */}
            {engine.currentArgument && (
                <DebaterSpeechOverlay
                    speechText={engine.currentArgument.text}
                    debaterName={
                        engine.activeSide === "left"
                            ? debate.debaters.left.name
                            : debate.debaters.right.name
                    }
                    debaterSide={engine.activeSide || "left"}
                    isActiveTurn={engine.phase === "speaking"}
                    onSpeechFinished={engine.completeArgument}
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

export default DebateRuntimeOverlays;
