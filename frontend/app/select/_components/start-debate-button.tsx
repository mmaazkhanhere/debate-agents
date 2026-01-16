// app/debate/select/components/StartDebateButton.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { SelectedTopic } from '@/types/type_d';


type Props = {
    enabled: boolean;
    onStart: () => void;
    topic: SelectedTopic | null;
};

const StartDebateButton = ({ enabled, onStart, topic }: Props) => {
    const tooShort = !!topic && topic.title.trim().length > 0 && topic.title.trim().length < 8;

    return (
        <motion.div
            className="flex flex-col items-center mt-8 gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: enabled ? 1 : 0.6 }}
        >
            <Button
                size="lg"
                onClick={onStart}
                disabled={!enabled}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6"
            >
                Start The Debate
                <ChevronRight className="ml-2 w-5 h-5" />
            </Button>

            {tooShort && (
                <p className="text-xs text-muted-foreground">
                    Custom topic is a bit short — use at least <span className="font-medium">8 characters</span>.
                </p>
            )}
        </motion.div>
    );
}

export default StartDebateButton;