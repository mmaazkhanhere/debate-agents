// app/debate/select/components/StepIndicator.tsx
'use client';

import { DebaterOption, SelectedTopic, Step } from '@/types/type_d';
import { motion } from 'framer-motion';


type Props = {
    step: Step;
    debater1: DebaterOption | null;
    debater2: DebaterOption | null;
    topic: SelectedTopic | null;
};

const steps: Step[] = ['debater1', 'debater2', 'topic'];

const StepIndicator = ({ step, debater1, debater2, topic }: Props) => {
    const isDone = (s: Step) =>
        (s === 'debater1' && !!debater1) ||
        (s === 'debater2' && !!debater2) ||
        (s === 'topic' && !!topic);

    return (
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                    <motion.div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s
                            ? 'bg-primary text-primary-foreground scale-110'
                            : isDone(s)
                                ? 'bg-crowd-positive text-white'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                        animate={{ scale: step === s ? 1.1 : 1 }}
                    >
                        {i + 1}
                    </motion.div>

                    {i < steps.length - 1 && (
                        <div
                            className={`w-8 md:w-16 h-0.5 mx-2 ${(i === 0 && debater1) || (i === 1 && debater2)
                                ? 'bg-crowd-positive'
                                : 'bg-secondary'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export default StepIndicator