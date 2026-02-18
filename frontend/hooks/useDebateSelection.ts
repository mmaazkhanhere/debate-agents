import { useCallback } from "react";
import { useDebateState } from "./useDebateSelectionState";
import { useDebateNavigation } from "./useDebateSelectionNavigation";
import type { DebateConfig } from "@/types/debate-selection";

export const useDebateSelection = () => {
    const state = useDebateState();
    const { startDebate } = useDebateNavigation();

    const { isComplete, firstDebater, secondDebater, selectedTopic } = state;

    const start = useCallback(() => {
        if (!isComplete || !firstDebater || !secondDebater || !selectedTopic) return;

        const config: DebateConfig = {
            debater1: firstDebater,
            debater2: secondDebater,
            topic: {
                ...selectedTopic,
                title: selectedTopic.title.trim(),
            },
        };

        startDebate(config);
    }, [isComplete, firstDebater, secondDebater, selectedTopic, startDebate]);

    return {
        ...state,
        startDebate: start,
    };
};
