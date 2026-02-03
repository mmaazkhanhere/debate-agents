import type { DebaterProfile, DebateSetupStep } from '@/app/select/_types/type';

export const STEPS: { id: DebateSetupStep; label: string }[] = [
    { id: 'debater1', label: 'Choose first debater' },
    { id: 'debater2', label: 'Choose second debater' },
    { id: 'topic', label: 'Select topic' },
];

export const styleItems = [
    { key: "logic", label: "Logic", color: "bg-sky-500", track: "bg-sky-500/15" },
    { key: "charisma", label: "Emotion", color: "bg-rose-500", track: "bg-rose-500/15" },
    { key: "aggression", label: "Aggression", color: "bg-amber-500", track: "bg-amber-500/15" },
    { key: "wit", label: "Wit", color: "bg-emerald-500", track: "bg-emerald-500/15" },
] as const;
