import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic, X } from "lucide-react";


interface ModeratorZoneProps {
    topic: string;
    round: number;
    totalRounds: number;
    presenterName: string;
    announcement?: string;
    onAnnouncementComplete?: () => void;
    showRules?: boolean;
    onToggleRules?: () => void;
}

/* ---------- Hook ---------- */

function useTypewriter(text?: string, onDone?: () => void) {
    const [value, setValue] = useState("");
    const [typing, setTyping] = useState(false);

    useEffect(() => {
        if (!text) return;

        let i = 0;
        setTyping(true);
        setValue("");

        const id = setInterval(() => {
            if (i < text.length) {
                setValue(text.slice(0, ++i));
            } else {
                setTyping(false);
                clearInterval(id);
                setTimeout(onDone, 1200);
            }
        }, 40);

        return () => clearInterval(id);
    }, [text, onDone]);

    return { value, typing };
}

/* ---------- Components ---------- */

const Announcer = memo(function Announcer({
    presenterName,
    text,
    typing,
}: {
    presenterName: string;
    text: string;
    typing: boolean;
}) {
    return (
        <section
            aria-live="polite"
            aria-atomic="true"
            className="flex items-start gap-4"
            itemScope
            itemType="https://schema.org/Person"
        >
            <motion.div
                aria-hidden
                className="relative shrink-0"
                animate={{ scale: typing ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.5, repeat: typing ? Infinity : 0 }}
            >
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-primary-foreground" />
                </div>
            </motion.div>

            <div>
                <p className="text-sm font-medium text-primary" itemProp="name">
                    {presenterName} <span className="text-xs text-muted-foreground">• Moderator</span>
                </p>
                <p itemProp="description" className="text-sm text-foreground/90 leading-relaxed">
                    {text}
                    {typing ? <span className="ml-1 inline-block w-0.5 h-4 bg-primary animate-pulse" /> : null}
                </p>
            </div>
        </section>
    );
});

/* ---------- Main ---------- */

const ModeratorZone = ({
    topic,
    round,
    totalRounds,
    presenterName,
    announcement,
    onAnnouncementComplete,
    showRules = false,
    onToggleRules,
}: ModeratorZoneProps) => {
    const { value, typing } = useTypewriter(announcement, onAnnouncementComplete);

    return (
        <header
            role="banner"
            aria-label="Live debate moderator panel"
            className="relative w-full bg-linear-to-b from-slate-900/95 to-slate-950/95 border-b border-primary/20"
        >
            <div className="max-w-6xl mx-auto px-6 py-4">
                <main className="flex items-center justify-between">
                    <section>
                        <p className="text-xs font-medium text-red-400 uppercase tracking-wider">
                            Live Debate
                        </p>
                        <h1 className="text-lg md:text-xl font-display truncate">{topic}</h1>
                    </section>

                    <aside className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                            <span className="text-xs text-muted-foreground">Round</span>
                            <strong className="ml-2 text-primary">
                                {round}/{totalRounds}
                            </strong>
                        </div>

                        {onToggleRules ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onToggleRules}
                                className={cn(showRules && "text-primary")}
                            >
                                <BookOpen className="w-4 h-4 mr-1" /> Rules
                            </Button>
                        ) : null}
                    </aside>
                </main>
            </div>

            <AnimatePresence>
                {announcement ? (
                    <motion.div
                        className="border-t border-slate-800/50"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <div className="max-w-4xl mx-auto px-6 py-4">
                            <Announcer presenterName={presenterName} text={value} typing={typing} />
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <AnimatePresence>
                {showRules ? (
                    <motion.aside
                        aria-label="Debate rules"
                        className="absolute top-full left-0 right-0 z-50 bg-slate-900/98 border-b border-primary/20"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between">
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>Each debater plays argument cards from their deck</li>
                                <li>Cards can attack, defend, or counter points</li>
                                <li>Crowd reactions influence final score</li>
                                <li>Judges evaluate logic, evidence, and rhetoric</li>
                            </ul>
                            <Button variant="ghost" size="icon" onClick={onToggleRules}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.aside>
                ) : null}
            </AnimatePresence>
        </header>
    );
}

export default ModeratorZone;