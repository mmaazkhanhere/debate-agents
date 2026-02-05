import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SpeechSide } from "./debater-speech-overlay";
import { speechAlignmentStyles } from "./speech-overlay-styles";
import TypingIndicator from "./typing-indicator";


interface SpeakerHeaderProps {
    name: string;
    side: SpeechSide;
    isTyping: boolean;
}

const SpeakerHeader = ({ name, side, isTyping }: SpeakerHeaderProps) => {
    const styles = speechAlignmentStyles[side];

    return (
        <motion.div
            className={cn("mb-4 flex items-center gap-3", styles.container)}
            initial={{ opacity: 0, x: styles.slideFrom }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className={cn("h-0.5 w-12 rounded-full", styles.accentLine)} />
            <span className={cn("text-sm font-medium uppercase tracking-wider", styles.text)}>
                {name}
            </span>
            {isTyping && <TypingIndicator side={side} />}
        </motion.div>
    );
}

export default SpeakerHeader