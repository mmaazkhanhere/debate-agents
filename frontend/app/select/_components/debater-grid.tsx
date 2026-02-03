
'use client';

import { motion } from 'framer-motion';
import DebaterCard from './debater-card';
import { DebaterOption } from '../_types/type'
import { DEBATERS_AVAILABLE } from '@/constants/select-constants';
type Props = {
    step: 'debater1' | 'debater2';
    debater1: DebaterOption | null;
    onSelect: (d: DebaterOption) => void;
};

export default function DebaterGrid({ step, debater1, onSelect }: Props) {
    const available =
        step === 'debater2'
            ? DEBATERS_AVAILABLE.filter(d => d.id !== debater1?.id)
            : DEBATERS_AVAILABLE;

    return (
        <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground display-text">
                    Select {step === 'debater1' ? 'First' : 'Second'} Debater
                </h2>
                <p className="text-muted-foreground mt-2">
                    {step === 'debater1'
                        ? 'Choose the champion for the left podium'
                        : 'Choose the challenger for the right podium'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {available.map((debater, i) => (
                    <motion.div
                        key={debater.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                    >
                        <DebaterCard step={step} debater={debater} onSelect={onSelect} />
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
