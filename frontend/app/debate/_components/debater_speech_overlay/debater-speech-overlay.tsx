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

// /*-----------------------------------
// HELPER COMPONENTS
// ------------------------------------*/

// function TypingDots({ side }: { side: "left" | "right" }) {
//     return (
//         <motion.div
//             className="flex gap-1"
//             animate={{ opacity: [1, 0.5, 1] }}
//             transition={{ duration: 0.5, repeat: Infinity }}
//         >
//             {Array.from({ length: 3 }).map((_, i) => (
//                 <div
//                     key={i}
//                     className={cn(
//                         "h-1.5 w-1.5 rounded-full",
//                         side === "left" ? "bg-blue-400" : "bg-red-400"
//                     )}
//                 />
//             ))}
//         </motion.div>
//     );
// }

// function AccentLine({ side }: { side: "left" | "right" }) {
//     return (
//         <div
//             className={cn(
//                 "absolute left-1/2 top-0 h-1 w-24 -translate-x-1/2 -translate-y-0.5 rounded-full",
//                 side === "left"
//                     ? "bg-linear-to-r from-transparent via-blue-500 to-transparent"
//                     : "bg-linear-to-r from-transparent via-red-500 to-transparent"
//             )}
//         />
//     );
// }
