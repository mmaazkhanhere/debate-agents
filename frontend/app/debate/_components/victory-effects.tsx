import { motion, AnimatePresence } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";

type WinnerSide = "left" | "right" | null;

interface VictoryEffectsProps {
    isActive: boolean;
    winner: WinnerSide;
}

interface Confetti {
    id: number;
    x: number;
    color: string;
    delay: number;
    size: number;
    rotation: number;
}

const COLORS = {
    left: ["#3B82F6", "#60A5FA", "#93C5FD", "#FBBF24", "#FCD34D"],
    right: ["#EF4444", "#F87171", "#FCA5A5", "#FBBF24", "#FCD34D"],
};

function createConfetti(winner: Exclude<WinnerSide, null>): Confetti[] {
    const palette = COLORS[winner];

    return Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: palette[Math.floor(Math.random() * palette.length)],
        delay: Math.random() * 0.5,
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
    }));
}

function createFireworks() {
    return Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 40,
    }));
}

export const VictoryEffects = memo(function VictoryEffects({
    isActive,
    winner,
}: VictoryEffectsProps) {
    const [confetti, setConfetti] = useState<Confetti[]>([]);
    const [fireworks, setFireworks] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        if (!isActive || !winner) return;

        setConfetti(createConfetti(winner));
        setFireworks(createFireworks());

        return () => {
            setConfetti([]);
            setFireworks([]);
        };
    }, [isActive, winner]);

    const spotlight = useMemo(() => {
        if (!winner) return "transparent";
        return `radial-gradient(circle at ${winner === "left" ? "25%" : "75%"} 70%, 
      ${winner === "left" ? "hsl(220 85% 55% / 0.2)" : "hsl(0 75% 50% / 0.2)"} 0%, 
      transparent 50%)`;
    }, [winner]);

    if (!isActive || !winner) return null;

    return (
        <section
            aria-label="Victory celebration"
            className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
            itemScope
            itemType="https://schema.org/Event"
        >
            {/* Confetti */}
            <AnimatePresence>
                {confetti.map(c => (
                    <motion.span
                        key={c.id}
                        aria-hidden
                        className="absolute top-0"
                        style={{ left: `${c.x}%`, width: c.size, height: c.size, backgroundColor: c.color }}
                        initial={{ y: -20, rotate: 0, opacity: 1 }}
                        animate={{ y: window.innerHeight + 50, rotate: c.rotation + 720, opacity: [1, 1, 0] }}
                        transition={{ duration: 3 + Math.random() * 2, delay: c.delay, ease: "easeIn" }}
                    />
                ))}
            </AnimatePresence>

            {/* Fireworks */}
            <AnimatePresence>
                {fireworks.map(fw => (
                    <motion.div
                        key={fw.id}
                        aria-hidden
                        className="absolute"
                        style={{ left: `${fw.x}%`, top: `${fw.y}%` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 0] }}
                        transition={{ duration: 0.8 }}
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.span
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{ backgroundColor: COLORS[winner][0] }}
                                initial={{ x: 0, y: 0, opacity: 1 }}
                                animate={{
                                    x: Math.cos((i / 12) * Math.PI * 2) * 80,
                                    y: Math.sin((i / 12) * Math.PI * 2) * 80,
                                    opacity: 0,
                                    scale: 0,
                                }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        ))}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Spotlight */}
            <motion.div
                aria-hidden
                className="absolute inset-0"
                style={{ background: spotlight }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.5] }}
                transition={{ duration: 1.5 }}
            />

            {/* Trophy */}
            <motion.div
                aria-hidden
                className="absolute top-1/4 left-1/2 -translate-x-1/2 text-8xl"
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: [0, 1.5, 1], y: [50, -20, 0], rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1.5, delay: 0.5 }}
            >
                🏆
            </motion.div>
        </section>
    );
});
