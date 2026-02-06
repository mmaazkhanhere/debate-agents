import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTypewriter } from "@/hooks/useTypewriter";
import SpeakerHeader from "./speaker-header";
import SpeechBubble from "./speech-bubble";

export type SpeechSide = "left" | "right";

type DebaterSpeechOverlayProps = {
    speechText: string;
    debaterName: string;
    debaterSide: "left" | "right";
    isActiveTurn: boolean;
    onSpeechFinished?: () => void;
}

const DebaterSpeechOverlay = ({
    speechText,
    debaterName,
    debaterSide,
    isActiveTurn,
    onSpeechFinished,
}: DebaterSpeechOverlayProps) => {
    const { displayedText, isTyping } = useTypewriter({
        text: speechText,
        enabled: isActiveTurn,
        onComplete: onSpeechFinished,
    });

    return (
        <AnimatePresence>
            {isActiveTurn && (
                <motion.div
                    className="fixed inset-x-0 bottom-0 z-50 pointer-events-none"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/95 to-transparent" />

                    <div className="relative mx-auto max-w-4xl px-8 pb-8 pt-12">
                        <SpeakerHeader
                            name={debaterName}
                            side={debaterSide}
                            isTyping={isTyping}
                        />

                        <SpeechBubble
                            text={displayedText}
                            side={debaterSide}
                            isTyping={isTyping}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default DebaterSpeechOverlay;
