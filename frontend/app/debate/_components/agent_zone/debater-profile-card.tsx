import { motion } from "framer-motion";

import DebaterAvatar from "./debater-avatar";
import DebaterScoreBadge from "./debater-score-badge";
import DebaterIdentity from "./debater-identity";
import AgentConfidenceBar from "./agent-confidence-bar";

import { cn } from "@/lib/utils";


type DebaterProfileCardProps = {
    name: string;
    title: string;
    avatar: string;
    side: 'left' | 'right';
    isCurrentTurn: boolean;
    cardsRemaining: number;
    debaterConfidence: number;
    debaterScore: number;
}

const DebaterProfileCard = ({
    name,
    title,
    avatar,
    side,
    isCurrentTurn,
    debaterConfidence,
    debaterScore
}: DebaterProfileCardProps) => {
    return (
        <motion.article
            className={cn(
                "relative w-auto max-w-[240px] p-4 rounded-xl border-2 md:max-w-none",
                "bg-linear-to-b from-slate-800/90 to-slate-900/90",
                isCurrentTurn
                    ? side === "left"
                        ? "border-blue-500 shadow-blue-500/20"
                        : "border-red-500 shadow-red-500/20"
                    : "border-slate-700/50"
            )}
            animate={isCurrentTurn ? { scale: [1, 1.02, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isCurrentTurn ? Infinity : 0 }}
        >
            <section className="flex items-center gap-3 mb-3">
                <DebaterAvatar src={avatar} side={side} />
                <DebaterScoreBadge totalScore={debaterScore} side={side} />
            </section>

            <DebaterIdentity name={name} title={title} side={side} />

            <AgentConfidenceBar confidence={debaterConfidence} side={side} />
        </motion.article>
    );
}

export default DebaterProfileCard
