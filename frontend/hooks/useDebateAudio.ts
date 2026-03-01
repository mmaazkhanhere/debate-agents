import { useEffect } from "react";
import type { StateValue } from "xstate";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export function useDebateAudio(phase: StateValue, enabled: boolean) {
    const { playSound, setEnabled } = useSoundEffects();

    useEffect(() => {
        setEnabled(enabled);
    }, [enabled, setEnabled]);

    useEffect(() => {
        if (typeof phase !== "string") return;
        if (phase === "intro") playSound("intro");
        if (phase === "playing") playSound("argument");
        if (phase === "winnerAnnouncement") playSound("victory");
    }, [phase, playSound]);
}
