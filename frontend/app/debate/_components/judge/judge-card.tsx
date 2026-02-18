import { memo, useMemo } from "react";
import { motion } from "framer-motion";

import type { Judge } from "@/types/debate";

type JudgeCardProps = {
    judge: Judge;
    onOpen?: (judge: Judge) => void;
    debaterNames: {
        left: string;
        right: string;
    };
}

const JudgeCard = ({ judge, debaterNames, onOpen }: JudgeCardProps) => {
    const isLeftVote = judge.vote === "left";

    const votedDebaterName = isLeftVote
        ? debaterNames.left
        : debaterNames.right;

    const voteHighlightClass = useMemo(
        () =>
            isLeftVote
                ? "bg-debater-left/15 text-debater-left-glow"
                : "bg-debater-right/15 text-debater-right-glow",
        [isLeftVote]
    );

    const reasoning = (judge.reasoning ?? "").trim();
    const quotedLine = (judge.quotedLine ?? "").trim();
    const rubricEntries = useMemo(() => {
        if (!judge.rubricScore) return [];
        return Object.entries(judge.rubricScore).map(([key, scores]) => {
            const label = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
            return {
                key,
                label,
                left: scores[0],
                right: scores[1],
            };
        });
    }, [judge.rubricScore]);
    const shouldShowToggle = reasoning.length + quotedLine.length > 200;
    const initials = useMemo(() => {
        const parts = judge.name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "J";
        return parts
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("");
    }, [judge.name]);

    return (
        <motion.article
            className="judge-card w-full cursor-pointer rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm transition hover:border-primary/40 md:p-4"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => onOpen?.(judge)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen?.(judge);
                }
            }}
        >
            <div className="flex items-center gap-3">
                <div
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold md:h-11 md:w-11 md:text-base"
                >
                    {initials}
                </div>

                <div className="min-w-0">
                    <h3 itemProp="name" className="truncate font-semibold text-foreground">
                        {judge.name}
                    </h3>

                    <p
                        itemProp="jobTitle"
                        className="truncate text-xs text-muted-foreground"
                    >
                        {judge.title}
                    </p>
                </div>
            </div>

            <p
                itemProp="award"
                className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${voteHighlightClass}`}
            >
                Winner: {votedDebaterName}
            </p>

            <p
                itemProp="description"
                className="mt-3 text-sm text-muted-foreground line-clamp-3"
            >
                {reasoning}
            </p>

            {rubricEntries.length > 0 && (
                <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-2">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>Rubric</span>
                        <span className="text-debater-left-glow">{debaterNames.left}</span>
                        <span className="text-debater-right-glow">{debaterNames.right}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                        {rubricEntries.map((entry) => (
                            <div
                                key={entry.key}
                                className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-xs"
                            >
                                <span className="text-foreground/80">{entry.label}</span>
                                <span className="font-semibold text-debater-left-glow">{entry.left}</span>
                                <span className="font-semibold text-debater-right-glow">{entry.right}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {quotedLine && (
                <div className="mt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Winner weakness
                    </p>
                    <p
                        itemProp="knowsAbout"
                        className="text-xs italic text-foreground/70 line-clamp-2"
                    >
                        {quotedLine}
                    </p>
                </div>
            )}

            {shouldShowToggle && (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpen?.(judge);
                    }}
                    className="mt-3 text-xs font-semibold text-primary/80 transition hover:text-primary"
                >
                    Show more
                </button>
            )}
        </motion.article>
    );
}

export default memo(JudgeCard);
