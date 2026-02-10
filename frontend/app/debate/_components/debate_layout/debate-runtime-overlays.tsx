import DebaterSpeechOverlay from "../debater_speech_overlay/debater-speech-overlay";
import JudgePanel from "../judge/judge-panel";
import CardDetailModal from "../card-detail-modal";
import type { DebateData, Judge } from "@/types/debate";
import type { PlayedCard } from "@/hooks/debateEngine/types";
import type { Side } from "@/types/type_d";

type DebateRuntimeEngine = {
    currentArgument: {
        text: string;
    } | null;
    activeSide: Side | null;
    phase: string;
    completeArgument: () => void;
    revealedJudges: number;
    selectedCard: PlayedCard | null;
    setSelectedCard: (card: PlayedCard | null) => void;
};

type DebateRuntimeOverlaysProps = {
    debate: DebateData;
    engine: DebateRuntimeEngine;
    judges: Judge[];
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
                    revealedJudgeCount={engine.revealedJudges}
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
