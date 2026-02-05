import { cn } from "@/lib/utils";
import { SpeechSide } from "./debater-speech-overlay";
import { speechAlignmentStyles } from "./speech-overlay-styles";
import SpeechAccentLine from "./speech-accent-line";


interface SpeechBubbleProps {
    text: string;
    side: SpeechSide;
    isTyping: boolean;
}

const SpeechBubble = ({ text, side, isTyping }: SpeechBubbleProps) => {
    const styles = speechAlignmentStyles[side];

    return (
        <div className={cn("relative rounded-2xl border p-6", styles.border)}>
            <SpeechAccentLine side={side} />

            <p className="text-center text-lg font-medium">
                “{text}”
                {isTyping && <span className={cn("ml-1 inline-block h-5 w-0.5", styles.caret)} />}
            </p>
        </div>
    );
}

export default SpeechBubble
