export type DebaterProfile = {
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

export type DebateSessionConfig = {
    debater1: DebaterProfile;
    debater2: DebaterProfile;
    topic: DebateTopicSelection;
};

export type DebateTopic = {
    id: string;
    title: string;
    icon: string;
}

export type DebateTopicSelection =
    | (DebateTopic & { kind?: 'preset' })
    | {
        kind?: 'custom';
        id: 'custom';
        title: string;
        icon: string;
    };


export type DebateSetupStep = 'debater1' | 'debater2' | 'topic';

