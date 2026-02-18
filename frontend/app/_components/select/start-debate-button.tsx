'use client';

import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

import { ChevronRight } from 'lucide-react';
import { DebateTopicSelection } from '@/types/debate-selection';

type Props = {
    canStart: boolean;
    onStart: () => void;
    topic: DebateTopicSelection | null;
};

const StartDebateButton = ({ canStart, onStart, topic }: Props) => {
    const isCustom = topic?.kind === 'custom';
    const titleLength = topic?.title.trim().length ?? 0;

    const isTooShort = isCustom && titleLength > 0 && titleLength < 8;

    return (
        <motion.div
            className="flex flex-col items-center mt-8 gap-2 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: canStart ? 1 : 0.5 }}
        >
            <Button
                onClick={onStart}
                disabled={!canStart}
                className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-bold py-6 cursor-pointer"
                aria-disabled={!canStart}
            >
                Start The Debate
                <ChevronRight className="w-5 h-5" />
            </Button>

            {isTooShort && (
                <p className="text-xs text-muted-foreground">
                    Custom topic is a bit short — use at least{' '}
                    <span className="font-medium">8 characters</span>.
                </p>
            )}
        </motion.div>
    );
};

export default StartDebateButton;
