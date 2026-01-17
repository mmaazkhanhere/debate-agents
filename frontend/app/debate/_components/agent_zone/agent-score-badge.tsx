import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
    score: number;
    side: "left" | "right";
}

const AgentScoreBadge = ({ score, side }: Props) => {
    return (
        <motion.div
            aria-label={`Score ${score}`}
            className={cn(
                "ml-auto w-8 h-8 rounded-full flex items-center justify-center",
                "text-sm font-bold text-white",
                side === "left" ? "bg-blue-500" : "bg-red-500"
            )}
            key={score}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
        >
            {score}
        </motion.div>
    );
}

export default AgentScoreBadge
