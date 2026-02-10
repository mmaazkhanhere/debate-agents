import { useMachine } from "@xstate/react";
import { debateMachine } from "./debateEngine/machine/debate.machine";
import { DebateData } from "@/types/debate";
import { DebateEvent } from "@/types/debate-event";
import { useEffect, useMemo, useState } from "react";
import { buildArguments, getPresenterConclusion, getPresenterIntro } from "./debateEngine/stream";
import { PlayedCard } from "./debateEngine/types";
import { PHASE_DELAYS } from "./debateEngine/constants";

export const useDebateEngine = (debate: DebateData, streamedEvents: DebateEvent[], isFinished: boolean) => {

    const argumentsList = useMemo(
        () => buildArguments(debate, streamedEvents),
        [debate, streamedEvents]
    );

    const expectedArgumentCount = useMemo(
        () => Math.max(0, (debate.totalRounds ?? 0) * 2),
        [debate.totalRounds]
    );

    const effectiveIsFinished = useMemo(
        () => isFinished || (expectedArgumentCount > 0 && argumentsList.length >= expectedArgumentCount),
        [argumentsList.length, expectedArgumentCount, isFinished]
    );

    const presenterIntro = useMemo(
        () => getPresenterIntro(streamedEvents),
        [streamedEvents]
    );

    const presenterConclusion = useMemo(
        () => getPresenterConclusion(streamedEvents),
        [streamedEvents]
    );

    const [state, send] = useMachine(debateMachine, {
        input: {
            debate,
            argumentsList,
            isDebateFinished: effectiveIsFinished,
        },
    });

    useEffect(() => {
        console.log(
            "[DEBATE MACHINE]",
            "phase =", state.value,
            "roundIndex =", state.context.roundIndex,
            "isDebateFinished =", state.context.isDebateFinished
        );
    }, [state.value, state.context.roundIndex, state.context.isDebateFinished]);


    useEffect(() => {
        send({ type: "SYNC_ARGUMENTS", argumentsList });
    }, [argumentsList, send]);

    useEffect(() => {
        send({ type: "SYNC_FINISHED", isDebateFinished: effectiveIsFinished });
    }, [effectiveIsFinished, send]);



    useEffect(() => {
        if (state.value !== "intro") return;
        if (state.context.roundIndex >= 0) return;
        if (argumentsList.length === 0) return;
        if (presenterIntro && presenterIntro.trim().length > 0) return;
        send({ type: "START" });
    }, [argumentsList.length, presenterIntro, send, state.context.roundIndex, state.value]);

    const [selectedCard, setSelectedCard] = useState<PlayedCard | null>(null);
    const [revealedJudges, setRevealedJudges] = useState(0);

    const judgeCount = debate.judges?.length ?? 0;
    const isVerdictPhase = state.value === "judging" || state.value === "winnerAnnouncement";

    useEffect(() => {
        if (!isVerdictPhase) {
            setRevealedJudges(0);
            return;
        }
        if (judgeCount === 0) {
            setRevealedJudges(0);
            return;
        }

        let current = 0;
        setRevealedJudges(0);

        const interval = window.setInterval(() => {
            current += 1;
            setRevealedJudges(current);
            if (current >= judgeCount) {
                window.clearInterval(interval);
            }
        }, PHASE_DELAYS.judgeRevealMs);

        return () => {
            window.clearInterval(interval);
        };
    }, [isVerdictPhase, judgeCount]);

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
        presenterIntroResponse: presenterIntro,
        presenterConclusionResponse: presenterConclusion,
        send,
        roundIndex: state.context.roundIndex,
        leftCards: state.context.leftCards,
        rightCards: state.context.rightCards,
        confidence: state.context.confidence,
        scores,
        activeSide,
        activeCardId,
        currentArgument,
        revealedJudges,
        selectedCard,

        setSelectedCard,
        start: () => send({ type: "START" }),
        nextRound: () => send({ type: "START" }),
        completeArgument: () => send({ type: "COMPLETE_ARGUMENT" }),
        sendConclude: () => send({ type: "CONCLUDE" }),

    };
}
