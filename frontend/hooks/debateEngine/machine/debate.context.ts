import { DEFAULT_CONFIDENCE } from "../constants";
import { DebateMachineContext, DebateMachineInput } from "./debate.machine.types";

export const createInitialContext = (input?: DebateMachineInput): DebateMachineContext => ({
    debate: input?.debate ?? null,
    argumentsList: input?.argumentsList ?? [],
    roundIndex: -1,
    leftCards: [],
    rightCards: [],
    confidence: { left: DEFAULT_CONFIDENCE, right: DEFAULT_CONFIDENCE },
    revealedJudges: 0,
    isDebateFinished: input?.isDebateFinished ?? false,
});
