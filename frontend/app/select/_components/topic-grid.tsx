// app/debate/select/components/TopicGrid.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { DebaterOption, SelectedTopic, topicOptions } from '@/types/type_d';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getDifficultyColor } from '@/lib/utils';
import { Trophy } from 'lucide-react';

type Props = {
    debater1: DebaterOption;
    debater2: DebaterOption;
    selected: SelectedTopic | null;
    onSelect: (t: SelectedTopic) => void;
};



const TopicGrid = ({ debater1, debater2, selected, onSelect }: Props) => {
    const [customTitle, setCustomTitle] = useState('');
    const [customDifficulty, setCustomDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

    const customTopic: SelectedTopic = useMemo(
        () => ({
            kind: 'custom',
            id: 'custom',
            title: customTitle,
            category: 'Custom',
            difficulty: customDifficulty,
            icon: '✍️',
        }),
        [customTitle, customDifficulty]
    );

    const selectCustom = useCallback(() => {
        // allow selecting even if short; Start button will enforce min length
        onSelect(customTopic);
    }, [customTopic, onSelect]);

    const isSelected = (id: string) => selected?.id === id;

    return (
        <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground display-text">
                    Choose The Battlefield
                </h2>
                <p className="text-muted-foreground mt-2">Select a topic for the debate</p>

                <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="flex items-center gap-2 bg-debater-left/10 border border-debater-left/30 rounded-lg px-4 py-2">
                        <span className="text-2xl">{debater1.avatar}</span>
                        <span className="text-sm font-medium text-debater-left-glow">{debater1.name}</span>
                    </div>
                    <div className="text-2xl">⚔️</div>
                    <div className="flex items-center gap-2 bg-debater-right/10 border border-debater-right/30 rounded-lg px-4 py-2">
                        <span className="text-2xl">{debater2.avatar}</span>
                        <span className="text-sm font-medium text-debater-right-glow">{debater2.name}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {/* Custom Topic Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    onClick={selectCustom}
                    className={`bg-card border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02] ${isSelected('custom')
                        ? 'border-primary shadow-[0_0_20px_hsl(43,96%,56%,0.3)]'
                        : 'border-border/50 hover:border-primary/50'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">✍️</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                    Custom
                                </Badge>
                                <Badge className={`text-xs ${getDifficultyColor(customDifficulty)}`}>
                                    {customDifficulty}
                                </Badge>
                            </div>

                            <h3 className="text-lg font-bold text-foreground">Write your own topic</h3>

                            <div className="mt-3 space-y-3">
                                <Input
                                    value={customTitle}
                                    onChange={e => setCustomTitle(e.target.value)}
                                    placeholder="e.g., Should AI tutors replace traditional homework?"
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                    onClick={e => e.stopPropagation()}
                                />

                                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                    {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                                        <Button
                                            key={d}
                                            type="button"
                                            size="sm"
                                            variant={customDifficulty === d ? 'default' : 'secondary'}
                                            onClick={() => setCustomDifficulty(d)}
                                        >
                                            {d}
                                        </Button>
                                    ))}
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Tip: Use at least <span className="font-medium">8 characters</span> for the Start button to enable.
                                </p>
                            </div>
                        </div>

                        {isSelected('custom') && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <Trophy className="w-3 h-3 text-primary-foreground" />
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Preset Topics */}
                {topicOptions.map((t, i) => {
                    const selectedThis = isSelected(t.id);
                    return (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (i + 1) * 0.06 }}
                            onClick={() => onSelect({ ...t, kind: 'preset' })}
                            className={`bg-card border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02] ${selectedThis
                                ? 'border-primary shadow-[0_0_20px_hsl(43,96%,56%,0.3)]'
                                : 'border-border/50 hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{t.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs">
                                            {t.category}
                                        </Badge>
                                        <Badge className={`text-xs ${getDifficultyColor(t.difficulty)}`}>
                                            {t.difficulty}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">{t.title}</h3>
                                </div>

                                {selectedThis && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                        <Trophy className="w-3 h-3 text-primary-foreground" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.section>
    );
}

export default TopicGrid;