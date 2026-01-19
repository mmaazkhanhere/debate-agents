import { motion } from "framer-motion";
import { memo } from "react";

type Props = {
    left: number;
    right: number;
    debaterNames: { left: string; right: string };
}

const Score = memo(function Score({
    left,
    right,
    debaterNames,
}: Props) {
    return (
        <section
            aria-label="Debate score"
            className="flex items-center gap-8 mb-6"
            itemScope
            itemType="https://schema.org/SportsEvent"
        >
            <div className="text-center">
                <strong itemProp="homeTeam" className="font-display text-4xl text-debater-left-glow">
                    {debaterNames.left}: {left}
                </strong>
            </div>

            <span aria-hidden className="text-2xl text-muted-foreground">
                vs
            </span>

            <div className="text-center">
                <strong itemProp="awayTeam" className="font-display text-4xl text-debater-right-glow">
                    {debaterNames.right}: {right}
                </strong>
            </div>
        </section>
    );
});

export default Score;