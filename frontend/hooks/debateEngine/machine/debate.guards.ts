import { DebateMachineContext } from "./debate.machine.types";

export const isLastRoundAndFinished = ({ context }: { context: DebateMachineContext }) =>
    context.roundIndex >= context.argumentsList.length - 1 && context.isDebateFinished;
