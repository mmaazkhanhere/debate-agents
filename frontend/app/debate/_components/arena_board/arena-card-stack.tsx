import { AnimatePresence, motion } from "framer-motion";

import DebateCard from "../debater_card/debater-card";

import { cn } from "@/lib/utils";
import { ArenaPlayedCard } from "./arena-board";


type ArenaCardStackProps = {
    title: string;
    titleClassName: string;
    align: "items-start" | "items-end";
    direction: "left" | "right";
    cards: ArenaPlayedCard[];
    activeCardId: string | null;
    onCardSelect?: (card: ArenaPlayedCard) => void;
};

const ArenaCardStack = ({
    title,
    titleClassName,
    align,
    direction,
    cards,
    activeCardId,
    onCardSelect,
}: ArenaCardStackProps) => {

    const CARD_STACK_LIMIT = 3;
    const visibleCards = cards.slice(-CARD_STACK_LIMIT);
    const motionConfig = getStackMotion(direction);

    return (
        <div className={cn("flex-1 flex flex-col justify-center gap-4", align)}>
            <div className={cn("text-xs uppercase tracking-wider font-medium", titleClassName)}>
                {title}
            </div>

            <div className={cn("relative min-h-[220px] w-full flex flex-col gap-3", align)}>
                <AnimatePresence mode="popLayout">
                    {visibleCards.map((card, index) => {
                        const isTopCard = index === visibleCards.length - 1;

                        return (
                            <motion.div
                                key={card.id}
                                style={{
                                    zIndex: index,
                                    transform: `translateY(${index * -10}px)`,
                                }}
                                initial={motionConfig.initial}
                                animate={{
                                    x: 0,
                                    rotateZ: 0,
                                    opacity: isTopCard ? 1 : 0.6,
                                    scale: isTopCard ? 1 : 0.95,
                                }}
                                exit={motionConfig.exit}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <DebateCard
                                    {...card}
                                    isActive={card.id === activeCardId}
                                    onClick={onCardSelect ? () => onCardSelect(card) : undefined}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ArenaCardStack


const getStackMotion = (direction: "left" | "right") => {
    return {
        initial: {
            x: direction === "left" ? -100 : 100,
            rotateZ: direction === "left" ? -15 : 15,
            opacity: 0,
        },
        exit: {
            x: direction === "left" ? -50 : 50,
            opacity: 0,
            scale: 0.9,
        },
    };
}
