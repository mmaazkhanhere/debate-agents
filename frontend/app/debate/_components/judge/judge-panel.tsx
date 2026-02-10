import dynamic from "next/dynamic";
import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { countVotes } from "@/lib/utils";
import type { Judge } from "@/types/debate";

import JudgeCard from "./judge-card";
import DebateScore from "./debate-score";
import DebateWinner from "./debate-winner";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

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
    const currentJudgeIndex = useMemo(() => {
        if (judges.length === 0) return 0;
        return Math.min(revealedJudgeCount, judges.length - 1);
    }, [judges.length, revealedJudgeCount]);
    const currentJudge = judges[currentJudgeIndex] ?? null;
    const showWinnerAnnouncement = Boolean(winner) && areAllJudgesRevealed;
    const [activeJudge, setActiveJudge] = useState<Judge | null>(null);

    return (
        <section
            aria-label="Debate verdict"
            className="absolute inset-0 z-50 overflow-y-auto bg-background/95 p-4 backdrop-blur-md md:p-6"
        >
            {showWinnerAnnouncement && (
                <Confetti
                    recycle={false}
                    numberOfPieces={300}
                    gravity={0.18}
                    className="pointer-events-none"
                />
            )}

            <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col items-center justify-center">
                <motion.h2
                    className="font-display mb-6 text-center text-2xl tracking-wider text-primary md:mb-8 md:text-4xl"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    The Verdict
                </motion.h2>

                {!areAllJudgesRevealed && currentJudge && (
                    <section
                        aria-label="Current judge verdict"
                        className="mb-6 w-full max-w-xl md:mb-8"
                    >
                        <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground md:text-sm">
                            Judge {currentJudgeIndex + 1} of {judges.length}
                        </p>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentJudge.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            >
                                <JudgeCard
                                    judge={currentJudge}
                                    debaterNames={debaterNames}
                                    onOpen={setActiveJudge}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </section>
                )}

                {areAllJudgesRevealed && (
                    <motion.section
                        aria-label="Judges verdicts"
                        className="mb-6 grid w-full max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 md:mb-8 md:gap-4 lg:grid-cols-3"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        {judges.map((judge) => (
                            <JudgeCard
                                key={judge.id}
                                judge={judge}
                                debaterNames={debaterNames}
                                onOpen={setActiveJudge}
                            />
                        ))}
                    </motion.section>
                )}

                {areAllJudgesRevealed && (
                    <DebateScore
                        leftScore={leftVotes}
                        rightScore={rightVotes}
                        debaterNames={debaterNames}
                    />
                )}

                {showWinnerAnnouncement && (
                    <DebateWinner
                        winnerSide={winner ?? "left"}
                        debaterNames={debaterNames}
                    />
                )}
            </div>

            <AnimatePresence>
                {activeJudge && (
                    <motion.div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveJudge(null)}
                    >
                        <motion.div
                            className="w-full max-w-lg rounded-2xl border border-border/70 bg-card p-5 shadow-xl md:p-6"
                            initial={{ y: 20, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 10, opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            onClick={(event) => event.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Judge verdict details"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    aria-hidden
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-base font-semibold"
                                >
                                    {activeJudge.name
                                        .trim()
                                        .split(/\s+/)
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((part) => part[0]?.toUpperCase() ?? "")
                                        .join("") || "J"}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-semibold text-foreground">
                                        {activeJudge.name}
                                    </h3>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {activeJudge.title}
                                    </p>
                                </div>
                            </div>

                            <p
                                className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
                                    activeJudge.vote === "left"
                                        ? "bg-debater-left/15 text-debater-left-glow"
                                        : "bg-debater-right/15 text-debater-right-glow"
                                }`}
                            >
                                Winner: {activeJudge.vote === "left" ? debaterNames.left : debaterNames.right}
                            </p>

                            <p className="mt-4 text-sm text-muted-foreground">
                                {activeJudge.reasoning}
                            </p>

                            <blockquote className="mt-3 border-l-2 border-primary/50 pl-3 text-xs italic text-foreground/70">
                                <span aria-hidden>&ldquo;</span>
                                {activeJudge.quotedLine}
                                <span aria-hidden>&rdquo;</span>
                            </blockquote>

                            <button
                                type="button"
                                onClick={() => setActiveJudge(null)}
                                className="mt-5 w-full rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

export default memo(JudgePanel);
