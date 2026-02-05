import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type DebaterScoreBadgeProps = {
    totalScore
    : number;
    side: "left" | "right";
}

const DebaterScoreBadge = ({ totalScore
    , side }: DebaterScoreBadgeProps) => {
    return (
        <motion.div
            aria-label={`Score ${totalScore}`}
            className={cn(
                "ml-auto w-8 h-8 rounded-full flex items-center justify-center",
                "text-sm font-bold text-white",
                side === "left" ? "bg-blue-500" : "bg-red-500"
            )}
            key={totalScore}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
        >
            {totalScore}
        </motion.div>
    );
}

export default DebaterScoreBadge
