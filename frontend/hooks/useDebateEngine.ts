import { useCallback, useEffect, useState } from "react";
import { DebateData, DebateArgument } from "@/data/mockDebate";
import { CardType } from "@/types/type_d";

type Phase =
    | "intro"
    | "drawing"
    | "playing"
    | "speaking"
    | "reaction"
    | "judging"
    | "verdict";

interface PlayedCard {
    id: string;
    type: CardType;
    text: string;
    speaker: string;
    side: 'left' | 'right';
    confidence: number;
}

export function useDebateEngine(debate: DebateData) {
    const [phase, setPhase] = useState<Phase>("intro");
    const [roundIndex, setRoundIndex] = useState(-1);
    const [activeSide, setActiveSide] = useState<"left" | "right" | null>(null);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);

    const [leftCards, setLeftCards] = useState<PlayedCard[]>([]);
    const [rightCards, setRightCards] = useState<PlayedCard[]>([]);

    const [scores, setScores] = useState({ left: 0, right: 0 });
    const [confidence, setConfidence] = useState({ left: 75, right: 75 });
    const [revealedJudges, setRevealedJudges] = useState(0);
    const [selectedCard, setSelectedCard] = useState<PlayedCard | null>(null);

    const currentArgument: DebateArgument | undefined = debate.arguments[roundIndex];

    const nextRound = useCallback(() => {
        setRoundIndex(i => i + 1);
        setActiveSide(null);
        setActiveCardId(null);
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
        } else if (currentArgument.crowdReaction === "negative") {
            setConfidence(c => ({
                ...c,
                [side]: Math.max(0, c[side] - 5)
            }));
        }

        setPhase("reaction");

        // After reaction, either go to next round or judging
        if (roundIndex < debate.arguments.length - 1) {
            setTimeout(nextRound, 2000);
        } else {
            setTimeout(() => setPhase("judging"), 2000);
        }
    }, [currentArgument, roundIndex, debate.arguments.length, nextRound]);

    const reset = useCallback(() => {
        setPhase("intro");
        setRoundIndex(-1);
        setLeftCards([]);
        setRightCards([]);
        setScores({ left: 0, right: 0 });
        setConfidence({ left: 75, right: 75 });
        setRevealedJudges(0);
        setActiveSide(null);
        setActiveCardId(null);
    }, []);

    // Phase Engine
    useEffect(() => {
        if (phase === "drawing" && currentArgument) {
            const timer = setTimeout(() => {
                setPhase("playing");
            }, 1000);
            return () => clearTimeout(timer);
        }

        if (phase === "playing" && currentArgument) {
            const side = currentArgument.debaterId;
            const cardId = `card-${roundIndex}`;

            const addCardIfMissing = (prev: PlayedCard[]) => {
                if (prev.some(c => c.id === cardId)) return prev;
                const newCard: PlayedCard = {
                    id: cardId,
                    type: currentArgument.cardType || 'attack',
                    text: currentArgument.text,
                    speaker: side === 'left' ? debate.debaters.left.name : debate.debaters.right.name,
                    side: side,
                    confidence: confidence[side]
                };
                return [...prev, newCard];
            };

            if (side === 'left') {
                setLeftCards(addCardIfMissing);
            } else {
                setRightCards(addCardIfMissing);
            }

            setActiveSide(side);
            setActiveCardId(cardId);

            const timer = setTimeout(() => {
                setPhase("speaking");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [phase, currentArgument, roundIndex, debate.debaters, confidence]);

    // Judging reveal engine
    useEffect(() => {
        if (phase === "judging") {
            if (revealedJudges < debate.judges.length) {
                const timer = setTimeout(() => {
                    setRevealedJudges(prev => prev + 1);
                }, 1500);
                return () => clearTimeout(timer);
            } else {
                const timer = setTimeout(() => {
                    setPhase("verdict");
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [phase, revealedJudges, debate.judges.length]);

    return {
        phase,
        roundIndex,
        activeSide,
        activeCardId,
        currentArgument,
        leftCards,
        rightCards,
        scores,
        confidence,
        revealedJudges,
        selectedCard,
        setPhase,
        setActiveSide,
        setActiveCardId,
        setLeftCards,
        setRightCards,
        setSelectedCard,
        nextRound,
        applyReaction,
        reset
    };
}
