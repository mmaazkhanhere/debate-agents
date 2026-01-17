import { motion } from "framer-motion";
import { memo } from "react";

type Props = {
    winner: "left" | "right";
    debaterNames: { left: string; right: string };
}

const Winner = memo(function Winner({
    winner,
    debaterNames,
}: Props) {
    const name = winner === "left" ? debaterNames.left : debaterNames.right;

    return (
        <section
            aria-label="Debate winner"
            itemScope
            itemType="https://schema.org/Award"
            className="text-center animate-winner"
        >
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">
                Winner
            </p>
            <h1 itemProp="name" className="winner-text text-5xl md:text-6xl lg:text-7xl">
                {name}
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
});

export default Winner;