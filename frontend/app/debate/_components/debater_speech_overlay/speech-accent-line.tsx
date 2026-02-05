import { SpeechSide } from "./debater-speech-overlay";
import { speechAlignmentStyles } from "./speech-overlay-styles";

import { cn } from "@/lib/utils";


const SpeechAccentLine = ({ side }: { side: SpeechSide }) => {
    const styles = speechAlignmentStyles[side];

    return (
        <div
            className={cn(
                "absolute left-1/2 top-0 h-1 w-24 -translate-x-1/2",
                styles.accentGlow
            )}
        />
    );
}

export default SpeechAccentLine
