export type DebaterOption = {
    id: string;
    name: string;
    title: string;
    ideology: string;
    avatar: string;
    hairColor: string;
    suitColor: string;
    skinTone: string;
    specialty: string;
    catchphrase: string;
    stats: {
        logic: number;
        charisma: number;
        aggression: number;
        wit: number;
    };
    bio?: string;
}

export type DebateConfig = {
    debater1: DebaterOption;
    debater2: DebaterOption;
    topic: SelectedTopic;
};

export type TopicOption = {
    id: string;
    title: string;
    category: string;
    icon: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export type SelectedTopic =
    | (TopicOption & { kind?: 'preset' })
    | {
        kind?: 'custom';
        id: 'custom';
        title: string;
        category?: 'Custom';
        difficulty?: 'Easy' | 'Medium' | 'Hard';
        icon?: string;
    };


export type Step = 'debater1' | 'debater2' | 'topic';