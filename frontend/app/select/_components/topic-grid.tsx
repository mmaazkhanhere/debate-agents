'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { DebaterOption, SelectedTopic, topicOptions } from '@/types/type_d';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getDifficultyColor } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

type Props = {
    debater1: DebaterOption;
    debater2: DebaterOption;
    selected: SelectedTopic | null;
    onSelect: (t: SelectedTopic) => void;
};

const TopicGrid = ({ debater1, debater2, selected, onSelect }: Props) => {
    const [customTitle, setCustomTitle] = useState('');
    // const [customDifficulty, setCustomDifficulty] =
    //     useState<'Easy' | 'Medium' | 'Hard'>('Medium');

    const customTopic: SelectedTopic = useMemo(
        () => ({
            kind: 'custom',
            id: 'custom',
            title: customTitle,
            category: 'Custom',
            icon: '✍️',
        }),
        [customTitle]
    );


    const selectCustom = useCallback(() => {
        onSelect(customTopic);
    }, [customTopic, onSelect]);

    const isSelected = (id: string) => selected?.id === id;

    const handleKeySelect =
        (action: () => void) =>
            (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    action();
                }
            };

    const isStartEnabled = useMemo(() => {
        if (!selected) return false;

        if (selected.kind === 'custom') {
            return selected.title.trim().length >= 8;
        }

        return true; // preset topics
    }, [selected]);


    return (
        <motion.section
            aria-labelledby="topic-grid-heading"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
        >
            {/* Header */}
            <header className="text-center mb-10">
                <h1
                    id="topic-grid-heading"
                    className="text-3xl md:text-4xl font-bold text-foreground"
                >
                    Choose the Debate Topic
                </h1>

                <p className="text-muted-foreground mt-2">
                    Select a battlefield for this debate
                </p>

                {/* Debaters */}
                <div className="flex items-center justify-center gap-6 mt-8">
                    <div
                        className="flex items-center gap-3 bg-debater-left/10 border border-debater-left/30 rounded-xl px-5 py-3 
                    bg-secondary/50 hover:scale-105 cursor-pointer transition-all duration-300"
                    >
                        <Image
                            src={debater1.avatar}
                            alt={`Avatar of debater ${debater1.name}`}
                            width={64}
                            height={64}
                            sizes="64px"
                            className="rounded-full object-cover"
                        />
                        <span className="text-sm font-semibold text-debater-left-glow">
                            {debater1.name}
                        </span>
                    </div>

                    <span aria-hidden className="text-3xl">
                        ⚔️
                    </span>

                    <div className="flex items-center gap-3 bg-debater-right/10 border border-debater-right/30 rounded-xl px-5 py-3 bg-secondary/50 hover:scale-105 cursor-pointer transition-all duration-300">
                        <Image
                            src={debater2.avatar}
                            alt={`Avatar of debater ${debater2.name}`}
                            width={64}
                            height={64}
                            sizes="64px"
                            className="rounded-full object-cover"
                        />
                        <span className="text-sm font-semibold text-debater-right-glow">
                            {debater2.name}
                        </span>
                    </div>
                </div>
            </header>

            {/* Custom Topic (Separate, Primary) */}
            <motion.article
                role="button"
                tabIndex={0}
                aria-pressed={isSelected('custom')}
                aria-label="Create a custom debate topic"
                onKeyDown={handleKeySelect(selectCustom)}
                onClick={selectCustom}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-4xl mx-auto mb-10 bg-secondary/50 border rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] 
                    ${isSelected('custom')
                        ? 'border-primary shadow-[0_0_24px_hsl(43,96%,56%,0.35)]'
                        : 'border-border/50 hover:border-primary/50'
                    }`}
            >
                <div className="flex items-start gap-5">
                    <span aria-hidden className="text-4xl">
                        ✍️
                    </span>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                                Custom Topic
                            </Badge>
                            {/* <Badge
                                className={`text-xs ${getDifficultyColor(
                                    customDifficulty
                                )}`}
                            >
                                {customDifficulty}
                            </Badge> */}
                        </div>

                        <h2 className="text-xl font-bold text-foreground">
                            Write your own debate topic
                        </h2>

                        <div className="mt-4 space-y-3">
                            <label htmlFor="custom-topic" className="sr-only">
                                Custom debate topic
                            </label>

                            <Input
                                id="custom-topic"
                                type="text"
                                value={selected?.title ?? ''}
                                onChange={(e) =>
                                    onSelect({
                                        ...(selected ?? { type: 'custom' }),
                                        title: e.target.value,
                                        id: 'custom'
                                    })
                                }


                                placeholder="e.g., Should AI tutors replace traditional homework?"
                                onClick={e => e.stopPropagation()}
                                aria-describedby="custom-topic-help"
                            />



                            <p
                                id="custom-topic-help"
                                className="text-xs text-muted-foreground"
                            >
                                Use at least <strong>8 characters</strong> to
                                enable the Start button.
                            </p>
                        </div>
                    </div>

                    {isSelected('custom') && (
                        <div
                            aria-hidden
                            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                        >
                            <Trophy className="w-4 h-4 text-primary-foreground" />
                        </div>
                    )}
                </div>
            </motion.article>

            {/* Preset Topics Grid */}
            <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
                role="list"
            >
                {topicOptions.map((t, i) => {
                    const selectedThis = isSelected(t.id);

                    return (
                        <motion.article
                            key={t.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={selectedThis}
                            aria-label={`Select topic: ${t.title}`}
                            onKeyDown={handleKeySelect(() =>
                                onSelect({ ...t, kind: 'preset' })
                            )}
                            onClick={() =>
                                onSelect({ ...t, kind: 'preset' })
                            }
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (i + 1) * 0.05 }}
                            className={`bg-secondary/50 hover:bg-secondary/70 border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02] ${selectedThis
                                ? 'border-primary shadow-[0_0_20px_hsl(43,96%,56%,0.3)]'
                                : 'border-border/50 hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <span aria-hidden className="text-4xl">
                                    {t.icon}
                                </span>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {t.category}
                                        </Badge>
                                    </div>

                                    <h3 className="text-lg font-bold text-foreground">
                                        {t.title}
                                    </h3>
                                </div>

                                {selectedThis && (
                                    <div
                                        aria-hidden
                                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                                    >
                                        <Trophy className="w-3 h-3 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </motion.section>
    );
};

export default TopicGrid;
