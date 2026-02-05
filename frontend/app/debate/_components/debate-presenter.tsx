import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";

import { Mic } from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";


type DebatePresenterProps = {
    debateTopic: string;
    currentRound: number;
    totalRounds: number;
    announcementText?: string;
    onAnnouncementFinished?: () => void;
}


const DebatePresenter = ({
    debateTopic,
    currentRound,
    totalRounds,
    announcementText,
    onAnnouncementFinished,
}: DebatePresenterProps) => {

    const { displayedText, isTyping } = useTypewriter({
        text: announcementText ?? "",
        enabled: Boolean(announcementText),
        speed: 40,
        delayAfterComplete: 1200,
        onComplete: onAnnouncementFinished,
    });

    const hasAnnouncement = Boolean(announcementText);

    return (
        <section
            aria-labelledby="debate-title"
            className="relative w-full bg-linear-to-b from-slate-900/95 to-slate-950/95 border-b border-primary/20"
        >
            <div className="max-w-6xl mx-auto px-6 py-4">
                <main className="flex items-center justify-between gap-4">
                    <section className="min-w-0">
                        <p className="text-xs font-medium text-red-400 uppercase tracking-wider">
                            Live Debate
                        </p>
                        <h1 className="text-lg md:text-xl font-display break-words whitespace-normal md:truncate">
                            {debateTopic}
                        </h1>
                    </section>

                    <aside className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                            <span className="text-xs text-muted-foreground">Round</span>
                            <strong className="ml-2 text-primary">
                                {currentRound}/{totalRounds}
                            </strong>
                        </div>
                    </aside>
                </main>
            </div>

            <AnimatePresence>
                {hasAnnouncement && (
                    <motion.div
                        className="border-t border-slate-800/50"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <div className="max-w-4xl mx-auto px-6 py-4">
                            <PresenterAnnouncement
                                presenterName={"Piers Morgan"}
                                text={displayedText}
                                isTyping={isTyping}
                            />
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence>
        </section>
    );
}
export default DebatePresenter;



/* ---------- Components ---------- */

const PresenterAnnouncement = memo(function PresenterAnnouncement({
    presenterName,
    text,
    isTyping,
}: {
    presenterName: string;
    text: string;
    isTyping: boolean;
}) {
    return (
        <section
            aria-live="polite"
            aria-atomic="true"
            className="flex items-start gap-4"
        >
            <motion.div
                aria-hidden
                className="relative shrink-0"
                animate={{ scale: isTyping ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.5, repeat: isTyping ? Infinity : 0 }}
            >
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-primary-foreground" />
                </div>
            </motion.div>

            <div>
                <p className="text-sm font-medium text-primary" itemProp="name">
                    {presenterName}
                </p>
                <p itemProp="description" className="text-sm text-foreground/90 leading-relaxed">
                    {text}
                    {isTyping ? <span className="ml-1 inline-block w-0.5 h-4 bg-primary animate-pulse" /> : null}
                </p>
            </div>
        </section>
    );
});
