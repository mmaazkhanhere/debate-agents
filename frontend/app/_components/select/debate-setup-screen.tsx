"use client";

import { AnimatePresence } from "framer-motion";

import Header from "./debater-header";
import StepIndicator from "./step-indicator";
import TopicSelection from "./topic-selection";
import StartDebateButton from "./start-debate-button";

import { useDebateSelection } from "@/hooks/useDebateSelection";
import DebaterSelection from "./debater-selection";

const DebateSetupScreen = () => {
    const selection = useDebateSelection();

    const currentSelectionStep = selection.currentSelectionStep;
    const isDebaterStep = currentSelectionStep === "debater1" || currentSelectionStep === "debater2";

    const onSelectDebater =
        currentSelectionStep === "debater1" ? selection.chooseFirstDebater : selection.chooseSecondDebater;

    return (
        <div className="min-h-screen bg-background overflow-auto">
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-6">
                <StepIndicator
                    currentStep={currentSelectionStep}
                    onCurrentStepChange={selection.setCurrentSelectionStep}
                    debater1={selection.firstDebater}
                    debater2={selection.secondDebater}
                    topic={selection.selectedTopic}
                />

                <AnimatePresence mode="wait">
                    {isDebaterStep && (
                        <DebaterSelection
                            key={currentSelectionStep}
                            selectionStep={currentSelectionStep}
                            selectedDebater={selection.firstDebater}
                            onDebaterSelection={onSelectDebater}
                        />
                    )}

                    {currentSelectionStep === "topic" && selection.firstDebater && selection.secondDebater && (
                        <div key="topic">
                            <TopicSelection
                                debater1={selection.firstDebater}
                                debater2={selection.secondDebater}
                                selectedTopic={selection.selectedTopic}
                                onSelectTopic={selection.chooseTopic}
                            />
                            <StartDebateButton
                                canStart={selection.isComplete}
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

export default DebateSetupScreen;
