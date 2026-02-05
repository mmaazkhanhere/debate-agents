import { motion } from "framer-motion";

import { SpeechSide } from "./debater-speech-overlay";
import { speechAlignmentStyles } from "./speech-overlay-styles";

import { cn } from "@/lib/utils";


const TypingIndicator = ({ side }: { side: SpeechSide }) => {
    const styles = speechAlignmentStyles[side];

    return (
        <motion.div
            className="flex gap-1"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
        >
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
            ))}
        </motion.div>
    );
}

export default TypingIndicator
