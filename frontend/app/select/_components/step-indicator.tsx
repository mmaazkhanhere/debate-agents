'use client';

import { motion } from 'framer-motion';
import { STEPS } from '@/constants/select-constants';
import { DebaterProfile, DebateSetupStep, DebateTopicSelection } from '../_types/type';

type Props = {
    currentStep: DebateSetupStep;
    debater1: DebaterProfile | null;
    debater2: DebaterProfile | null;
    topic: DebateTopicSelection | null;
    onCurrentStepChange: (step: DebateSetupStep) => void;
};

const StepIndicator = ({
    currentStep,
    debater1,
    debater2,
    topic,
    onCurrentStepChange,
}: Props) => {

    const stepStatus: Record<DebateSetupStep, boolean> = {
        debater1: !!debater1,
        debater2: !!debater2,
        topic: !!topic,
    };

    const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

    const canGoToStep = (targetStep: DebateSetupStep) => {
        const targetStepIndex = STEPS.findIndex((step) => step.id === targetStep);
        return targetStepIndex <= currentStepIndex || stepStatus[targetStep];
    };

    const getStepButtonClasses = (
        isActive: boolean,
        isComplete: boolean,
        isClickable: boolean
    ) => `
        w-8 h-8 md:w-10 md:h-10 rounded-full
        flex items-center justify-center
        text-sm font-bold
        transition-all
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
        ${isActive
            ? 'bg-primary text-primary-foreground'
            : isComplete
                ? 'bg-crowd-positive text-white ring-2 ring-crowd-positive/60 shadow-md'
                : 'bg-secondary text-muted-foreground'
        }
        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
    `;

    return (
        <nav
            aria-label="Debate setup steps"
            className="flex items-center justify-center gap-2 md:gap-4 mb-8"
        >
            {STEPS.map((stepItem, index) => {
                const isActive = currentStep === stepItem.id;
                const isComplete = stepStatus[stepItem.id];
                const isClickable = canGoToStep(stepItem.id);

                return (
                    <div key={stepItem.id} className="flex items-center">
                        <motion.button
                            type="button"
                            aria-current={isActive ? 'step' : undefined}
                            aria-label={`${stepItem.label} ${isComplete ? 'completed' : ''}`}
                            disabled={!isClickable}
                            onClick={() => isClickable && onCurrentStepChange(stepItem.id)}
                            whileHover={isClickable ? { scale: 1.08 } : undefined}
                            whileTap={isClickable ? { scale: 0.95 } : undefined}
                            animate={{ scale: isActive ? 1.1 : 1 }}
                            className={getStepButtonClasses(isActive, isComplete, isClickable)}
                        >
                            <span className="sr-only">{stepItem.label}</span>
                            {index + 1}
                        </motion.button>

                        {index < STEPS.length - 1 && (
                            <div
                                aria-hidden
                                className={`
                                    w-8 md:w-16 h-0.5 mx-2 transition-colors
                                    ${stepStatus[STEPS[index].id] ? 'bg-primary' : 'bg-secondary'}
                                `}
                            />
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default StepIndicator;
