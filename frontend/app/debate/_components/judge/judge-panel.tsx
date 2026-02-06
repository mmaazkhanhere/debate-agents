import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { countVotes } from "@/lib/utils";
import type { Judge } from "@/types/debate";

import JudgeCard from "./judge-card";
import DebateScore from "./debate-score";
import DebateWinner from "./debate-winner";

type JudgePanelProps = {
    judges: Judge[];
    revealedJudgeCount: number;
    winner: string | null;
    debaterNames: {
        left: string;
        right: string;
    };
}

const JudgePanel = ({
    judges,
    revealedJudgeCount,
    winner,
    debaterNames,
}: JudgePanelProps) => {
    const voteTotals = useMemo(() => countVotes(judges), [judges]);
    const { left: leftVotes, right: rightVotes } = voteTotals;

    const areAllJudgesRevealed = revealedJudgeCount >= judges.length;

    const revealedJudges = useMemo(
        () => judges.slice(0, revealedJudgeCount),
        [judges, revealedJudgeCount]
    );

    return (
        <section
            aria-label="Debate verdict"
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-6 backdrop-blur-md"
        >
            <motion.h2
                className="font-display mb-8 text-3xl tracking-wider text-primary md:text-4xl"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                The Verdict
            </motion.h2>

            <section
                aria-label="Judges verdicts"
                className="mb-8 flex max-w-4xl flex-wrap justify-center gap-4 md:gap-6"
            >
                <AnimatePresence>
                    {revealedJudges.map((judge) => (
                        <JudgeCard
                            key={judge.id}
                            judge={judge}
                            debaterNames={debaterNames}
                        />
                    ))}
                </AnimatePresence>
            </section>

            {areAllJudgesRevealed && (
                <DebateScore
                    leftScore={leftVotes}
                    rightScore={rightVotes}
                    debaterNames={debaterNames}
                />
            )}

            {winner && (
                <DebateWinner
                    winnerSide={winner}
                    debaterNames={debaterNames}
                />
            )}
        </section>
    );
}

export default memo(JudgePanel);
