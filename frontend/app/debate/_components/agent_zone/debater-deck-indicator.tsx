import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

type DebaterDeckIndicatorProps = {
    side: "left" | "right";
    cardsRemaining: number;
    isCurrentTurn: boolean;
}

const DebaterDeckIndicator = ({
    side,
    cardsRemaining,
    isCurrentTurn
}: DebaterDeckIndicatorProps) => {
    const numberOfCardsLeft = Math.max(0, cardsRemaining);
    return (
        <motion.div
            aria-label={`${numberOfCardsLeft} cards remaining`}
            animate={isCurrentTurn ? { y: [0, -3, 0] } : undefined}
            transition={{ duration: 1, repeat: isCurrentTurn ? Infinity : 0 }}
            className="relative"
        >
            {[...Array(Math.min(numberOfCardsLeft, 5))].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "absolute w-16 h-24 rounded-lg border bg-slate-800",
                        side === "left" ? "border-l-blue-500/30" : "border-r-red-500/30"
                    )}
                    style={{ top: -i * 2, left: i }}
                />
            ))}

            <div className="relative w-16 h-24 rounded-lg border-2 flex items-center justify-center">
                <span className="sr-only">
                    {numberOfCardsLeft} cards remaining
                </span>
            </div>
        </motion.div>
    );
}

export default DebaterDeckIndicator
