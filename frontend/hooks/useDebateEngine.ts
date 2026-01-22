import { useCallback, useEffect, useState, useMemo } from "react";
import { DebateData, DebateArgument } from "@/data/mockDebate";
import { CardType } from "@/types/type_d";
import { DebateEvent } from "../services/debate-api";

type Phase =
    | "intro"
    | "drawing"
    | "playing"
    | "speaking"
    | "reaction"
    | "judging"
    | "verdict"
    | "waiting"; // New state for waiting for data

interface PlayedCard {
    id: string;
    type: CardType;
    text: string;
    speaker: string;
    side: 'left' | 'right';
    confidence: number;
}

export function useDebateEngine(
    debate: DebateData,
    streamedArguments?: DebateEvent[],
    isDebateFinished: boolean = false
) {
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

    // Merge mock arguments with streamed ones if provided
    const effectiveArguments = useMemo(() => {
        if (!streamedArguments) return debate.arguments;

        return streamedArguments.map(event => {
            const isLeft = event.agent === debate.debaters.left.name;
            const debaterId = isLeft ? 'left' : 'right';

            // Confidence mapping: "confidence" is the power. 
            // We use it to determine reaction AND passing it to the card stats.
            const confValue = event.argument?.confidence ?? event.confidence ?? 75;

            // Simple logic to derive reaction from confidence
            let reaction: 'positive' | 'negative' | 'neutral' = 'neutral';
            if (confValue > 80) reaction = 'positive';
            else if (confValue < 40) reaction = 'negative';

            return {
                debaterId,
                text: event.argument?.text || event.text || "...",
                crowdReaction: reaction,
                // Pass confidence through so we can use it in the UI if needed, 
                // though DebateArgument interface might need update if we want to store it explicitly.
                // For now, we use it for reaction. The Confidence Bar in UI uses 'confidence' state which we update in applyReaction.
                // Wait, useDebateEngine updates 'confidence' state based on 'reaction'.
                // If we want to Set the confidence directly from the card, we might need a different approach.
                // But user said: "The confidence of persona is calculated using these confidence".
                // I will add a 'rawConfidence' property to DebateArgument if I can, OR just use it for reaction effectively.
                // Actually, let's stick to the current reaction logic which influences the persona confidence score.
                cardType: (event.argument?.type as CardType) || 'attack'
            } as DebateArgument;
        });
    }, [streamedArguments, debate.arguments, debate.debaters]);

    const currentArgument: DebateArgument | undefined = effectiveArguments[roundIndex];

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

        // Logic for proceeding
        // If we have more arguments ready, go to next round
        if (roundIndex < effectiveArguments.length - 1) {
            setTimeout(nextRound, 2000);
        }
        // If we are at the end, checks strictly against isDebateFinished
        else if (isDebateFinished) {
            setTimeout(() => setPhase("judging"), 2000);
        }
        // Else, we wait for more data. We can stay in 'reaction' or go to 'waiting'
        else {
            // We'll advance index to "ready" for next one, but phase will be 'drawing' 
            // and since currentArgument will be undefined, it will wait there.
            setTimeout(nextRound, 2000);
        }
    }, [currentArgument, roundIndex, effectiveArguments.length, nextRound, isDebateFinished]);

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
