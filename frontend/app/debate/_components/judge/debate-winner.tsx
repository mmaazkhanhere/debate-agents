import { memo } from "react";
import { motion } from "framer-motion";

type DebateWinnerProps = {
    winnerSide: string;
    debaterNames: {
        left: string;
        right: string;
    };
}

const DebateWinner = ({ winnerSide, debaterNames }: DebateWinnerProps) => {
    const winnerName =
        winnerSide === "left" ? debaterNames.left : debaterNames.right;

    return (
        <section
            aria-label="Debate winner"
            itemScope
            itemType="https://schema.org/Award"
            className="animate-winner text-center"
        >
            <p className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">
                Winner
            </p>

            <h1
                itemProp="name"
                className="winner-text text-5xl md:text-6xl lg:text-7xl"
            >
                {winnerName}
            </h1>

            <motion.div
                aria-hidden
                className="mt-4 text-4xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
            >
                🏆
            </motion.div>
        </section>
    );
}

export default memo(DebateWinner);
