import { memo, useMemo } from "react";
import { motion } from "framer-motion";

import type { Judge } from "@/types/debate";

type JudgeCardProps = {
    judge: Judge;
    debaterNames: {
        left: string;
        right: string;
    };
}

const JudgeCard = ({ judge, debaterNames }: JudgeCardProps) => {
    const isLeftVote = judge.vote === "left";

    const votedDebaterName = isLeftVote
        ? debaterNames.left
        : debaterNames.right;

    const voteHighlightClass = useMemo(
        () =>
            isLeftVote
                ? "bg-debater-left/20 text-debater-left-glow"
                : "bg-debater-right/20 text-debater-right-glow",
        [isLeftVote]
    );

    return (
        <motion.article
            className="judge-card w-64 md:w-72"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mb-3 flex items-center gap-3">
                <div
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-xl"
                >
                    ⚖️
                </div>

                <div>
                    <h3 itemProp="name" className="font-semibold text-foreground">
                        {judge.name}
                    </h3>

                    <p
                        itemProp="jobTitle"
                        className="text-xs text-muted-foreground"
                    >
                        {judge.title}
                    </p>
                </div>
            </div>

            <p
                itemProp="award"
                className={`mb-3 rounded-lg p-2 text-center font-display text-lg tracking-wide ${voteHighlightClass}`}
            >
                Voted for {votedDebaterName}
            </p>

            <p
                itemProp="description"
                className="mb-2 text-sm text-muted-foreground"
            >
                {judge.reasoning}
            </p>

            <blockquote
                itemProp="knowsAbout"
                className="border-l-2 border-primary/50 pl-2 text-xs italic text-foreground/70"
            >
                “{judge.quotedLine}”
            </blockquote>
        </motion.article>
    );
}

export default memo(JudgeCard);
