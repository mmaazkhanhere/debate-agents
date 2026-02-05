"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Shield, Zap, Brain, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardType, Side } from "@/types/type_d";

interface CardDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: {
        id: string;
        type: CardType;
        text: string;
        speaker: string;
        side: Side;
        confidence: number;
    } | null;
}

const CARD_TYPE_CONFIG: Record<
    CardType,
    { icon: any; label: string; gradient: string; color: string }
> = {
    attack: {
        icon: Flame,
        label: "ATTACK",
        gradient: "from-red-500 to-orange-600",
        color: "text-red-400",
    },
    defense: {
        icon: Shield,
        label: "DEFENSE",
        gradient: "from-blue-500 to-cyan-600",
        color: "text-blue-400",
    },
    counter: {
        icon: Zap,
        label: "COUNTER",
        gradient: "from-purple-500 to-pink-600",
        color: "text-purple-400",
    },
    evidence: {
        icon: Brain,
        label: "EVIDENCE",
        gradient: "from-green-500 to-emerald-600",
        color: "text-green-400",
    },
    rhetoric: {
        icon: MessageSquare,
        label: "RHETORIC",
        gradient: "from-amber-500 to-yellow-600",
        color: "text-amber-400",
    },
    framing: {
        icon: Brain,
        label: "FRAMING",
        gradient: "from-indigo-500 to-blue-600",
        color: "text-indigo-400",
    },
    clarification: {
        icon: MessageSquare,
        label: "CLARIFY",
        gradient: "from-slate-500 to-slate-600",
        color: "text-slate-400",
    },
};

const CardDetailModal = ({ isOpen, onClose, card }: CardDetailModalProps) => {
    if (!card) return null;

    const config = CARD_TYPE_CONFIG[card.type];
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className={cn(
                            "relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-slate-900 shadow-2xl",
                            card.side === "left" ? "border-blue-500/30" : "border-red-500/30"
                        )}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Header Decoration */}
                        <div className={cn("h-2 w-full bg-linear-to-r", config.gradient)} />

                        <div className="p-8">
                            <header className="mb-8 flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn("rounded-xl p-3 bg-slate-800 border border-slate-700", config.color)}>
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className={cn("text-xs font-bold uppercase tracking-widest", config.color)}>
                                            {config.label}
                                        </p>
                                        <h2 className="text-2xl font-display font-bold text-white tracking-wide">
                                            {card.speaker}
                                        </h2>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </header>

                            <main className="space-y-6">
                                <div className="relative p-6 rounded-xl bg-slate-950/50 border border-slate-800">
                                    <span className="absolute -top-4 left-4 text-6xl text-slate-800 font-serif pointer-events-none">“</span>
                                    <p className="text-xl md:text-2xl leading-relaxed text-slate-200 italic font-medium">
                                        {card.text}
                                    </p>
                                    <span className="absolute -bottom-12 right-4 text-6xl text-slate-800 font-serif pointer-events-none">”</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Confidence Score</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-32 rounded-full bg-slate-800 overflow-hidden">
                                                <motion.div
                                                    className={cn("h-full bg-linear-to-r", config.gradient)}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${card.confidence}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                />
                                            </div>
                                            <span className="text-sm font-mono font-bold text-slate-300">{card.confidence}%</span>
                                        </div>
                                    </div>


                                </div>
                            </main>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CardDetailModal;
