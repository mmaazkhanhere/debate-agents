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

    // Extract moderator intro from stream
    const streamedModeratorIntro = useMemo(() => {
        if (!streamedArguments) return null;
        // The event name is moderator_intro_done as established in backend
        const introEvent = streamedArguments.find(e => e.event === "moderator_intro_done" || e.debater === "Moderator");
        return introEvent?.data?.output || introEvent?.text || null;
    }, [streamedArguments]);

    // Merge mock arguments with streamed ones if provided
    const effectiveArguments = useMemo(() => {
        if (!streamedArguments) return debate.arguments;

        // Filter out moderator events from the debater sequence
        // agent_done is the primary event for debater turns, so we must include it
        return streamedArguments
            .filter(e =>
                e.event !== "moderator_intro_done" &&
                e.debater !== "Moderator" &&
                e.agent !== "moderator_agent"
            )
            .map(event => {
                // New structure has event.debater, fallback to event.agent or event.data.debater
                const debaterName = event.debater || event.agent || event.data?.debater;
                const isLeft = debaterName === debate.debaters.left.name;
                const debaterId = isLeft ? 'left' : 'right';

                // Extract values from nested 'data' if present, otherwise use top-level
                const argument = event.data?.argument || (typeof event.argument === 'object' ? event.argument : undefined);
                const text = argument?.text || event.text || "...";

                // Robust type mapping
                let type: CardType = 'attack';
                const rawType = argument?.type || event.data?.argument?.type;
                if (rawType && ['attack', 'defense', 'counter', 'evidence', 'rhetoric', 'framing', 'clarification'].includes(rawType)) {
                    type = rawType as CardType;
                }

                const confValue = argument?.confidence ?? event.data?.argument?.confidence ?? event.confidence ?? 75;

                // Simple logic to derive reaction from confidence
                let reaction: 'positive' | 'negative' | 'neutral' = 'neutral';
                if (confValue > 80) reaction = 'positive';
                else if (confValue < 40) reaction = 'negative';

                return {
                    debaterId,
                    text,
                    crowdReaction: reaction,
                    cardType: type,
                    confidence: confValue
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
            // Set confidence from the card played
            setConfidence(c => ({
                ...c,
                [side]: currentArgument.confidence ?? c[side]
            }));
        } else if (currentArgument.crowdReaction === "negative") {
            // Even on negative reaction, we follow the card's reported confidence for the bar
            setConfidence(c => ({
                ...c,
                [side]: currentArgument.confidence ?? c[side]
            }));
        } else {
            // Neutral - still update confidence to match the card
            setConfidence(c => ({
                ...c,
                [side]: currentArgument.confidence ?? c[side]
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
                    confidence: currentArgument.confidence ?? confidence[side]
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
        streamedModeratorIntro,
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
