import { useCountdown } from "@/hooks/useCountdown";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState, memo } from "react";

interface TimerProps {
    totalSeconds: number;
    isRunning: boolean;
    onComplete?: () => void;
}


export const Timer = memo(function Timer({ totalSeconds, isRunning, onComplete }: TimerProps) {
    const remaining = useCountdown(totalSeconds, isRunning, onComplete);

    const { minutes, seconds, progress, isLow } = useMemo(() => {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        return {
            minutes: m,
            seconds: s,
            progress: remaining / totalSeconds,
            isLow: remaining <= 30,
        };
    }, [remaining, totalSeconds]);

    return (
        <section
            aria-label="Debate countdown timer"
            className="flex flex-col items-center gap-2"
            itemScope
            itemType="https://schema.org/Duration"
        >
            <motion.div
                animate={{ scale: isLow ? [1, 1.03, 1] : 1 }}
                transition={{ duration: 0.5, repeat: isLow ? Infinity : 0 }}
            >
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" role="img" aria-label="Time remaining">
                        <circle cx="48" cy="48" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />

                        <motion.circle
                            cx="48"
                            cy="48"
                            r="44"
                            fill="none"
                            stroke={isLow ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={276.46}
                            strokeDashoffset={276.46 * (1 - progress)}
                        />
                    </svg>

                    <time
                        aria-live="polite"
                        className={`absolute inset-0 flex items-center justify-center timer-display ${isLow ? "text-destructive" : "text-primary"
                            }`}
                        dateTime={`PT${remaining}S`}
                    >
                        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </time>
                </div>
            </motion.div>

            <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {isRunning ? "Live" : "Ready"}
            </span>
        </section>
    );
});
