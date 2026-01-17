import { motion } from "framer-motion";
import { memo } from "react";

interface TopicBannerProps {
    topic: string;
}

export const TopicBanner = memo(function TopicBanner({ topic }: TopicBannerProps) {
    return (
        <motion.header
            role="banner"
            aria-label="Debate topic"
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            itemScope
            itemType="https://schema.org/Event"
        >
            <div className="bg-secondary/80 backdrop-blur-sm border border-primary/30 rounded-lg px-4 py-2 md:px-6 md:py-3 max-w-xl md:max-w-2xl text-center glow-gold">
                <p className="text-xs uppercase tracking-widest text-primary mb-1">
                    Tonight’s Topic
                </p>
                <h1 itemProp="name" className="font-display text-lg md:text-xl lg:text-2xl tracking-wide leading-tight">
                    {topic}
                </h1>
            </div>
        </motion.header>
    );
});
