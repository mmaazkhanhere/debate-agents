import { memo, type ReactNode } from 'react'
import { motion, Variants } from 'framer-motion'

interface GameStageProps {
    children: ReactNode
}

// -----------------------------
// Constants & variants (hoisted)
// -----------------------------

const spotlightVariants: Variants = {
    animate: (delay: number) => ({
        opacity: [0.3, 0.5, 0.3],
        transition: { duration: 4, delay, repeat: Infinity },
    }),
}

const centerSpotlightVariants: Variants = {
    animate: {
        opacity: [0.2, 0.4, 0.2],
        transition: { duration: 5, repeat: Infinity },
    },
}

// -----------------------------
// Subcomponents
// -----------------------------

const Spotlight = memo(function Spotlight({ side, color, delay }: { side: 'left' | 'right'; color: string; delay: number }) {
    return (
        <motion.div
            className={`absolute top-0 ${side === 'left' ? 'left-[15%]' : 'right-[15%]'} w-72 h-full`}
            variants={spotlightVariants}
            custom={delay}
            animate="animate"
        >
            <div className={`w-full h-full bg-linear-to-b ${color} blur-2xl`} />
        </motion.div>
    )
})

// -----------------------------
// Main component
// -----------------------------

export const GameStage = memo(function GameStage({ children }: GameStageProps) {
    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950" />

            {/* Grid */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Side accents */}
            <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-transparent via-primary/40 to-transparent" />
            <div className="absolute top-0 right-0 w-1 h-full bg-linear-to-b from-transparent via-primary/40 to-transparent" />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-16">
                <div className="absolute inset-0 bg-linear-to-b from-slate-900 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
            </div>

            {/* Spotlights */}
            <Spotlight side="left" color="from-blue-500/10 via-blue-500/5 to-transparent" delay={0} />
            <Spotlight side="right" color="from-red-500/10 via-red-500/5 to-transparent" delay={2} />

            <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-full" variants={centerSpotlightVariants} animate="animate">
                <div className="w-full h-full bg-linear-to-b from-primary/10 via-primary/5 to-transparent blur-3xl" />
            </motion.div>

            {/* Floor */}
            <div className="absolute bottom-0 left-0 right-0 h-36">
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/80 to-transparent" />
                <div className="absolute top-8 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-linear-to-t from-primary/5 to-transparent" />
            </div>

            {/* Title */}
            <motion.div className="absolute top-4 left-1/2 -translate-x-1/2 z-20" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-primary/20" />
                    <div className="relative px-8 py-2 border-y border-primary/30">
                        <h1 className="font-display text-3xl md:text-4xl text-primary tracking-[0.2em] text-center">THE CLASH ARENA</h1>
                    </div>
                </div>
            </motion.div>

            {/* Corners */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />

            {/* Content */}
            <div className="relative z-10 h-full">{children}</div>
        </div>
    )
})
