export interface DebaterOption {
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

export interface TopicOption {
    id: string;
    title: string;
    category: string;
    icon: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export type Step = 'debater1' | 'debater2' | 'topic';
export type DebateConfig = {
    debater1: DebaterOption;
    debater2: DebaterOption;
    topic: SelectedTopic;
};

export type SelectedTopic =
    | (TopicOption & { kind?: 'preset' })
    | {
        kind: 'custom';
        id: 'custom';
        title: string;
        category: 'Custom';
        difficulty: 'Easy' | 'Medium' | 'Hard';
        icon: string;
    };

export const debaterOptions: DebaterOption[] = [
    {
        id: 'donald-trump',
        name: 'Donald Trump',
        title: 'Former President',
        ideology: 'America First',
        avatar: "/assets/trump.png",
        hairColor: 'bg-amber-400',
        suitColor: 'bg-slate-900',
        skinTone: 'bg-orange-200',
        specialty: 'Business & Politics',
        catchphrase: '"Make debates great again!"',
        stats: { logic: 55, charisma: 95, aggression: 90, wit: 70 },
    },
    {
        id: 'elon-musk',
        name: 'Elon Musk',
        title: 'Tech Visionary',
        ideology: 'Techno-Optimist',
        avatar: "/assets/elon_musk.png",
        hairColor: 'bg-stone-600',
        suitColor: 'bg-zinc-800',
        skinTone: 'bg-stone-200',
        specialty: 'Technology & Innovation',
        catchphrase: '"The future is now, deal with it."',
        stats: { logic: 85, charisma: 75, aggression: 65, wit: 80 },
    },
    {
        id: 'greta-thunberg',
        name: 'Greta Thunberg',
        title: 'Climate Activist',
        ideology: 'Environmental Justice',
        avatar: "/assets/greta.png",
        hairColor: 'bg-amber-600',
        suitColor: 'bg-emerald-700',
        skinTone: 'bg-stone-100',
        specialty: 'Climate & Environment',
        catchphrase: '"How dare you!"',
        stats: { logic: 80, charisma: 70, aggression: 75, wit: 60 },
    },
    {
        id: 'jordan-peterson',
        name: 'Jordan Peterson',
        title: 'Clinical Psychologist',
        ideology: 'Classical Liberal',
        avatar: "/assets/jordan_peterson.png",
        hairColor: 'bg-stone-500',
        suitColor: 'bg-slate-700',
        skinTone: 'bg-stone-200',
        specialty: 'Psychology & Philosophy',
        catchphrase: '"Clean your room, bucko!"',
        stats: { logic: 90, charisma: 80, aggression: 60, wit: 75 },
    },
    {
        id: 'bassem-youssef',
        name: 'Bassem Youssef',
        title: 'Satirist & Host',
        ideology: 'Progressive Satirist',
        avatar: "/assets/bassem_youssef.png",
        hairColor: 'bg-neutral-900',
        suitColor: 'bg-indigo-900',
        skinTone: 'bg-amber-100',
        specialty: 'Satire & Politics',
        catchphrase: '"Let me explain this with humor."',
        stats: { logic: 75, charisma: 95, aggression: 45, wit: 98 },
    },
    {
        id: 'jordan-peele',
        name: 'Jordan Peele',
        title: 'Filmmaker, Comedian & Cultural Critic',
        ideology: 'Social Satirist & Psychological Commentator',
        avatar: "/assets/jordan_peele.png",
        hairColor: 'bg-stone-400',
        suitColor: 'bg-neutral-900',
        skinTone: 'bg-rose-100',
        specialty: 'Comedy, Horror, Social Insight',
        catchphrase: '"Now that’s the twist I didn’t see coming."',
        stats: {
            logic: 80,        // strong on cultural reasoning
            charisma: 95,     // very engaging and quotable
            aggression: 65,   // tends more toward critique than attack
            wit: 98           // razor-sharp, high entertainment value
        },
        bio: "American comedian, writer, director, and producer known for blending satire and social commentary in comedy and horror films like 'Get Out', 'Us', and 'Nope'. His work redefines genre with cultural depth and psychological insight, making him both thought-provoking and highly quotable in debates. :contentReference[oaicite:0]{index=0}"
    }

];

export const topicOptions: TopicOption[] = [
    {
        id: 'ai-regulation',
        title: 'Should AI Be Regulated by Governments?',
        category: 'Technology',
        icon: '🤖',
        difficulty: 'Medium',
    },
    {
        id: 'climate-action',
        title: 'Should Climate Action Be Mandatory for Corporations?',
        category: 'Environment',
        icon: '🌍',
        difficulty: 'Medium',
    },
    {
        id: 'universal-income',
        title: 'Is Universal Basic Income the Future?',
        category: 'Economics',
        icon: '💰',
        difficulty: 'Hard',
    },
    {
        id: 'social-media',
        title: 'Should Social Media Have Age Restrictions?',
        category: 'Society',
        icon: '📱',
        difficulty: 'Easy',
    },
    {
        id: 'space-exploration',
        title: 'Should Space Exploration Be Privatized?',
        category: 'Science',
        icon: '🚀',
        difficulty: 'Medium',
    },
    {
        id: 'free-speech',
        title: 'Is Cancel Culture a Threat to Free Speech?',
        category: 'Culture',
        icon: '🗣️',
        difficulty: 'Hard',
    },
];