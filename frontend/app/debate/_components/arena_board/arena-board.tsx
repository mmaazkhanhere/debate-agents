import { motion } from "framer-motion";



import { CardType } from "@/types/type_d";
import ArenaBackground from "./arena-background";
import ArenaCardStack from "./arena-card-stack";
import ArenaVsDivider from "./arena-vs-divider";
import ArenaShakeOverlay from "./arena-shake-overlay";

export type ArenaPlayedCard = {
    id: string;
    type: CardType;
    text: string;
    speaker: string;
    side: "left" | "right";
    confidence: number;
}

type ArenaBoardProps = {
    leftCards: ArenaPlayedCard[];
    rightCards: ArenaPlayedCard[];
    activeCardId: string | null;
    onCardSelect?: (card: ArenaPlayedCard) => void;
    isShaking?: boolean;
};

export const ArenaBoard = ({
    leftCards,
    rightCards,
    activeCardId,
    onCardSelect,
    isShaking = false,
}: ArenaBoardProps) => {
    return (
        <motion.div
            className="relative flex w-full flex-1 items-center justify-center px-4 md:px-8"
            animate={isShaking ? { x: [0, -5, 5, -3, 3, 0] } : undefined}
            transition={{ duration: 0.4 }}
        >
            <ArenaBackground />

            <div className="relative w-full max-w-5xl flex flex-col gap-6 md:flex-row md:gap-8">
                <ArenaCardStack
                    title="Challenger"
                    titleClassName="text-blue-400/80"
                    align="items-center md:items-end"
                    direction="left"
                    cards={leftCards}
                    activeCardId={activeCardId}
                    onCardSelect={onCardSelect}
                />

                <ArenaVsDivider />

                <ArenaCardStack
                    title="Defender"
                    titleClassName="text-red-400/80"
                    align="items-center md:items-start"
                    direction="right"
                    cards={rightCards}
                    activeCardId={activeCardId}
                    onCardSelect={onCardSelect}
                />
            </div>

            <ArenaShakeOverlay isActive={isShaking} />
        </motion.div>
    );
}
