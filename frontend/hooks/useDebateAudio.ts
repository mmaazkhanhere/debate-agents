import { useEffect } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export function useDebateAudio(phase: string, enabled: boolean) {
    const { playSound, setEnabled } = useSoundEffects();

    useEffect(() => {
        setEnabled(enabled);
    }, [enabled, setEnabled]);

    useEffect(() => {
        if (phase === "intro") playSound("intro");
        if (phase === "playing") playSound("argument");
        if (phase === "winnerAnnouncement") playSound("victory");
    }, [phase, playSound]);
}
