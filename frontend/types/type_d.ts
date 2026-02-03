import { DebaterOption } from "@/app/select/_types/type";


export interface TopicOption {
    id: string;
    title: string;
    category: string;
    icon: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}




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


export type Reaction = "positive" | "negative" | "neutral" | null;

export type CardType =
    | "attack"
    | "defense"
    | "counter"
    | "evidence"
    | "rhetoric"
    | "framing"
    | "clarification";

export type Side = "left" | "right";
