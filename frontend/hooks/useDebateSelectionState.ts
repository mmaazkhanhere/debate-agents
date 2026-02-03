import { useCallback, useMemo, useState } from 'react';
import type { DebaterOption, SelectedTopic, Step } from '@/app/select/_types/type';

export function useDebateState() {
    const [currentSelectionStep, setCurrentSelectionStep] = useState<Step>('debater1');
    const [firstDebater, setFirstDebater] = useState<DebaterOption | null>(null);
    const [secondDebater, setSecondDebater] = useState<DebaterOption | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);

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
    const chooseFirstDebater = useCallback((debater: DebaterOption) => {
        setFirstDebater(debater);
        setSecondDebater(null);
        setSelectedTopic(null);
        setCurrentSelectionStep('debater2');
    }, []);

    const chooseSecondDebater = useCallback((debater: DebaterOption) => {
        if (!firstDebater) return;

        setSecondDebater(debater);
        setSelectedTopic(null);
        setCurrentSelectionStep('topic');
    }, [firstDebater]);

    const chooseTopic = useCallback((topic: SelectedTopic) => {
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
