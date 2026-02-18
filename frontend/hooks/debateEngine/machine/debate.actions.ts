import { assign } from "xstate";
import { createPlayedCard, addCardIfMissing } from "../cards";
import { DebateMachineContext, DebateMachineEvent } from "./debate.machine.types";

export const nextRound = assign<DebateMachineContext, DebateMachineEvent>({
    roundIndex: ({ context }: { context: DebateMachineContext }) => context.roundIndex + 1,
});

export const applyConfidence = assign<DebateMachineContext, DebateMachineEvent>({
    confidence: ({ context }: { context: DebateMachineContext }) => {
        const arg = context.argumentsList[context.roundIndex];
        if (!arg) return context.confidence;

        return {
            ...context.confidence,
            [arg.debaterId]: arg.confidence ?? context.confidence[arg.debaterId],
        };
    },
});

export const playCard = assign<DebateMachineContext, DebateMachineEvent>({
    leftCards: ({ context }: { context: DebateMachineContext }) => {
        const arg = context.argumentsList[context.roundIndex];
        if (!arg || arg.debaterId !== "left") return context.leftCards;

        const card = createPlayedCard(arg, context.debate!, context.roundIndex, context.confidence);
        return addCardIfMissing(context.leftCards, card);
    },

    rightCards: ({ context }: { context: DebateMachineContext }) => {
        const arg = context.argumentsList[context.roundIndex];
        if (!arg || arg.debaterId !== "right") return context.rightCards;

        const card = createPlayedCard(arg, context.debate!, context.roundIndex, context.confidence);
        return addCardIfMissing(context.rightCards, card);
    },
});

export const syncArguments = assign<DebateMachineContext, DebateMachineEvent>({
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
            if (!arg || arg.debaterId !== "left") continue;
            next.push(createPlayedCard(arg, context.debate, i, context.confidence));
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
            if (!arg || arg.debaterId !== "right") continue;
            next.push(createPlayedCard(arg, context.debate, i, context.confidence));
        }

        return next.length > 0 ? next : context.rightCards;
    },
});

export const syncFinished = assign<DebateMachineContext, DebateMachineEvent>({
    isDebateFinished: ({ event, context }) => {
        if (event.type !== "SYNC_FINISHED") return context.isDebateFinished;
        return event.isDebateFinished;
    },
});

