import { motion } from "framer-motion";

type PodiumSide = "left" | "right" | "center";

interface PodiumProps {
    side: PodiumSide;
    hasDebater?: boolean;
}

const PODIUM_CONFIG: Record<
    PodiumSide,
    { gradient: string; border: string; accent: string; icon: string }
> = {
    center: {
        gradient: "from-amber-800 via-amber-700 to-amber-900",
        border: "border-primary/50",
        accent: "bg-primary",
        icon: "🎙️",
    },
    left: {
        gradient: "from-blue-900 via-blue-800 to-blue-950",
        border: "border-debater-left/50",
        accent: "bg-debater-left",
        icon: "🔵",
    },
    right: {
        gradient: "from-red-900 via-red-800 to-red-950",
        border: "border-debater-right/50",
        accent: "bg-debater-right",
        icon: "🔴",
    },
};

const Podium = ({ side, hasDebater = true }: PodiumProps) => {
    const { gradient, border, accent, icon } = PODIUM_CONFIG[side];

    return (
        <motion.figure
            aria-label={`${side} debate podium`}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            {/* Top */}
            <div className={`w-20 md:w-28 h-3 bg-linear-to-r ${gradient} rounded-t-sm border-t-2 ${border}`} />

            {/* Body */}
            <div className={`relative w-20 md:w-28 h-16 md:h-20 bg-linear-to-b ${gradient} border-x-2 border-b-2 ${border}`}>
                <div className={`absolute left-1/2 -translate-x-1/2 top-2 w-12 md:w-16 h-1 ${accent} rounded-full opacity-60`} />

                <div
                    className={`absolute left-1/2 -translate-x-1/2 top-5 w-8 h-8 md:w-10 md:h-10 rounded-full ${accent}/20 border ${border} flex items-center justify-center`}
                    aria-hidden
                >
                    <span className="text-lg md:text-xl">{icon}</span>
                </div>
            </div>

            {/* Base */}
            <div className={`w-24 md:w-32 h-2 -ml-2 bg-linear-to-r ${gradient} rounded-b-sm opacity-80`} />

            {/* Microphone */}
            {hasDebater ? (
                <motion.div
                    aria-hidden
                    className="absolute -top-6 left-1/2 -translate-x-1/2"
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-stone-600 border border-stone-500" />
                        <div className="w-0.5 h-4 bg-stone-500" />
                    </div>
                </motion.div>
            ) : null}
        </motion.figure>
    );
}

export default Podium;
