// app/debate/select/hooks/useDebateSelection.ts
'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DebateConfig, DebaterOption, SelectedTopic, Step } from '@/types/type_d';
export function useDebateSelection() {
    const router = useRouter();

    const [step, setStep] = useState<Step>('debater1');
    const [debater1, setDebater1] = useState<DebaterOption | null>(null);
    const [debater2, setDebater2] = useState<DebaterOption | null>(null);
    const [topic, setTopic] = useState<SelectedTopic | null>(null);

    const canStart = useMemo(
        () => !!debater1 && !!debater2 && !!topic && topic.title.trim().length >= 8,
        [debater1, debater2, topic]
    );

    const selectDebater = useCallback((debater: DebaterOption) => {
        setStep(curr => {
            if (curr === 'debater1') {
                setDebater1(debater);
                // reset downstream when changing earlier selections
                setDebater2(null);
                setTopic(null);
                return 'debater2';
            }
            setDebater2(debater);
            setTopic(null);
            return 'topic';
        });
    }, []);

    const selectTopic = useCallback((t: SelectedTopic) => {
        setTopic(t);
    }, []);

    const startDebate = useCallback(() => {
        if (!debater1 || !debater2 || !topic) return;
        if (topic.title.trim().length < 8) return;

        const config: DebateConfig = {
            debater1,
            debater2,
            topic: { ...topic, title: topic.title.trim() },
        };

        sessionStorage.setItem('debate_config', JSON.stringify(config));
        router.push('/debate');
    }, [debater1, debater2, topic, router]);

    return {
        step,
        setStep,
        debater1,
        debater2,
        topic,
        canStart,
        selectDebater,
        selectTopic,
        startDebate,
    };
}
