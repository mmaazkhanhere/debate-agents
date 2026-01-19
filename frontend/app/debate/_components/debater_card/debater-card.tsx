import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flame, Shield, Zap, Brain, MessageSquare } from "lucide-react";
import { CardType, Side } from "@/types/type_d";
import DebaterCardHeader from "./debater-card-header";
import DebaterCardFooter from "./debater-card-footer";


type Props = {
    type: CardType;
    text: string;
    speaker: string;
    side: Side;
    confidence?: number;
    isActive?: boolean;
    isFlipped?: boolean;
    delay?: number;
    onClick?: () => void;
    onAnimationComplete?: () => void;
}

/* ---------------------------------- */
/* Config                              */
/* ---------------------------------- */

const CARD_TYPE_CONFIG: Record<
    CardType,
    { icon: typeof Flame; label: string; gradient: string }
> = {
    attack: {
        icon: Flame,
        label: "ATTACK",
        gradient: "from-red-500 to-orange-600",
    },
    defense: {
        icon: Shield,
        label: "DEFENSE",
        gradient: "from-blue-500 to-cyan-600",
    },
    counter: {
        icon: Zap,
        label: "COUNTER",
        gradient: "from-purple-500 to-pink-600",
    },
    evidence: {
        icon: Brain,
        label: "EVIDENCE",
        gradient: "from-green-500 to-emerald-600",
    },
    rhetoric: {
        icon: MessageSquare,
        label: "RHETORIC",
        gradient: "from-amber-500 to-yellow-600",
    },
};

/* ---------------------------------- */
/* Animation helpers                   */
/* ---------------------------------- */

function getInitialAnimation(side: Side) {
    return {
        x: side === "left" ? -300 : 300,
        y: -100,
        rotateY: 180,
        scale: 0.8,
        opacity: 0,
    };
}

function getAnimateState(isActive: boolean, isFlipped: boolean) {
    return {
        x: 0,
        y: 0,
        rotateY: isFlipped ? 180 : 0,
        scale: isActive ? 1.05 : 1,
        opacity: 1,
    };
}


/* ---------------------------------- */
/* Main Component                      */
/* ---------------------------------- */

const DebateCard = ({
    type,
    text,
    speaker,
    side,
    confidence = 75,
    isActive = false,
    isFlipped = false,
    delay = 0,
    onClick,
    onAnimationComplete,
}: Props) => {
    const config = CARD_TYPE_CONFIG[type];

    return (
        <motion.div
            className="relative perspective-1000 cursor-pointer"
            initial={getInitialAnimation(side)}
            animate={getAnimateState(isActive, isFlipped)}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay,
                duration: 0.8,
            }}
            onClick={onClick}
            onAnimationComplete={onAnimationComplete}
        >
            <div
                className={cn(
                    "relative w-72 min-h-[180px] rounded-xl overflow-hidden",
                    "transform-style-preserve-3d transition-all duration-300",
                    isActive &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl shadow-primary/20"
                )}
            >
                {/* Back */}
                <div
                    className={cn(
                        "absolute inset-0 backface-hidden rotate-y-180",
                        "bg-linear-to-br from-slate-800 to-slate-900",
                        "border-2 border-slate-600 rounded-xl",
                        "flex items-center justify-center"
                    )}
                >
                    <span className="text-4xl opacity-30">🎴</span>
                </div>

                {/* Front */}
                <div
                    className={cn(
                        "relative backface-hidden rounded-xl overflow-hidden",
                        "bg-linear-to-b from-slate-900 to-slate-950 border-2",
                        side === "left"
                            ? "border-blue-500/50"
                            : "border-red-500/50"
                    )}
                >
                    <DebaterCardHeader
                        icon={config.icon}
                        label={config.label}
                        gradient={config.gradient}
                        confidence={confidence}
                    />

                    <div className="p-4 min-h-[100px]">
                        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">
                            “{text}”
                        </p>
                    </div>

                    <DebaterCardFooter
                        speaker={speaker}
                        side={side}
                        confidence={confidence}
                    />

                    {isActive && (
                        <motion.div
                            className={cn(
                                "absolute inset-0 pointer-events-none",
                                side === "left"
                                    ? "bg-linear-to-t from-blue-500/10 to-transparent"
                                    : "bg-linear-to-t from-red-500/10 to-transparent"
                            )}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default DebateCard;