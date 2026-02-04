import { Judge } from "@/types/debate";
import { motion } from "framer-motion";
import { memo } from "react";

type Props = {
    judge: Judge;
    debaterNames: { left: string; right: string };
}

const JudgeCard = memo(function JudgeCard({
    judge,
    debaterNames,
}: Props) {
    const isLeft = judge.vote === "left";

    return (
        <motion.article
            itemScope
            itemType="https://schema.org/Person"
            className="judge-card w-64 md:w-72"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <header className="flex items-center gap-3 mb-3">
                <div
                    aria-hidden
                    className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl"
                >
                    ⚖️
                </div>
                <div>
                    <h3 itemProp="name" className="font-semibold text-foreground">
                        {judge.name}
                    </h3>
                    <p itemProp="jobTitle" className="text-xs text-muted-foreground">
                        {judge.title}
                    </p>
                </div>
            </header>

            <p
                itemProp="award"
                className={`mb-3 p-2 rounded-lg text-center font-display text-lg tracking-wide ${isLeft
                    ? "bg-debater-left/20 text-debater-left-glow"
                    : "bg-debater-right/20 text-debater-right-glow"
                    }`}
            >
                Voted for {isLeft ? debaterNames.left : debaterNames.right}
            </p>

            <p itemProp="description" className="text-sm text-muted-foreground mb-2">
                {judge.reasoning}
            </p>

            <blockquote
                itemProp="knowsAbout"
                className="text-xs italic text-foreground/70 border-l-2 border-primary/50 pl-2"
            >
                “{judge.quotedLine}”
            </blockquote>
        </motion.article>
    );
});

export default JudgeCard;
