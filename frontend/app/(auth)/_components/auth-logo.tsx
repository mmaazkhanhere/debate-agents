'use client';

import { motion } from 'framer-motion';
import { Mic2 } from 'lucide-react';

const AuthLogo = () => {
    return (
        <div className="text-center mb-8">
            <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/50 mb-4"
                animate={{
                    boxShadow:
                        [
                            '0 0 20px hsl(43 96% 56% / 0.3)',
                            '0 0 40px hsl(43 96% 56% / 0.5)',
                            '0 0 20px hsl(43 96% 56% / 0.3)'
                        ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Mic2 className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-wider">
                THE ARENA
            </h1>

            <p className="text-muted-foreground mt-2">
                Where ideas clash and minds collide
            </p>
        </div>
    );
}

export default AuthLogo;