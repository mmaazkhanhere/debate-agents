import { useMachine } from "@xstate/react";
import { debateMachine } from "./debateEngine/machine/debate.machine";
import { DebateData } from "@/types/debate";
import { DebateEvent } from "@/types/debate-event";
import { useEffect, useMemo, useState } from "react";
import { buildArguments, getModeratorIntro } from "./debateEngine/stream";
import { PlayedCard } from "./debateEngine/types";

export const useDebateEngine = (debate: DebateData, streamedEvents: DebateEvent[], isFinished: boolean) => {

    const argumentsList = useMemo(
        () => buildArguments(debate, streamedEvents),
        [debate, streamedEvents]
    );

    const moderatorIntro = useMemo(
        () => getModeratorIntro(streamedEvents),
        [streamedEvents]
    );

    const [state, send] = useMachine(debateMachine, {
        input: {
            debate,
            argumentsList,
            isDebateFinished: isFinished,
        },
    });

    useEffect(() => {
        send({ type: "SYNC_ARGUMENTS", argumentsList });
    }, [argumentsList, send]);

    useEffect(() => {
        if (state.value !== "intro") return;
        if (state.context.roundIndex >= 0) return;
        if (argumentsList.length === 0) return;
        if (moderatorIntro && moderatorIntro.trim().length > 0) return;
        send({ type: "START" });
    }, [argumentsList.length, moderatorIntro, send, state.context.roundIndex, state.value]);

    const [selectedCard, setSelectedCard] = useState<PlayedCard | null>(null);

    const currentArgument = useMemo(
        () => {
            const index = state.context.roundIndex;
            if (index < 0) return null;
            return state.context.argumentsList[index] ?? null;
        },
        [state.context.roundIndex, state.context.argumentsList]
    );

    const activeSide = currentArgument?.debaterId ?? null;

    const activeCardId = useMemo(
        () => {
            if (!currentArgument || !activeSide) return null;
            const cards = activeSide === "left" ? state.context.leftCards : state.context.rightCards;
            return cards[cards.length - 1]?.id ?? null;
        },
        [currentArgument, activeSide, state.context.leftCards, state.context.rightCards]
    );

    const scores = useMemo(
        () => ({
            left: state.context.leftCards.length,
            right: state.context.rightCards.length,
        }),
        [state.context.leftCards.length, state.context.rightCards.length]
    );

    return {
        phase: state.value,
        streamedModeratorIntro: moderatorIntro,
        send,
        roundIndex: state.context.roundIndex,
        leftCards: state.context.leftCards,
        rightCards: state.context.rightCards,
        confidence: state.context.confidence,
        scores,
        activeSide,
        activeCardId,
        currentArgument,
        revealedJudges: state.context.revealedJudges,
        selectedCard,

        setSelectedCard,
        start: () => send({ type: "START" }),
        nextRound: () => send({ type: "START" }),
        completeArgument: () => send({ type: "COMPLETE_ARGUMENT" }),
        conclude: () => send({ type: "CONCLUDE" }),
    };
}


