"use client";

import { AnimatePresence } from "framer-motion";

import Header from "./debater-header";
import StepIndicator from "./step-indicator";
import DebaterGrid from "./debater-grid";
import TopicGrid from "./topic-grid";
import StartDebateButton from "./start-debate-button";

import { useDebateSelection } from "@/hooks/useDebateSelection";

const SelectDebateClient = () => {
    const selection = useDebateSelection();

    const step = selection.currentSelectionStep;
    const isDebaterStep = step === "debater1" || step === "debater2";

    const onSelectDebater =
        step === "debater1" ? selection.chooseFirstDebater : selection.chooseSecondDebater;

    return (
        <div className="min-h-screen bg-background overflow-auto">
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-6">
                <StepIndicator
                    step={step}
                    onStepChange={selection.setCurrentSelectionStep}
                    debater1={selection.firstDebater}
                    debater2={selection.secondDebater}
                    topic={selection.selectedTopic}
                />

                <AnimatePresence mode="wait">
                    {isDebaterStep && (
                        <DebaterGrid
                            key={step}
                            step={step}
                            debater1={selection.firstDebater}
                            onSelect={onSelectDebater}
                        />
                    )}

                    {step === "topic" && selection.firstDebater && selection.secondDebater && (
                        <div key="topic">
                            <TopicGrid
                                debater1={selection.firstDebater}
                                debater2={selection.secondDebater}
                                selected={selection.selectedTopic}
                                onSelect={selection.chooseTopic}
                            />
                            <StartDebateButton
                                enabled={selection.isComplete}
                                onStart={selection.startDebate}
                                topic={selection.selectedTopic}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default SelectDebateClient;
