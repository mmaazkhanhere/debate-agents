'use client';

import { DebaterOption, SelectedTopic, Step } from '@/types/type_d';
import { motion } from 'framer-motion';

type Props = {
    step: Step;
    debater1: DebaterOption | null;
    debater2: DebaterOption | null;
    topic: SelectedTopic | null;
    onStepChange: (step: Step) => void;
};

const steps: { id: Step; label: string }[] = [
    { id: 'debater1', label: 'Choose first debater' },
    { id: 'debater2', label: 'Choose second debater' },
    { id: 'topic', label: 'Select topic' },
];

const StepIndicator = ({
    step,
    debater1,
    debater2,
    topic,
    onStepChange,
}: Props) => {
    const isDone = (s: Step) =>
        (s === 'debater1' && !!debater1) ||
        (s === 'debater2' && !!debater2) ||
        (s === 'topic' && !!topic);

    const canNavigateTo = (s: Step) => s === step || isDone(s);

    return (
        <nav
            aria-label="Debate setup steps"
            className="flex items-center justify-center gap-2 md:gap-4 mb-8"
        >
            {steps.map((s, i) => {
                const active = step === s.id;
                const done = isDone(s.id);

                return (
                    <div key={s.id} className="flex items-center">
                        <motion.button
                            type="button"
                            aria-label={s.label}
                            aria-current={active ? 'step' : undefined}
                            disabled={!canNavigateTo(s.id)}
                            onClick={() => canNavigateTo(s.id) && onStepChange(s.id)}
                            whileHover={canNavigateTo(s.id) ? { scale: 1.08 } : undefined}
                            whileTap={canNavigateTo(s.id) ? { scale: 0.95 } : undefined}
                            animate={{ scale: active ? 1.1 : 1 }}
                            className={`
                                w-8 h-8 md:w-10 md:h-10 rounded-full
                                flex items-center justify-center
                                text-sm font-bold
                                transition-all
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                                ${active
                                    ? 'bg-primary text-primary-foreground'
                                    : done
                                        ? 'bg-crowd-positive text-white ring-2 ring-crowd-positive/60 shadow-md'
                                        : 'bg-secondary text-muted-foreground'
                                }
                                ${canNavigateTo(s.id) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                            `}
                        >
                            {i + 1}
                        </motion.button>

                        {i < steps.length - 1 && (
                            <div
                                aria-hidden
                                className={`
                                w-8 md:w-16 h-0.5 mx-2 transition-colors
                                ${(i === 0 && debater1) || (i === 1 && debater2)
                                        ? 'bg-primary'
                                        : 'bg-secondary'
                                    }
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
