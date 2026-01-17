import { memo, useMemo } from 'react'
import { motion, Variants } from 'framer-motion'

export type CrowdReaction = 'positive' | 'negative' | 'neutral' | null
export type FavoringSide = 'left' | 'right' | null

interface GameCrowdProps {
    reaction: CrowdReaction
    favoringSide?: FavoringSide
}

// -----------------------------
// Constants & helpers (hoisted)
// -----------------------------

const SHIRT_COLORS = ['bg-blue-600', 'bg-red-500', 'bg-green-600', 'bg-purple-600', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500'] as const

const ROWS = [
    { count: 12, scale: 1 },
    { count: 14, scale: 0.9 },
    { count: 16, scale: 0.8 },
] as const

function getShirtColor(index: number) {
    return SHIRT_COLORS[index % SHIRT_COLORS.length]
}

const memberVariants: Variants = {
    idle: { y: 0, rotate: 0 },
    positive: { y: [0, -6, 0], rotate: [-3, 3, -3], transition: { duration: 0.4, repeat: 3 } },
    negative: { y: [0, 2, 0], rotate: 0, transition: { duration: 0.3, repeat: 3 } },
}

// -----------------------------
// Subcomponents
// -----------------------------

const CrowdMember = memo(function CrowdMember({ index, reaction, delay }: { index: number; reaction: CrowdReaction; delay: number }) {
    const shirt = getShirtColor(index)
    const variant = reaction === 'positive' ? 'positive' : reaction === 'negative' ? 'negative' : 'idle'

    return (
        <motion.div
            className="relative flex flex-col items-center"
            variants={memberVariants}
            animate={variant}
            transition={{ delay }}
        >
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-amber-200 border border-amber-300" />
            <div className={`w-4 h-3 md:w-5 md:h-4 -mt-0.5 rounded-t-sm ${shirt}`} />

            {reaction === 'positive' && (
                <>
                    <motion.div className={`absolute top-3 -left-1 w-1 h-2 ${shirt} rounded-full origin-bottom`} animate={{ rotate: [-30, -60, -30] }} transition={{ duration: 0.3, delay, repeat: 3 }} />
                    <motion.div className={`absolute top-3 -right-1 w-1 h-2 ${shirt} rounded-full origin-bottom`} animate={{ rotate: [30, 60, 30] }} transition={{ duration: 0.3, delay, repeat: 3 }} />
                </>
            )}

            {reaction && (
                <motion.div className="absolute -top-3 text-[8px]" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: delay + 0.1 }}>
                    {reaction === 'positive' ? '👏' : reaction === 'negative' ? '👎' : ''}
                </motion.div>
            )}
        </motion.div>
    )
})

// -----------------------------
// Main component
// -----------------------------

export const GameCrowd = memo(function GameCrowd({ reaction, favoringSide }: GameCrowdProps) {
    const layout = useMemo(() =>
        ROWS.map((row, rowIndex) => ({
            ...row,
            members: Array.from({ length: row.count }, (_, i) => ({ id: rowIndex * 100 + i, delay: Math.random() * 0.3 })),
        })),
        [])

    return (
        <div className="absolute bottom-44 md:bottom-52 left-1/2 -translate-x-1/2 w-full max-w-3xl">
            <div className="relative">
                <div className="flex flex-col-reverse gap-1 items-center">
                    {layout.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-1 md:gap-2" style={{ transform: `scale(${row.scale})`, opacity: 0.7 + rowIndex * 0.1 }}>
                            {row.members.map(m => (
                                <CrowdMember key={m.id} index={m.id} reaction={reaction} delay={m.delay} />
                            ))}
                        </div>
                    ))}
                </div>

                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full h-4 bg-linear-to-t from-stone-800 to-stone-700 rounded-t-lg opacity-60" />
            </div>

            {reaction && (
                <motion.div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20" initial={{ opacity: 0, y: 10, scale: 0 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
                    <div className={`px-4 py-1 rounded-full text-sm font-bold ${reaction === 'positive'
                        ? 'bg-crowd-positive/20 text-crowd-positive border border-crowd-positive/40'
                        : reaction === 'negative'
                            ? 'bg-crowd-negative/20 text-crowd-negative border border-crowd-negative/40'
                            : 'bg-muted text-muted-foreground border border-muted-foreground/40'}`}
                    >
                        {reaction === 'positive' ? '👏 CROWD CHEERS!' : reaction === 'negative' ? '👎 CROWD BOOS!' : '🤔 MIXED REACTION'}
                    </div>
                </motion.div>
            )}

            {favoringSide && (
                <motion.div className={`absolute -top-4 ${favoringSide === 'left' ? 'left-4' : 'right-4'}`} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className={`w-3 h-3 rounded-full ${favoringSide === 'left' ? 'bg-debater-left' : 'bg-debater-right'}`} />
                </motion.div>
            )}
        </div>
    )
})
