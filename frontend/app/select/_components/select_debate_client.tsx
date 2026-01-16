// app/debate/select/SelectDebateClient.tsx
'use client';

import { useDebateSelection } from '@/hooks/useDebateSelection';
import { AnimatePresence } from 'framer-motion';
import Header from './debater-header';
import StepIndicator from './step-indicator';
import DebaterGrid from './debater-grid';
import TopicGrid from './topic-grid';
import StartDebateButton from './start-debate-button';


export default function SelectDebateClient() {
    const {
        step,
        setStep,
        debater1,
        debater2,
        topic,
        canStart,
        selectDebater,
        selectTopic,
        startDebate,
    } = useDebateSelection();

    return (
        <div className="min-h-screen bg-background overflow-auto">
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-6">
                <StepIndicator step={step} onStepChange={setStep} debater1={debater1} debater2={debater2} topic={topic} />

                <AnimatePresence mode="wait">
                    {(step === 'debater1' || step === 'debater2') && (
                        <DebaterGrid
                            key={step}
                            step={step}
                            debater1={debater1}
                            onSelect={selectDebater}
                        />
                    )}

                    {step === 'topic' && debater1 && debater2 && (
                        <div key="topic">
                            <TopicGrid
                                debater1={debater1}
                                debater2={debater2}
                                selected={topic}
                                onSelect={selectTopic}
                            />
                            <StartDebateButton enabled={canStart} onStart={startDebate} topic={topic} />
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
