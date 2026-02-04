import { DebateArgument, DebateData } from "@/types/debate";
import { ConfidenceBySide, PlayedCard, Side } from "./types";

export const createPlayedCard = (
    argument: DebateArgument,
    debate: DebateData,
    roundIndex: number,
    confidence: ConfidenceBySide
): PlayedCard => {
    const side = argument.debaterId;
    return {
        id: `card-${roundIndex}`,
        type: argument.cardType || "attack",
        text: argument.text,
        speaker: side === "left" ? debate.debaters.left.name : debate.debaters.right.name,
        side,
        confidence: argument.confidence ?? confidence[side]
    };
};

export const addCardIfMissing = (cards: PlayedCard[], card: PlayedCard): PlayedCard[] =>
    cards.some(existing => existing.id === card.id) ? cards : [...cards, card];

export const getSideSpeakerName = (debate: DebateData, side: Side) =>
    side === "left" ? debate.debaters.left.name : debate.debaters.right.name;
