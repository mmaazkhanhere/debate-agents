import { cn } from "@/lib/utils";
import { CardType } from "@/types/type_d";
import { AnimatePresence, motion } from "framer-motion";
import DebateCard from "../debater_card/debater-card";

interface PlayedCard {
    id: string;
    type: CardType;
    text: string;
    speaker: string;
    side: 'left' | 'right';
    confidence: number;
}

type Props = {
    side: "left" | "right";
    label: string;
    cards: PlayedCard[];
    activeCardId: string | null;
}

const ArenaCardStack = ({
    side,
    label,
    cards,
    activeCardId
}: Props) => {
    const isLeft = side === "left";

    return (
        <section
            aria-label={`${label} cards`}
            className={cn(
                "flex-1 flex flex-col justify-center gap-4",
                isLeft ? "items-end" : "items-start"
            )}
        >
            <header
                className={cn(
                    "text-xs uppercase tracking-wider font-medium",
                    isLeft ? "text-blue-400/80" : "text-red-400/80"
                )}
            >
                {label}
            </header>

            <div className="relative min-h-[220px] w-full flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                    {cards.map((card, index) => {
                        const isTop = index === cards.length - 1;

                        return (
                            <motion.div
                                key={card.id}
                                className="relative"
                                style={{
                                    zIndex: index,
                                    transform: `translateY(${index * -10}px)`
                                }}
                                initial={{
                                    x: isLeft ? -100 : 100,
                                    opacity: 0,
                                    rotateZ: isLeft ? -15 : 15
                                }}
                                animate={{
                                    x: 0,
                                    opacity: isTop ? 1 : 0.6,
                                    rotateZ: 0,
                                    scale: isTop ? 1 : 0.95
                                }}
                                exit={{
                                    x: isLeft ? -50 : 50,
                                    opacity: 0,
                                    scale: 0.9
                                }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <DebateCard
                                    {...card}
                                    isActive={card.id === activeCardId}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </section>
    );
}

export default ArenaCardStack
