import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

type Props = {
    side: "left" | "right";
    cardsRemaining: number;
    isActive: boolean;
}

const AgentCardDeck = ({
    side,
    cardsRemaining,
    isActive
}: Props) => {
    const safeRemaining = Math.max(0, cardsRemaining);
    return (
        <motion.div
            aria-label={`${safeRemaining} cards remaining`}
            animate={isActive ? { y: [0, -3, 0] } : undefined}
            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
            className="relative"
        >
            {[...Array(Math.min(safeRemaining, 3))].map((_, i) => (
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
                    {safeRemaining} cards remaining
                </span>
            </div>
        </motion.div>
    );
}

export default AgentCardDeck
