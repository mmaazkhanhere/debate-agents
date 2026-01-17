import { motion } from "framer-motion";

export type CharacterType = 'presenter' | 'debater-left' | 'debater-right';
export type CharacterState = 'idle' | 'speaking' | 'thinking' | 'celebrating' | 'defeated';

interface GameCharacterProps {
    type: CharacterType;
    state: CharacterState;
    name: string;
    title?: string;
    showNameplate?: boolean;
    customColors?: {
        hair?: string;
        suit?: string;
    };
}

export const GameCharacter = ({ type, state, name, title, showNameplate = true, customColors }: GameCharacterProps) => {
    const isPresenter = type === 'presenter';
    const isLeft = type === 'debater-left';

    // Character body colors based on type
    const getBodyColor = () => {
        if (isPresenter) return 'bg-primary';
        return isLeft ? 'bg-debater-left' : 'bg-debater-right';
    };

    const getSuitColor = () => {
        if (customColors?.suit) return customColors.suit;
        if (isPresenter) return 'bg-gradient-to-b from-amber-900 to-amber-950';
        return isLeft ? 'bg-gradient-to-b from-blue-800 to-blue-950' : 'bg-gradient-to-b from-red-800 to-red-950';
    };

    const getHairColor = () => {
        if (customColors?.hair) return customColors.hair;
        if (isPresenter) return 'bg-amber-800';
        return isLeft ? 'bg-stone-800' : 'bg-amber-950';
    };

    const getGlowColor = () => {
        if (isPresenter) return 'drop-shadow-[0_0_15px_hsl(43,96%,56%,0.5)]';
        return isLeft ? 'drop-shadow-[0_0_15px_hsl(220,85%,55%,0.5)]' : 'drop-shadow-[0_0_15px_hsl(0,75%,50%,0.5)]';
    };

    const getSkinTone = () => {
        // Variety of skin tones
        const tones = ['bg-amber-200', 'bg-amber-300', 'bg-orange-200', 'bg-yellow-200'];
        if (isPresenter) return 'bg-amber-200';
        return isLeft ? 'bg-amber-300' : 'bg-orange-200';
    };

    // Animation variants based on state
    const bodyVariants = {
        idle: {
            y: [0, -3, 0],
            transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const }
        },
        speaking: {
            y: [0, -5, 0],
            scale: [1, 1.02, 1],
            transition: { duration: 0.35, repeat: Infinity }
        },
        thinking: {
            rotate: [-2, 2, -2],
            y: [0, -2, 0],
            transition: { duration: 2, repeat: Infinity }
        },
        celebrating: {
            y: [0, -20, 0],
            rotate: [-8, 8, -8],
            scale: [1, 1.1, 1],
            transition: { duration: 0.4, repeat: Infinity }
        },
        defeated: {
            y: 5,
            rotate: -8,
            scale: 0.9,
            transition: { duration: 0.6 }
        }
    };

    const armVariants = {
        idle: { rotate: 0 },
        speaking: {
            rotate: [-15, 15, -15],
            transition: { duration: 0.25, repeat: Infinity }
        },
        thinking: { rotate: 8, y: -3 },
        celebrating: {
            rotate: [-45, 45, -45],
            y: [-10, -15, -10],
            transition: { duration: 0.3, repeat: Infinity }
        },
        defeated: { rotate: 15, y: 8 }
    };

    const headVariants = {
        idle: { rotate: 0 },
        speaking: {
            scale: [1, 1.02, 1],
            transition: { duration: 0.2, repeat: Infinity }
        },
        thinking: {
            rotate: [0, 5, 0],
            transition: { duration: 1.5, repeat: Infinity }
        },
        celebrating: {
            rotate: [-10, 10, -10],
            transition: { duration: 0.3, repeat: Infinity }
        },
        defeated: {
            rotate: -10,
            y: 5
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Character */}
            <motion.div
                className={`relative ${getGlowColor()}`}
                variants={bodyVariants}
                animate={state}
            >
                {/* Character shadow */}
                <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/30 rounded-full blur-sm"
                    animate={state === 'celebrating' ? { scale: [1, 0.7, 1] } : { scale: 1 }}
                    transition={{ duration: 0.4, repeat: state === 'celebrating' ? Infinity : 0 }}
                />

                {/* Body/Suit - Draw first so arms layer properly */}
                <div className="relative">
                    {/* Arms - Behind body */}
                    <motion.div
                        className={`absolute -left-4 top-[70px] w-5 h-10 ${getSuitColor()} rounded-full origin-top z-0`}
                        variants={armVariants}
                        animate={state}
                    >
                        {/* Hand */}
                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 ${getSkinTone()} rounded-full`} />
                    </motion.div>
                    <motion.div
                        className={`absolute -right-4 top-[70px] w-5 h-10 ${getSuitColor()} rounded-full origin-top z-0`}
                        variants={armVariants}
                        animate={state}
                        style={{ scaleX: -1 }}
                    >
                        {/* Hand */}
                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 ${getSkinTone()} rounded-full`} />
                    </motion.div>

                    {/* Head */}
                    <motion.div
                        className="relative z-10"
                        variants={headVariants}
                        animate={state}
                    >
                        {/* Face circle */}
                        <div className={`w-16 h-16 md:w-18 md:h-18 rounded-full ${getSkinTone()} border-2 border-amber-400/30 relative overflow-hidden shadow-inner`}>
                            {/* Hair */}
                            <div className={`absolute -top-1 -left-1 -right-1 h-7 ${getHairColor()}`}
                                style={{ borderRadius: '50% 50% 0 0' }}
                            />

                            {/* Ears */}
                            <div className={`absolute top-6 -left-1.5 w-3 h-4 ${getSkinTone()} rounded-full border border-amber-400/20`} />
                            <div className={`absolute top-6 -right-1.5 w-3 h-4 ${getSkinTone()} rounded-full border border-amber-400/20`} />

                            {/* Eyebrows */}
                            <motion.div
                                className="absolute top-5 left-0 right-0 flex justify-center gap-4"
                                animate={state === 'thinking' ? { y: -2 } : state === 'defeated' ? { rotate: 10 } : {}}
                            >
                                <div className={`w-3 h-1 ${getHairColor()} rounded-full`} style={{ transform: 'rotate(-5deg)' }} />
                                <div className={`w-3 h-1 ${getHairColor()} rounded-full`} style={{ transform: 'rotate(5deg)' }} />
                            </motion.div>

                            {/* Eyes */}
                            <div className="absolute top-7 left-0 right-0 flex justify-center gap-3">
                                <motion.div
                                    className="w-3 h-3 rounded-full bg-white flex items-center justify-center"
                                    animate={state === 'speaking' ? { scaleY: [1, 0.3, 1] } : {}}
                                    transition={{ duration: 0.2, repeat: state === 'speaking' ? Infinity : 0, repeatDelay: 2.5 }}
                                >
                                    <motion.div
                                        className="w-1.5 h-1.5 rounded-full bg-stone-800"
                                        animate={state === 'thinking' ? { x: 1 } : state === 'defeated' ? { y: 1 } : {}}
                                    />
                                </motion.div>
                                <motion.div
                                    className="w-3 h-3 rounded-full bg-white flex items-center justify-center"
                                    animate={state === 'speaking' ? { scaleY: [1, 0.3, 1] } : {}}
                                    transition={{ duration: 0.2, repeat: state === 'speaking' ? Infinity : 0, repeatDelay: 2.5 }}
                                >
                                    <motion.div
                                        className="w-1.5 h-1.5 rounded-full bg-stone-800"
                                        animate={state === 'thinking' ? { x: 1 } : state === 'defeated' ? { y: 1 } : {}}
                                    />
                                </motion.div>
                            </div>

                            {/* Nose */}
                            <div className="absolute top-9 left-1/2 -translate-x-1/2 w-1.5 h-2 bg-amber-300/50 rounded-full" />

                            {/* Mouth */}
                            <motion.div
                                className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 ${state === 'celebrating' ? 'bg-rose-400' :
                                        state === 'defeated' ? 'bg-rose-300' : 'bg-rose-400'
                                    } rounded-full overflow-hidden`}
                                animate={state === 'speaking' ? {
                                    width: ['10px', '14px', '8px', '12px', '10px'],
                                    height: ['5px', '10px', '6px', '8px', '5px'],
                                } : state === 'celebrating' ? {
                                    width: '14px',
                                    height: '8px',
                                    borderRadius: '0 0 50% 50%',
                                } : state === 'defeated' ? {
                                    width: '8px',
                                    height: '4px',
                                    borderRadius: '50% 50% 0 0',
                                    y: 2
                                } : {
                                    width: '10px',
                                    height: '5px'
                                }}
                                transition={{ duration: 0.15, repeat: state === 'speaking' ? Infinity : 0 }}
                            >
                                {/* Teeth for celebrating */}
                                {state === 'celebrating' && (
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-white" />
                                )}
                            </motion.div>

                            {/* Glasses for presenter */}
                            {isPresenter && (
                                <div className="absolute top-6 left-0 right-0 flex justify-center">
                                    <div className="flex items-center gap-0.5">
                                        <div className="w-4 h-3 border-2 border-amber-700 rounded-sm bg-blue-900/10" />
                                        <div className="w-2 h-0.5 bg-amber-700" />
                                        <div className="w-4 h-3 border-2 border-amber-700 rounded-sm bg-blue-900/10" />
                                    </div>
                                </div>
                            )}

                            {/* Blush for celebrating */}
                            {state === 'celebrating' && (
                                <>
                                    <div className="absolute bottom-4 left-2 w-2 h-1 bg-rose-300 rounded-full opacity-60" />
                                    <div className="absolute bottom-4 right-2 w-2 h-1 bg-rose-300 rounded-full opacity-60" />
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Neck */}
                    <div className={`relative mx-auto -mt-1 w-6 h-3 ${getSkinTone()} z-5`} />

                    {/* Body/Suit */}
                    <div className={`relative -mt-1 w-20 h-16 md:w-24 md:h-18 ${getSuitColor()} rounded-t-xl rounded-b-md z-10 overflow-hidden`}>
                        {/* Shirt collar */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-white"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }}
                        />

                        {/* Tie */}
                        <div className={`absolute top-3 left-1/2 -translate-x-1/2 w-4 h-10 ${getBodyColor()}`}
                            style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 20%, 60% 100%, 40% 100%, 0% 20%)' }}
                        />

                        {/* Suit buttons */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                        </div>

                        {/* Suit lapels */}
                        <div className="absolute top-0 left-2 w-4 h-10 border-r-2 border-black/20"
                            style={{ transform: 'skewY(-10deg)' }}
                        />
                        <div className="absolute top-0 right-2 w-4 h-10 border-l-2 border-black/20"
                            style={{ transform: 'skewY(10deg)' }}
                        />
                    </div>
                </div>

                {/* State indicators */}
                {state === 'speaking' && (
                    <motion.div
                        className="absolute -top-3 -right-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    >
                        <div className={`w-6 h-6 rounded-full ${getBodyColor()} flex items-center justify-center shadow-lg`}>
                            <span className="text-xs">🎤</span>
                        </div>
                    </motion.div>
                )}

                {state === 'thinking' && (
                    <motion.div
                        className="absolute -top-8 -right-6"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="flex items-end gap-1">
                            <motion.div
                                className="w-2 h-2 rounded-full bg-muted-foreground"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                                className="w-2.5 h-2.5 rounded-full bg-muted-foreground"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                                className="w-4 h-4 rounded-full bg-muted-foreground flex items-center justify-center"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            >
                                <span className="text-[8px]">💭</span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {state === 'celebrating' && (
                    <>
                        {/* Confetti around character */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2"
                                style={{
                                    top: -10,
                                    left: 10 + i * 12,
                                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD'][i],
                                    borderRadius: i % 2 === 0 ? '50%' : '0',
                                }}
                                animate={{
                                    y: [0, 30, 60],
                                    x: [(i - 2.5) * 5, (i - 2.5) * 10, (i - 2.5) * 15],
                                    rotate: [0, 180, 360],
                                    opacity: [1, 1, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                }}
                            />
                        ))}
                        {/* Stars */}
                        <motion.div
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl"
                            animate={{
                                scale: [0, 1.2, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            ⭐
                        </motion.div>
                    </>
                )}

                {state === 'defeated' && (
                    <motion.div
                        className="absolute -top-4 left-1/2 -translate-x-1/2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <span className="text-lg">😢</span>
                    </motion.div>
                )}
            </motion.div>

            {/* Nameplate */}
            {showNameplate && (
                <motion.div
                    className={`mt-4 px-4 py-1.5 rounded-lg backdrop-blur-sm ${isPresenter ? 'bg-primary/20 border border-primary/40' :
                            isLeft ? 'bg-debater-left/20 border border-debater-left/40' :
                                'bg-debater-right/20 border border-debater-right/40'
                        }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className={`text-xs md:text-sm font-bold text-center ${isPresenter ? 'text-primary' :
                            isLeft ? 'text-debater-left-glow' : 'text-debater-right-glow'
                        }`}>
                        {name}
                    </p>
                    {title && (
                        <p className="text-[10px] text-muted-foreground text-center">{title}</p>
                    )}
                </motion.div>
            )}
        </div>
    );
};
