import { useEffect, useRef, useState } from "react";

interface UseTypewriterOptions {
    text: string;
    enabled: boolean;
    speed?: number;
    delayAfterComplete?: number;
    onComplete?: () => void;
}

export function useTypewriter({
    text,
    enabled,
    speed = 30,
    delayAfterComplete = 2000,
    onComplete,
}: UseTypewriterOptions) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const indexRef = useRef(0);
    const timeoutRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled || !text) {
            setDisplayedText("");
            setIsTyping(false);
            indexRef.current = 0;
            return;
        }

        setIsTyping(true);
        setDisplayedText("");
        indexRef.current = 0;

        intervalRef.current = window.setInterval(() => {
            indexRef.current += 1;
            setDisplayedText(text.slice(0, indexRef.current));

            if (indexRef.current >= text.length) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }

                setIsTyping(false);

                timeoutRef.current = window.setTimeout(() => {
                    onComplete?.();
                }, delayAfterComplete);
            }
        }, speed);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [enabled, text, speed, delayAfterComplete, onComplete]);

    return { displayedText, isTyping };
}
