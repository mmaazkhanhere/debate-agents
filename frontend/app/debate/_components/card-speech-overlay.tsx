import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTypewriter } from "@/hooks/useTypewriter";

interface CardSpeechOverlayProps {
    text: string;
    speaker: string;
    side: "left" | "right";
    isVisible: boolean;
    onComplete?: () => void;
}

const CardSpeechOverlay = ({
    text,
    speaker,
    side,
    isVisible,
    onComplete,
}: CardSpeechOverlayProps) => {
    const { displayedText, isTyping } = useTypewriter({
        text,
        enabled: isVisible,
        onComplete,
    });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-x-0 bottom-0 z-50 pointer-events-none"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/95 to-transparent" />

                    <div className="relative mx-auto max-w-4xl px-8 pb-8 pt-12">
                        {/* Speaker */}
                        <motion.div
                            className={cn(
                                "mb-4 flex items-center gap-3",
                                side === "left" ? "justify-start" : "justify-end"
                            )}
                            initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <motion.div
                                className={cn(
                                    "h-0.5 w-12 rounded-full",
                                    side === "left"
                                        ? "bg-linear-to-r from-blue-500 to-transparent"
                                        : "bg-linear-to-l from-red-500 to-transparent"
                                )}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.2 }}
                            />

                            <span
                                className={cn(
                                    "text-sm font-medium uppercase tracking-wider",
                                    side === "left" ? "text-blue-400" : "text-red-400"
                                )}
                            >
                                {speaker}
                            </span>

                            {isTyping && <TypingDots side={side} />}
                        </motion.div>

                        {/* Speech bubble */}
                        <motion.div
                            className={cn(
                                "relative rounded-2xl border bg-slate-900/80 p-6 backdrop-blur-sm",
                                side === "left"
                                    ? "border-blue-500/30"
                                    : "border-red-500/30"
                            )}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            <AccentLine side={side} />

                            <p className="text-center text-lg font-medium leading-relaxed text-foreground/95 md:text-xl">
                                “{displayedText}”
                                {isTyping && (
                                    <span
                                        className={cn(
                                            "ml-1 inline-block h-5 w-0.5 align-middle",
                                            side === "left" ? "bg-blue-400" : "bg-red-400"
                                        )}
                                    />
                                )}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default CardSpeechOverlay;

/*-----------------------------------
HELPER COMPONENTS
------------------------------------*/

function TypingDots({ side }: { side: "left" | "right" }) {
    return (
        <motion.div
            className="flex gap-1"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
        >
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        side === "left" ? "bg-blue-400" : "bg-red-400"
                    )}
                />
            ))}
        </motion.div>
    );
}

function AccentLine({ side }: { side: "left" | "right" }) {
    return (
        <div
            className={cn(
                "absolute left-1/2 top-0 h-1 w-24 -translate-x-1/2 -translate-y-0.5 rounded-full",
                side === "left"
                    ? "bg-linear-to-r from-transparent via-blue-500 to-transparent"
                    : "bg-linear-to-r from-transparent via-red-500 to-transparent"
            )}
        />
    );
}
