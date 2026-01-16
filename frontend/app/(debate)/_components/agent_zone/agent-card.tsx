import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import AgentAvatar from "./agent-avatar";
import AgentScoreBadge from "./agent-score-badge";
import AgentIdentity from "./agent-identity";
import AgentConfidenceBar from "./agent-confidence-bar";

interface AgentZoneProps { name: string; title: string; avatar: string; side: 'left' | 'right'; isActive: boolean; cardsRemaining: number; confidence: number; score: number; }

const AgentCard = ({
    name,
    title,
    avatar,
    side,
    isActive,
    confidence,
    score
}: AgentZoneProps) => {
    return (
        <motion.article
            className={cn(
                "relative p-4 rounded-xl border-2",
                "bg-linear-to-b from-slate-800/90 to-slate-900/90",
                isActive
                    ? side === "left"
                        ? "border-blue-500 shadow-blue-500/20"
                        : "border-red-500 shadow-red-500/20"
                    : "border-slate-700/50"
            )}
            animate={isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
        >
            <header className="flex items-center gap-3 mb-3">
                <AgentAvatar avatar={avatar} side={side} />
                <AgentScoreBadge score={score} side={side} />
            </header>

            <AgentIdentity name={name} title={title} side={side} />

            <AgentConfidenceBar confidence={confidence} side={side} />
        </motion.article>
    );
}

export default AgentCard