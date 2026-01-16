import { useCallback, useEffect, useState } from "react";

type Phase =
    | "intro"
    | "drawing"
    | "playing"
    | "speaking"
    | "reaction"
    | "judging"
    | "verdict";

export function useDebateEngine(debate: DebateData) {
    const [phase, setPhase] = useState<Phase>("intro");
    const [roundIndex, setRoundIndex] = useState(-1);
    const [turn, setTurn] = useState<"left" | "right">("left");

    const [leftCards, setLeftCards] = useState([]);
    const [rightCards, setRightCards] = useState([]);

    const [scores, setScores] = useState({ left: 0, right: 0 });
    const [confidence, setConfidence] = useState({ left: 75, right: 75 });

    const currentArgument = debate.arguments[roundIndex];

    const nextRound = useCallback(() => {
        setRoundIndex(i => i + 1);
        setPhase("drawing");
    }, []);

    const applyReaction = useCallback(() => {
        if (!currentArgument) return;

        const side = currentArgument.debaterId;

        if (currentArgument.crowdReaction === "positive") {
            setScores(s => ({ ...s, [side]: s[side] + 1 }));
            setConfidence(c => ({
                ...c,
                [side]: Math.min(100, c[side] + 5)
            }));
        }

        setPhase("reaction");
    }, [currentArgument]);

    const reset = useCallback(() => {
        setPhase("intro");
        setRoundIndex(-1);
        setLeftCards([]);
        setRightCards([]);
        setScores({ left: 0, right: 0 });
        setConfidence({ left: 75, right: 75 });
    }, []);

    return {
        phase,
        roundIndex,
        turn,
        currentArgument,
        leftCards,
        rightCards,
        scores,
        confidence,
        setPhase,
        setTurn,
        setLeftCards,
        setRightCards,
        nextRound,
        applyReaction,
        reset
    };
}
