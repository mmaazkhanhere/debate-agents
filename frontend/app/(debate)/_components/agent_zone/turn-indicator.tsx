import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type TurnIndicator = {
    isActive: boolean;
    side: "left" | "right";
}

const TurnIndicator = ({
    isActive,
    side
}: TurnIndicator) => {
    if (!isActive) return null;

    return (
        <motion.div
            aria-live="polite"
            role="status"
            className={cn(
                "absolute -top-8 flex items-center gap-2 px-3 py-1 rounded-full",
                "bg-linear-to-r border",
                side === "left"
                    ? "from-blue-500/20 to-blue-600/20 border-blue-500/30 left-0"
                    : "from-red-500/20 to-red-600/20 border-red-500/30 right-0"
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Sparkles
                className={cn(
                    "w-3 h-3",
                    side === "left" ? "text-blue-400" : "text-red-400"
                )}
                aria-hidden
            />
            <span className="text-xs font-medium">
                Your turn
            </span>
        </motion.div>
    );
}

export default TurnIndicator