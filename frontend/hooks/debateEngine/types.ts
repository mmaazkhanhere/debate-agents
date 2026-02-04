import { DebateArgument } from "@/types/debate";
import { CardType } from "@/types/type_d";

export type DebatePhase =
    | "intro"
    | "drawing"
    | "playing"
    | "speaking"
    | "judging"
    | "verdict"
    | "waiting";

export type Side = "left" | "right";

export type ConfidenceBySide = Record<Side, number>;
export type ScoreBySide = Record<Side, number>;

export interface PlayedCard {
    id: string;
    type: CardType;
    text: string;
    speaker: string;
    side: Side;
    confidence: number;
}

export interface DebateEngineState {
    phase: DebatePhase;
    roundIndex: number;
    activeSide: Side | null;
    activeCardId: string | null;
    currentArgument?: DebateArgument;
    streamedModeratorIntro: string | null;
    leftCards: PlayedCard[];
    rightCards: PlayedCard[];
    scores: ScoreBySide;
    confidence: ConfidenceBySide;
    revealedJudges: number;
    selectedCard: PlayedCard | null;
}

export interface DebateEngineActions {
    setPhase: (phase: DebatePhase) => void;
    setActiveSide: (side: Side | null) => void;
    setActiveCardId: (id: string | null) => void;
    setLeftCards: (cards: PlayedCard[] | ((prev: PlayedCard[]) => PlayedCard[])) => void;
    setRightCards: (cards: PlayedCard[] | ((prev: PlayedCard[]) => PlayedCard[])) => void;
    setSelectedCard: (card: PlayedCard | null) => void;
    nextRound: () => void;
    completeArgument: () => void;
    reset: () => void;
}

export type DebateEngine = DebateEngineState & DebateEngineActions;
