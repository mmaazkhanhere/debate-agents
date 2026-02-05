import { DebateData, DebateArgument } from "@/types/debate";
import { PlayedCard, ConfidenceBySide } from "../types";

export type DebateMachineContext = {
    debate: DebateData | null;
    argumentsList: DebateArgument[];
    roundIndex: number;
    leftCards: PlayedCard[];
    rightCards: PlayedCard[];
    confidence: ConfidenceBySide;
    revealedJudges: number;
    isDebateFinished: boolean;
}

export type DebateMachineInput = {
    debate: DebateData | null;
    argumentsList: DebateArgument[];
    isDebateFinished: boolean;
}

export type DebateMachineEvent =
    | { type: "START" }
    | { type: "COMPLETE_ARGUMENT" }
    | { type: "CONCLUDE" }
    | { type: "SYNC_ARGUMENTS"; argumentsList: DebateArgument[] }
    | { type: "SYNC_FINISHED"; isDebateFinished: boolean };


