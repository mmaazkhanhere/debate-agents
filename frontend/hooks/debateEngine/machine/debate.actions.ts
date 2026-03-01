import { assign } from "xstate";
import { createPlayedCard, addCardIfMissing } from "../cards";
import { DebateMachineContext, DebateMachineEvent } from "./debate.machine.types";

const assignDebate = assign<DebateMachineContext, DebateMachineEvent, any, any, any>;

export const nextRound = assignDebate({
    roundIndex: ({ context }: { context: DebateMachineContext }) => context.roundIndex + 1,
});

export const applyConfidence = assignDebate({
    confidence: ({ context }: { context: DebateMachineContext }) => {
        const arg = context.argumentsList[context.roundIndex];
        if (!arg?.debaterId) return context.confidence;

        return {
            ...context.confidence,
            [arg.debaterId]: arg.confidence ?? context.confidence[arg.debaterId],
        };
    },
});

export const playCard = assignDebate({
    leftCards: ({ context }: { context: DebateMachineContext }) => {
        const arg = context.argumentsList[context.roundIndex];
        if (!arg?.debaterId || arg.debaterId !== "left") return context.leftCards;

        const card = createPlayedCard(
            arg as typeof arg & { debaterId: "left" },
            context.debate!,
            context.roundIndex,
            context.confidence
        );
        return addCardIfMissing(context.leftCards, card);
    },

    rightCards: ({ context }: { context: DebateMachineContext }) => {
        const arg = context.argumentsList[context.roundIndex];
        if (!arg?.debaterId || arg.debaterId !== "right") return context.rightCards;

        const card = createPlayedCard(
            arg as typeof arg & { debaterId: "right" },
            context.debate!,
            context.roundIndex,
            context.confidence
        );
        return addCardIfMissing(context.rightCards, card);
    },
});

export const syncArguments = assignDebate({
    argumentsList: ({ event, context }: { event: DebateMachineEvent; context: DebateMachineContext }) => {
        if (event.type !== "SYNC_ARGUMENTS") return context.argumentsList;
        return event.argumentsList;
    },
    leftCards: ({ event, context }) => {
        if (event.type !== "SYNC_ARGUMENTS") return context.leftCards;
        if (!context.debate) return context.leftCards;
        if (context.roundIndex < 0) return context.leftCards;

        const limit = Math.min(context.roundIndex, event.argumentsList.length - 1);
        const next: ReturnType<typeof createPlayedCard>[] = [];

        for (let i = 0; i <= limit; i += 1) {
            const arg = event.argumentsList[i];
            if (!arg?.debaterId || arg.debaterId !== "left") continue;
            next.push(
                createPlayedCard(arg as typeof arg & { debaterId: "left" }, context.debate, i, context.confidence)
            );
        }

        return next.length > 0 ? next : context.leftCards;
    },
    rightCards: ({ event, context }) => {
        if (event.type !== "SYNC_ARGUMENTS") return context.rightCards;
        if (!context.debate) return context.rightCards;
        if (context.roundIndex < 0) return context.rightCards;

        const limit = Math.min(context.roundIndex, event.argumentsList.length - 1);
        const next: ReturnType<typeof createPlayedCard>[] = [];

        for (let i = 0; i <= limit; i += 1) {
            const arg = event.argumentsList[i];
            if (!arg?.debaterId || arg.debaterId !== "right") continue;
            next.push(
                createPlayedCard(arg as typeof arg & { debaterId: "right" }, context.debate, i, context.confidence)
            );
        }

        return next.length > 0 ? next : context.rightCards;
    },
});

export const syncFinished = assignDebate({
    isDebateFinished: ({ event, context }) => {
        if (event.type !== "SYNC_FINISHED") return context.isDebateFinished;
        return event.isDebateFinished;
    },
});

