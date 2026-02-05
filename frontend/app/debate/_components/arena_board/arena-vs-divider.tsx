import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ArenaVsDivider = () => {
    return (
        <section className="relative flex flex-col items-center justify-center">
            <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl" />

                <div
                    className={cn(
                        "w-16 h-16 rounded-full",
                        "bg-linear-to-br from-slate-800 to-slate-900",
                        "border-2 border-primary/50",
                        "flex items-center justify-center"
                    )}
                >
                    <span className="text-xl font-display font-bold text-primary">
                        VS
                    </span>
                </div>
            </motion.div>

            <div className="absolute top-0 bottom-0 w-px bg-linear-to-b from-transparent via-primary/30 to-transparent" />
        </section>
    );
}

export default ArenaVsDivider
