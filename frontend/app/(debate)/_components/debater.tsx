"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn, getSideClasses } from "@/lib/utils";
import type { Debater as DebaterType } from "@/data/mockDebate";

interface DebaterProps {
    debater: DebaterType;
    isActive: boolean;
    isSpeaking: boolean;
}

const SPEAKING_DOTS = [0, 1, 2] as const;



const Debater = ({ debater, isActive, isSpeaking }: DebaterProps) => {
    const isLeft = debater.id === "left";
    const prefersReducedMotion = useReducedMotion();
    const c = getSideClasses(isLeft);

    // Keep content fully rendered (good for SEO), but tone down motion if user prefers reduced motion.
    const containerAnimate = prefersReducedMotion
        ? { filter: isActive ? "brightness(1.05)" : "brightness(0.8)" }
        : {
            scale: isSpeaking ? 1.02 : 1,
            filter: isActive ? "brightness(1.1)" : "brightness(0.7)",
        };

    const avatarAnimate = prefersReducedMotion
        ? undefined
        : {
            boxShadow: isSpeaking ? c.speakingShadow : "none",
        };

    return (
        <motion.article
            // Semantic + SEO: describe a person with schema.org microdata
            itemScope
            itemType="https://schema.org/Person"
            className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-2xl",
                c.zone
            )}
            animate={containerAnimate}
            transition={{ duration: 0.3 }}
            aria-label={`${debater.name}, ${debater.title}${debater.ideology ? `, ${debater.ideology}` : ""}`}
            data-active={isActive ? "true" : "false"}
            data-speaking={isSpeaking ? "true" : "false"}
        >
            {/* Avatar */}
            <motion.figure className="m-0">
                <motion.div
                    className={cn(
                        "relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center",
                        "text-5xl md:text-6xl",
                        c.avatarShell
                    )}
                    animate={avatarAnimate}
                    aria-label={isSpeaking ? `${debater.name} is speaking` : `${debater.name} avatar`}
                    role="img"
                >
                    {/* If this is an emoji avatar, keep it as real text for SEO/accessibility */}
                    <span aria-hidden="true">{debater.avatar}</span>

                    {/* Speaking indicator */}
                    {isSpeaking ? (
                        <motion.div
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1"
                            initial={prefersReducedMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            aria-hidden="true"
                        >
                            {SPEAKING_DOTS.map((i) => (
                                <motion.span
                                    key={i}
                                    className={cn("w-2 h-2 rounded-full", c.dot)}
                                    animate={
                                        prefersReducedMotion
                                            ? undefined
                                            : {
                                                y: [0, -6, 0],
                                            }
                                    }
                                    transition={
                                        prefersReducedMotion
                                            ? undefined
                                            : {
                                                duration: 0.6,
                                                repeat: Infinity,
                                                delay: i * 0.15,
                                            }
                                    }
                                />
                            ))}
                        </motion.div>
                    ) : null}
                </motion.div>

                {/* Helps screen readers; harmless for SEO */}
                <figcaption className="sr-only" itemProp="name">
                    {debater.name}
                </figcaption>
            </motion.figure>

            {/* Name & Title */}
            <header className="text-center">
                {/* Use a stable heading level appropriate to the page.
           If this is the main entity on the page, consider h2/h1 at the page level. */}
                <h3
                    className={cn(
                        "font-display text-xl md:text-2xl tracking-wide",
                        c.glowText
                    )}
                    itemProp="name"
                >
                    {debater.name}
                </h3>

                <p className="text-muted-foreground text-sm" itemProp="jobTitle">
                    {debater.title}
                </p>

                {debater.ideology ? (
                    <span
                        className={cn(
                            "inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium",
                            c.badge
                        )}
                        // Not a perfect schema.org match, but harmless + can help crawlers interpret context.
                        itemProp="description"
                    >
                        {debater.ideology}
                    </span>
                ) : null}
            </header>
        </motion.article>
    );
}

export default Debater;
