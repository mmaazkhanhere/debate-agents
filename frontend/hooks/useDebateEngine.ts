import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DebateData } from "@/types/debate";
import { DebateEvent } from "../services/debate-api";
import { DEFAULT_CONFIDENCE, PHASE_DELAYS } from "./debateEngine/constants";
import { addCardIfMissing, createPlayedCard } from "./debateEngine/cards";
import { buildArguments, getModeratorIntro } from "./debateEngine/stream";
import {
    ConfidenceBySide,
    DebateEngine,
    DebatePhase,
    PlayedCard,
    ScoreBySide,
    Side
} from "./debateEngine/types";

export function useDebateEngine(
    debate: DebateData,
    streamedArguments?: DebateEvent[],
    isDebateFinished: boolean = false
): DebateEngine {
    const [phase, setPhase] = useState<DebatePhase>("intro");
    const [roundIndex, setRoundIndex] = useState(-1);
    const [activeSide, setActiveSide] = useState<Side | null>(null);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);

    const [leftCards, setLeftCards] = useState<PlayedCard[]>([]);
    const [rightCards, setRightCards] = useState<PlayedCard[]>([]);

    const [confidence, setConfidence] = useState<ConfidenceBySide>({
        left: DEFAULT_CONFIDENCE,
        right: DEFAULT_CONFIDENCE
    });
    const [revealedJudges, setRevealedJudges] = useState(0);
    const [selectedCard, setSelectedCard] = useState<PlayedCard | null>(null);

    const timeoutIdsRef = useRef<number[]>([]);
    const scores = useMemo<ScoreBySide>(() => ({ left: 0, right: 0 }), []);

    useEffect(() => {
        return () => {
            timeoutIdsRef.current.forEach(id => window.clearTimeout(id));
            timeoutIdsRef.current = [];
        };
    }, []);

    const schedule = useCallback((callback: () => void, delayMs: number) => {
        const id = window.setTimeout(callback, delayMs);
        timeoutIdsRef.current.push(id);
        return id;
    }, []);

    const streamedModeratorIntro = useMemo(
        () => getModeratorIntro(streamedArguments),
        [streamedArguments]
    );

    const argumentsList = useMemo(
        () => buildArguments(debate, streamedArguments),
        [debate, streamedArguments]
    );

    const currentArgument = argumentsList[roundIndex];

    const nextRound = useCallback(() => {
        setRoundIndex(index => index + 1);
        setActiveSide(null);
        setActiveCardId(null);
        setPhase("drawing");
    }, []);

    const completeArgument = useCallback(() => {
        if (!currentArgument) return;

        const side = currentArgument.debaterId;
        setConfidence(values => ({
            ...values,
            [side]: currentArgument.confidence ?? values[side]
        }));

        if (roundIndex < argumentsList.length - 1) {
            schedule(nextRound, PHASE_DELAYS.postArgumentMs);
            return;
        }

        if (isDebateFinished) {
            schedule(() => setPhase("judging"), PHASE_DELAYS.postArgumentMs);
            return;
        }

        schedule(nextRound, PHASE_DELAYS.postArgumentMs);
    }, [argumentsList.length, currentArgument, isDebateFinished, nextRound, roundIndex, schedule]);

    const reset = useCallback(() => {
        setPhase("intro");
        setRoundIndex(-1);
        setLeftCards([]);
        setRightCards([]);
        setConfidence({ left: DEFAULT_CONFIDENCE, right: DEFAULT_CONFIDENCE });
        setRevealedJudges(0);
        setActiveSide(null);
        setActiveCardId(null);
        setSelectedCard(null);
    }, []);

    useEffect(() => {
        if (phase !== "drawing" || !currentArgument) return;

        const timer = window.setTimeout(() => setPhase("playing"), PHASE_DELAYS.drawToPlayMs);
        return () => window.clearTimeout(timer);
    }, [phase, currentArgument]);

    useEffect(() => {
        if (phase !== "playing" || !currentArgument) return;

        const card = createPlayedCard(currentArgument, debate, roundIndex, confidence);
        const side = currentArgument.debaterId;

        if (side === "left") {
            setLeftCards(prev => addCardIfMissing(prev, card));
        } else {
            setRightCards(prev => addCardIfMissing(prev, card));
        }

        setActiveSide(side);
        setActiveCardId(card.id);

        const timer = window.setTimeout(() => setPhase("speaking"), PHASE_DELAYS.playToSpeakMs);
        return () => window.clearTimeout(timer);
    }, [phase, currentArgument, debate, roundIndex, confidence]);

    const judges = debate.judges ?? [];

    useEffect(() => {
        if (phase !== "judging") return;

        if (revealedJudges < judges.length) {
            const timer = window.setTimeout(
                () => setRevealedJudges(prev => prev + 1),
                PHASE_DELAYS.judgeRevealMs
            );
            return () => window.clearTimeout(timer);
        }

        const timer = window.setTimeout(() => setPhase("verdict"), PHASE_DELAYS.verdictDelayMs);
        return () => window.clearTimeout(timer);
    }, [phase, revealedJudges, judges.length]);

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
        completeArgument,
        reset
    };
}
