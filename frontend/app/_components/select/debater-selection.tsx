'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import DebaterCard from './debater-card';
import { DEBATERS_AVAILABLE } from '@/constants/debater-constant';
import { DebaterProfile } from '@/types/debate-selection';

type Props = {
    selectionStep: 'debater1' | 'debater2';
    selectedDebater: DebaterProfile | null;
    onDebaterSelection: (d: DebaterProfile) => void;
};

const DebaterSelection = ({ selectionStep, selectedDebater, onDebaterSelection }: Props) => {
    const available = useMemo(() => {
        return selectionStep === 'debater2'
            ? DEBATERS_AVAILABLE.filter(debater => debater.id !== selectedDebater?.id)
            : DEBATERS_AVAILABLE;
    }, [selectionStep, selectedDebater]);

    const isFirst = selectionStep === 'debater1';

    const title = `Select ${isFirst ? 'First' : 'Second'} Debater`;
    const subtitle = isFirst
        ? 'Choose the champion for the left podium'
        : 'Choose the challenger for the right podium';

    return (
        <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            layout
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground display-text">
                    {title}
                </h2>
                <p className="text-muted-foreground mt-2">{subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {available.map((debater, index) => (
                    <motion.div
                        key={debater.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        layout
                    >
                        <DebaterCard selectionStep={selectionStep} debater={debater} onSelectDebater={onDebaterSelection} />
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}

export default DebaterSelection;
