import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';

import { Trophy } from 'lucide-react';


type Topic = {
    id: string;
    title: string;
    icon: string;
};

type TopicCardProps = {
    topic: Topic;
    isSelected: boolean;
    delay: number;
    onTopicSelect: () => void;
};

const TopicCard = ({ topic, isSelected, delay, onTopicSelect }: TopicCardProps) => {
    return (
        <motion.div
            aria-pressed={isSelected}
            onClick={onTopicSelect}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`
                bg-secondary/50 hover:bg-secondary/70 border rounded-xl p-5 text-left
                transition-all hover:scale-[1.02] cursor-pointer
                ${isSelected
                    ? 'border-primary shadow-[0_0_20px_hsl(43,96%,56%,0.3)]'
                    : 'border-border/50 hover:border-primary/50'
                }
            `}
        >
            <div className="flex items-start gap-4">
                <span aria-hidden className="text-4xl">{topic.icon}</span>

                <div className="flex-1">

                    <h3 className="text-lg font-bold text-foreground">
                        {topic.title}
                    </h3>
                </div>

                {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-primary-foreground" />
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default TopicCard