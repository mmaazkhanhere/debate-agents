import { AnimatePresence, motion } from "framer-motion";

const BoardImpactEffect = ({ isActive }: { isActive: boolean }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-primary/5" />
                    <motion.div
                        className="absolute inset-0"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-full h-full rounded-full bg-gradient-radial from-primary/20 to-transparent" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default BoardImpactEffect;