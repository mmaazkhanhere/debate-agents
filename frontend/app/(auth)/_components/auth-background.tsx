'use client';

import { motion } from 'framer-motion';

const AuthBackground = () => {
    return (
        <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1)_0%,transparent_70%)]" />

            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-debater-left/10 rounded-full blur-3xl animate-pulse" />
            <div
                className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-debater-right/10 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: '1s' }}
            />

            <motion.div
                className="absolute top-20 left-10 text-4xl"
                animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
            >
                🎭
            </motion.div>

            <motion.div
                className="absolute top-32 right-20 text-3xl"
                animate={{ y: [0, -10, 0], rotate: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
                ⚔️
            </motion.div>

            <motion.div
                className="absolute bottom-20 left-20 text-3xl"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            >
                🏆
            </motion.div>
        </>
    );
}

export default AuthBackground;