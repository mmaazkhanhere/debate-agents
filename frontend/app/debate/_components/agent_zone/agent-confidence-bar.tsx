import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
    confidence: number;
    side: "left" | "right";
}

const AgentConfidenceBar = ({
    confidence,
    side
}: Props) => {
    return (
        <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
                <span className="uppercase tracking-wide text-muted-foreground">
                    Confidence
                </span>
                <span>{confidence}%</span>
            </div>

            <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                <motion.div
                    className={cn(
                        "h-full",
                        side === "left"
                            ? "bg-linear-to-r from-blue-500 to-blue-400"
                            : "bg-linear-to-r from-red-500 to-red-400"
                    )}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>
        </div>
    );
}

export default AgentConfidenceBar