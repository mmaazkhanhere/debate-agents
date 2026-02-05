import { assign } from "xstate";
import { createPlayedCard, addCardIfMissing } from "../cards";
import { DebateMachineContext, DebateMachineEvent } from "./debate.machine.types";

export const nextRound = assign<DebateMachineContext, DebateMachineEvent, any, any, any>({
    roundIndex: ({ context }: { context: DebateMachineContext }) => context.roundIndex + 1,
});

export const applyConfidence = assign<DebateMachineContext, DebateMachineEvent, any, any, any>({
    confidence: ({ context }: { context: DebateMachineContext }) => {
        const arg = context.argumentsList[context.roundIndex];
        if (!arg) return context.confidence;

        return {
            ...context.confidence,
            [arg.debaterId]: arg.confidence ?? context.confidence[arg.debaterId],
        };
    },
});

export const playCard = assign<DebateMachineContext, DebateMachineEvent, any, any, any>({
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

export const syncArguments = assign<DebateMachineContext, DebateMachineEvent, any, any, any>({
    argumentsList: ({ event, context }: { event: DebateMachineEvent; context: DebateMachineContext }) => {
        if (event.type !== "SYNC_ARGUMENTS") return context.argumentsList;
        return event.argumentsList;
    },
});

export const syncFinished = assign<DebateMachineContext, DebateMachineEvent, any, any, any>({
    isDebateFinished: ({ event, context }) => {
        if (event.type !== "SYNC_FINISHED") return context.isDebateFinished;
        return event.isDebateFinished;
    },
});

