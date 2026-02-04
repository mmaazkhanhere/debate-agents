import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { countVotes } from "@/lib/utils";
import { Judge } from "@/types/debate";
import JudgeCard from "./judge-card";
import Score from "./judge-debate-score";
import Winner from "./judge-debate-winner";

interface JudgePanelProps {
    judges: Judge[];
    revealedCount: number;
    winner: "left" | "right" | null;
    debaterNames: { left: string; right: string };
}

const JudgePanel = ({
    judges,
    revealedCount,
    winner,
    debaterNames,
}: JudgePanelProps) => {
    const { left, right } = countVotes(judges);
    const allRevealed = revealedCount >= judges.length;

    return (
        <main
            role="main"
            aria-label="Debate verdict"
            className="absolute inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
        >
            <motion.h2
                className="font-display text-3xl md:text-4xl text-primary mb-8 tracking-wider"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                The Verdict
            </motion.h2>

            <section aria-label="Judges verdicts" className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 max-w-4xl">
                <AnimatePresence>
                    {judges.slice(0, revealedCount).map(j => (
                        <JudgeCard key={j.id} judge={j} debaterNames={debaterNames} />
                    ))}
                </AnimatePresence>
            </section>

            {allRevealed ? <Score left={left} right={right} debaterNames={debaterNames} /> : null}

            {winner ? <Winner winner={winner} debaterNames={debaterNames} /> : null}
        </main>
    );
}

export default JudgePanel;
