import { CardType, Side } from "@/types/type_d";

export interface Debater {
    id: Side;
    name: string;
    title: string;
    avatar: string;
    ideology?: string;
}

export interface DebateArgument {
    debaterId?: Side;
    text: string;
    cardType?: CardType;
    confidence?: number;
}

export type JudgeRubricScore = Record<string, [number, number]>;

export interface Judge {
    id: number;
    name: string;
    title: string;
    vote: Side;
    reasoning: string;
    quotedLine: string;
    rubricScore?: JudgeRubricScore;
}

export interface DebatePresenter {
    name: string;
    introText?: string;
    closingText?: string;
}

export interface DebateData {
    topic: string;
    presenter?: DebatePresenter;
    debaters: {
        left: Debater;
        right: Debater;
    };
    arguments: DebateArgument[];
    judges?: Judge[];
    timeLimit?: number;
    totalRounds?: number;
}
