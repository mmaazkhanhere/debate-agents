import { useCallback, useMemo, useState } from "react";
import type { DebaterProfile, DebateTopicSelection, DebateSetupStep } from "@/types/debate-selection";

export function useDebateState() {
    const [currentSelectionStep, setCurrentSelectionStep] = useState<DebateSetupStep>("debater1");
    const [firstDebater, setFirstDebater] = useState<DebaterProfile | null>(null);
    const [secondDebater, setSecondDebater] = useState<DebaterProfile | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<DebateTopicSelection | null>(null);

    /**
     * Derived state
     */
    const hasValidTopic = useMemo(() => {
        return !!selectedTopic && selectedTopic.title.trim().length >= 8;
    }, [selectedTopic]);

    const isComplete = useMemo(() => {
        return !!firstDebater && !!secondDebater && hasValidTopic;
    }, [firstDebater, secondDebater, hasValidTopic]);

    /**
     * Transitions
     */
    const chooseFirstDebater = useCallback((debater: DebaterProfile) => {
        setFirstDebater(debater);
        setSecondDebater(null);
        setSelectedTopic(null);
        setCurrentSelectionStep("debater2");
    }, []);

    const chooseSecondDebater = useCallback((debater: DebaterProfile) => {
        if (!firstDebater) return;

        setSecondDebater(debater);
        setSelectedTopic(null);
        setCurrentSelectionStep("topic");
    }, [firstDebater]);

    const chooseTopic = useCallback((topic: DebateTopicSelection) => {
        if (!firstDebater || !secondDebater) return;

        setSelectedTopic(topic);
    }, [firstDebater, secondDebater]);

    return {
        // state
        currentSelectionStep,
        firstDebater,
        secondDebater,
        selectedTopic,

        // derived
        isComplete,

        // actions
        chooseFirstDebater,
        chooseSecondDebater,
        chooseTopic,
        setCurrentSelectionStep,
    };
}
