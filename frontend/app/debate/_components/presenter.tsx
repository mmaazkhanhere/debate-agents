import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";

interface PresenterProps {
    name: string;
    isVisible: boolean;
}

export const Presenter = memo(function Presenter({ name, isVisible }: PresenterProps) {
    return (
        <AnimatePresence>
            {isVisible ? (
                <motion.figure
                    aria-label={`Host ${name}`}
                    role="figure"
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <motion.div
                        aria-hidden
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl md:text-4xl glow-gold"
                        animate={{
                            boxShadow: [
                                "0 0 30px hsl(43 96% 56% / 0.3)",
                                "0 0 50px hsl(43 96% 56% / 0.5)",
                                "0 0 30px hsl(43 96% 56% / 0.3)",
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        🎙️
                    </motion.div>

                    <figcaption className="text-center" itemScope itemType="https://schema.org/Person">
                        <h2 itemProp="name" className="font-display text-lg md:text-xl text-primary tracking-wide">
                            {name}
                        </h2>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest">
                            Host
                        </p>
                    </figcaption>
                </motion.figure>
            ) : null}
        </AnimatePresence>
    );
});

export default Presenter;