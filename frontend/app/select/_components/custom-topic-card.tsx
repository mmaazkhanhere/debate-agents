import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy } from 'lucide-react';

type CustomTopicCardProps = {
    topic: string;
    isSelected: boolean;
    onSelect: () => void;
    onTopicChange: (topic: string) => void;
};


const CustomTopicCard = ({ topic, isSelected, onSelect, onTopicChange }: CustomTopicCardProps) => {
    return (
        <motion.div
            aria-pressed={isSelected}
            onClick={onSelect}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                max-w-4xl mx-auto mb-10 w-full text-left cursor-pointer
                bg-secondary/50 border rounded-2xl p-6 transition-all hover:scale-[1.02]
                ${isSelected
                    ? 'border-primary shadow-[0_0_24px_hsl(43,96%,56%,0.35)]'
                    : 'border-border/50 hover:border-primary/50'
                }
            `}
        >
            <div className="flex items-start gap-5">
                <span aria-hidden className="text-4xl">✍️</span>

                <div className="flex-1">
                    <Badge variant="outline" className="text-xs mb-2">
                        Custom Topic
                    </Badge>

                    <h2 className="text-xl font-bold text-foreground">
                        Write your own debate topic
                    </h2>

                    <div className="mt-4 space-y-3">
                        <Input
                            value={topic}
                            onChange={(e) => onTopicChange(e.target.value)}
                            placeholder="e.g., Should AI replace homework?"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <p className="text-xs text-muted-foreground">
                            Use at least <strong>8 characters</strong>.
                        </p>
                    </div>
                </div>

                {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-primary-foreground" />
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default CustomTopicCard