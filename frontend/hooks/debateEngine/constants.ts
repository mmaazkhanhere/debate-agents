import { CardType } from "@/types/type_d";

export const DEFAULT_CONFIDENCE = 75;

export const PHASE_DELAYS = {
    drawToPlayMs: 1000,
    playToSpeakMs: 1000,
    postArgumentMs: 2000,
    judgeRevealMs: 1500,
    verdictDelayMs: 1000
} as const;

export const VALID_CARD_TYPES: CardType[] = [
    "attack",
    "defense",
    "counter",
    "evidence",
    "rhetoric",
    "framing",
    "clarification"
];
