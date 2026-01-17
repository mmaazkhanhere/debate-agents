import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, memo } from "react";

type SpeakerSide = "left" | "right" | "presenter";

interface SpeechBubbleProps {
    text: string;
    side: SpeakerSide;
    isTyping?: boolean;
    onComplete?: () => void;
}

/* ---------- Hook ---------- */

function useTypewriter(text: string, enabled: boolean, onDone?: () => void) {
    const [value, setValue] = useState(enabled ? "" : text);
    const [done, setDone] = useState(!enabled);

    useEffect(() => {
        if (!enabled) {
            setValue(text);
            setDone(true);
            return;
        }

        let i = 0;
        setValue("");
        setDone(false);

        const id = setInterval(() => {
            if (i < text.length) {
                setValue(text.slice(0, ++i));
            } else {
                clearInterval(id);
                setDone(true);
                onDone?.();
            }
        }, 30);

        return () => clearInterval(id);
    }, [text, enabled, onDone]);

    return { value, done };
}

/* ---------- Component ---------- */

export const SpeechBubble = memo(function SpeechBubble({
    text,
    side,
    isTyping = true,
    onComplete,
}: SpeechBubbleProps) {
    const { value, done } = useTypewriter(text, isTyping, onComplete);

    const style = {
        presenter: {
            bubble: "speech-bubble-presenter mx-auto max-w-2xl",
            tail: "bottom-0 left-1/2 -translate-x-1/2 translate-y-2 bg-primary/10 border-b border-r border-primary/30",
            schema: "https://schema.org/Person",
        },
        left: {
            bubble: "speech-bubble-left mr-auto ml-4",
            tail: "bottom-4 -left-2 bg-debater-left/15 border-l border-b border-debater-left/40",
            schema: "https://schema.org/Person",
        },
        right: {
            bubble: "speech-bubble-right ml-auto mr-4",
            tail: "bottom-4 -right-2 bg-debater-right/15 border-r border-t border-debater-right/40",
            schema: "https://schema.org/Person",
        },
    }[side];

    return (
        <AnimatePresence>
            <motion.article
                aria-live="polite"
                className={`speech-bubble ${style.bubble} max-w-md md:max-w-lg relative`}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                itemScope
                itemType={style.schema}
            >
                <p itemProp="description" className="text-foreground text-sm md:text-base leading-relaxed">
                    {value}
                    {!done ? <span aria-hidden className="inline-block w-0.5 h-4 ml-1 bg-foreground/70 animate-pulse" /> : null}
                </p>

                <span aria-hidden className={`absolute w-4 h-4 rotate-45 ${style.tail}`} />
            </motion.article>
        </AnimatePresence>
    );
});
