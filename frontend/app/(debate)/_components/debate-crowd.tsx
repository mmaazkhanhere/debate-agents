import { pseudoRandom, resolveReactionClass } from "@/lib/utils";
import { Reaction } from "@/types/type_d";
import { motion, Variants } from "framer-motion";
import { useMemo } from "react";

type Side = "left" | "right" | null;

interface CrowdProps {
    reaction: Reaction;
    favoringSide?: Side;
}

/* ---------------------------------- */
/* Constants */
/* ---------------------------------- */

const CROWD_SIZE = 40;
const CROWD_COLUMNS = 20;

const BASE_OPACITY = 0.6;
const ANIMATION_DURATION = 0.8;

/* ---------------------------------- */
/* Utilities */
/* ---------------------------------- */

// Simple deterministic pseudo-random generator

/* ---------------------------------- */
/* Animation Variants */
/* ---------------------------------- */

const crowdVariants: Variants = {
    idle: ({ baseScale }: { baseScale: number }) => ({
        scale: baseScale,
        opacity: BASE_OPACITY,
        y: 0,
    }),
    react: ({ baseScale }: { baseScale: number }) => ({
        y: [0, -4, 0],
        scale: [baseScale, baseScale * 1.2, baseScale],
        opacity: [BASE_OPACITY, 1, BASE_OPACITY],
    }),
};

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export function Crowd({ reaction, favoringSide }: CrowdProps) {
    const crowdMembers = useMemo(() => {
        return Array.from({ length: CROWD_SIZE }, (_, id) => {
            const col = id % CROWD_COLUMNS;
            const row = Math.floor(id / CROWD_COLUMNS);

            const rand = pseudoRandom(id + 1);

            return {
                id,
                x: col * 5 + rand * 2,
                y: row * 3 + pseudoRandom(id + 7) * 2,
                delay: pseudoRandom(id + 13) * 0.5,
                baseScale: 0.8 + pseudoRandom(id + 21) * 0.4,
            };
        });
    }, []);

    return (
        <div className="relative h-16 w-full overflow-hidden">
            {/* Depth gradient */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent" />

            {/* Crowd */}
            <div className="relative flex h-full items-end justify-center px-4">
                <div className="relative h-12 w-full max-w-4xl">
                    {crowdMembers.map((member) => (
                        <motion.div
                            key={member.id}
                            className={`crowd-dot absolute ${resolveReactionClass(
                                reaction,
                                member.id
                            )}`}
                            style={{
                                left: `${member.x}%`,
                                bottom: `${member.y * 3}px`,
                            }}
                            custom={{ baseScale: member.baseScale }}
                            variants={crowdVariants}
                            initial="idle"
                            animate={reaction ? "react" : "idle"}
                            transition={{
                                duration: ANIMATION_DURATION,
                                delay: member.delay,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Reaction emoji */}
            {reaction && (
                <motion.div
                    className="absolute left-1/2 top-0 z-20 -translate-x-1/2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    <span className="text-2xl">
                        {reaction === "positive"
                            ? "👏"
                            : reaction === "negative"
                                ? "👎"
                                : "🤔"}
                    </span>
                </motion.div>
            )}

            {/* Side favor indicator */}
            {favoringSide && (
                <motion.div
                    className={`absolute top-2 z-20 ${favoringSide === "left" ? "left-8" : "right-8"
                        }`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div
                        className={`h-3 w-3 rounded-full ${favoringSide === "left"
                            ? "bg-debater-left"
                            : "bg-debater-right"
                            }`}
                        style={{
                            boxShadow:
                                favoringSide === "left"
                                    ? "0 0 15px hsl(220 85% 55% / 0.8)"
                                    : "0 0 15px hsl(0 75% 50% / 0.8)",
                        }}
                    />
                </motion.div>
            )}
        </div>
    );
}
