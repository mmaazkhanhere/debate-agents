import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CardType } from "@/types/type_d";
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
    leftCards: PlayedCard[];
    rightCards: PlayedCard[];
    activeCardId: string | null;
    onCardClick?: (card: PlayedCard) => void;
    onBoardShake?: boolean;
}

const ArenaBoard = ({
    leftCards,
    rightCards,
    activeCardId,
    onCardClick,
    onBoardShake = false
}: Props) => {
    return (
        <motion.div
            className="relative w-full flex-1 flex items-center justify-center px-8"
            animate={onBoardShake ? {
                x: [0, -5, 5, -3, 3, 0],
                transition: { duration: 0.4 }
            } : {}}
        >
            {/* Arena Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Center glow */}
                <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

                {/* Arena floor pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `
              radial-gradient(circle at 50% 100%, hsl(var(--primary) / 0.2) 0%, transparent 50%),
              linear-gradient(to right, transparent 49%, hsl(var(--primary) / 0.1) 50%, transparent 51%)
            `,
                    }}
                />

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            {/* Arena Container */}
            <div className="relative max-w-5xl w-full flex items-stretch gap-8">
                {/* Left Card Stack */}
                <div className="flex-1 flex flex-col items-end justify-center gap-4">
                    <div className="text-xs text-blue-400/80 uppercase tracking-wider mb-2 font-medium">
                        Challenger
                    </div>
                    <div className="relative min-h-[220px] w-full flex flex-col items-end gap-3">
                        <AnimatePresence mode="popLayout">
                            {leftCards.slice(-3).map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    className="relative"
                                    style={{
                                        zIndex: index,
                                        transform: `translateY(${index * -10}px)`
                                    }}
                                    initial={{ x: -100, opacity: 0, rotateZ: -15 }}
                                    animate={{
                                        x: 0,
                                        opacity: index === leftCards.slice(-3).length - 1 ? 1 : 0.6,
                                        rotateZ: 0,
                                        scale: index === leftCards.slice(-3).length - 1 ? 1 : 0.95
                                    }}
                                    exit={{ x: -50, opacity: 0, scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                >
                                    <DebateCard
                                        type={card.type}
                                        text={card.text}
                                        speaker={card.speaker}
                                        side={card.side}
                                        confidence={card.confidence}
                                        isActive={card.id === activeCardId}
                                        onClick={() => onCardClick?.(card)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Center Divider - VS */}
                <div className="relative flex flex-col items-center justify-center">
                    <motion.div
                        className="relative"
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        {/* Outer glow */}
                        <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl" />

                        {/* VS Badge */}
                        <div className={cn(
                            "relative w-16 h-16 rounded-full",
                            "bg-linear-to-br from-slate-800 to-slate-900",
                            "border-2 border-primary/50",
                            "flex items-center justify-center",
                            "shadow-lg shadow-primary/20"
                        )}>
                            <span className="text-xl font-display font-bold text-primary tracking-wider">
                                VS
                            </span>
                        </div>
                    </motion.div>

                    {/* Vertical divider line */}
                    <div className="absolute top-0 bottom-0 w-px bg-linear-to-b from-transparent via-primary/30 to-transparent" />
                </div>

                {/* Right Card Stack */}
                <div className="flex-1 flex flex-col items-start justify-center gap-4">
                    <div className="text-xs text-red-400/80 uppercase tracking-wider mb-2 font-medium">
                        Defender
                    </div>
                    <div className="relative min-h-[220px] w-full flex flex-col items-start gap-3">
                        <AnimatePresence mode="popLayout">
                            {rightCards.slice(-3).map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    className="relative"
                                    style={{
                                        zIndex: index,
                                        transform: `translateY(${index * -10}px)`
                                    }}
                                    initial={{ x: 100, opacity: 0, rotateZ: 15 }}
                                    animate={{
                                        x: 0,
                                        opacity: index === rightCards.slice(-3).length - 1 ? 1 : 0.6,
                                        rotateZ: 0,
                                        scale: index === rightCards.slice(-3).length - 1 ? 1 : 0.95
                                    }}
                                    exit={{ x: 50, opacity: 0, scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                >
                                    <DebateCard
                                        type={card.type}
                                        text={card.text}
                                        speaker={card.speaker}
                                        side={card.side}
                                        confidence={card.confidence}
                                        isActive={card.id === activeCardId}
                                        onClick={() => onCardClick?.(card)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Card Play Effect */}
            <AnimatePresence>
                {onBoardShake && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-primary/5" />
                        <motion.div
                            className="absolute inset-0"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="w-full h-full rounded-full bg-gradient-radial from-primary/20 to-transparent" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ArenaBoard