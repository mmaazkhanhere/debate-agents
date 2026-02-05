import { createMachine } from "xstate";
import { PHASE_DELAYS } from "../constants";
import { createInitialContext } from "./debate.context";
import * as actions from "./debate.actions";
import * as guards from "./debate.guards";
import { DebateMachineContext, DebateMachineEvent, DebateMachineInput } from "./debate.machine.types";

export const debateMachine = createMachine({
    id: "debate",
    types: {} as {
        context: DebateMachineContext;
        events: DebateMachineEvent;
        input: DebateMachineInput;
    },

    initial: "intro",
    context: ({ input }) => createInitialContext(input),
    on: {
        SYNC_ARGUMENTS: {
            actions: actions.syncArguments,
        },
    },

    states: {
        intro: {
            on: {
                START: {
                    target: "drawing",
                    actions: actions.nextRound,
                },
            },
        },

        drawing: {
            after: {
                [PHASE_DELAYS.drawToPlayMs]: "playing",
            },
        },

        playing: {
            entry: actions.playCard,
            after: {
                [PHASE_DELAYS.playToSpeakMs]: "speaking",
            },
        },

        speaking: {
            on: {
                COMPLETE_ARGUMENT: [
                    {
                        guard: guards.isLastRoundAndFinished,
                        target: "moderatorConclusion",
                        actions: actions.applyConfidence,
                    },
                    {
                        target: "drawing",
                        actions: [actions.applyConfidence, actions.nextRound],
                    },
                ],
            },
        },

        moderatorConclusion: {
            on: {
                CONCLUDE: "judging",
            },
        },

        judging: {
            after: {
                [PHASE_DELAYS.verdictDelayMs]: "winnerAnnouncement",
            },
        },

        winnerAnnouncement: {
            on: {
                CONCLUDE: "complete",
            },
        },

        complete: { type: "final" }

    },
});
