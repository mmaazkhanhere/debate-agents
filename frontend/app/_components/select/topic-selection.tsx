'use client';

import { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { topicOptions } from '@/constants/topic-constant';

import CustomTopicCard from './custom-topic-card';
import TopicCard from './topic-card';
import { DebaterProfile, DebateTopicSelection } from '@/types/debate-selection';


type Props = {
    debater1: DebaterProfile;
    debater2: DebaterProfile;
    selectedTopic: DebateTopicSelection | null;
    onSelectTopic: (topic: DebateTopicSelection) => void;
};

const CUSTOM_TOPIC_ID = 'custom' as const;

const TopicSelection = ({
    debater1,
    debater2,
    selectedTopic,
    onSelectTopic,
}: Props) => {
    const isCustomSelected = selectedTopic?.id === CUSTOM_TOPIC_ID;

    const customTitle = useMemo(() => {
        return isCustomSelected ? selectedTopic?.title ?? '' : '';
    }, [isCustomSelected, selectedTopic]);

    const isTopicSelected = useCallback(
        (id: string) => selectedTopic?.id === id,
        [selectedTopic]
    );

    const selectCustomTopic = useCallback(() => {
        onSelectTopic({
            kind: 'custom',
            id: CUSTOM_TOPIC_ID,
            title: customTitle,
            icon: '✍️',
        });
    }, [customTitle, onSelectTopic]);

    const updateCustomTitle = useCallback(
        (title: string) => {
            onSelectTopic({
                kind: 'custom',
                id: CUSTOM_TOPIC_ID,
                title,
                icon: '✍️',
            });
        },
        [onSelectTopic]
    );

    const selectPresetTopic = useCallback(
        (topic: (typeof topicOptions)[number]) => {
            onSelectTopic({ ...topic, kind: 'preset' });
        },
        [onSelectTopic]
    );

    return (
        <motion.section
            aria-labelledby="topic-grid-heading"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
        >
            {/* HEADER */}
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
                    <DebaterPreview debater={debater1} color="left" />
                    <span aria-hidden className="text-3xl">⚔️</span>
                    <DebaterPreview debater={debater2} color="right" />
                </div>
            </header>

            {/* CUSTOM */}
            <CustomTopicCard
                topic={customTitle}
                isSelected={isCustomSelected}
                onSelect={selectCustomTopic}
                onTopicChange={updateCustomTitle}
            />

            {/* PRESET TOPICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {topicOptions.map((topic, index) => (
                    <TopicCard
                        key={topic.id}
                        topic={topic}
                        isSelected={isTopicSelected(topic.id)}
                        delay={(index + 1) * 0.05}
                        onTopicSelect={() => selectPresetTopic(topic)}
                    />
                ))}
            </div>
        </motion.section>
    );
};

export default TopicSelection;

const DebaterPreview = ({
    debater,
    color,
}: {
    debater: DebaterProfile;
    color: 'left' | 'right';
}) => {
    const accent =
        color === 'left'
            ? 'border-debater-left/30 text-debater-left-glow'
            : 'border-debater-right/30 text-debater-right-glow';

    return (
        <div
            className={`flex items-center gap-4 border rounded-xl px-5 py-3 bg-secondary/50 ${accent}`}
        >
            {/* Avatar container (locks size) */}
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                <Image
                    src={debater.avatar}
                    alt={`Avatar of ${debater.name}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                />
            </div>

            {/* Name */}
            <span className={`text-sm font-semibold leading-none ${accent}`}>
                {debater.name}
            </span>
        </div>
    );
};
