import { DebateData, DebateArgument } from "@/types/debate";
import { DebateEvent } from "@/types/debate-event";
import { CardType } from "@/types/type_d";
import { DEFAULT_CONFIDENCE, VALID_CARD_TYPES } from "./constants";
import { Side } from "./types";

const isCardType = (value?: string): value is CardType => {
    if (!value) return false;
    return VALID_CARD_TYPES.includes(value as CardType);
};

export const getDebaterSide = (debate: DebateData, debaterName?: string): Side =>
    debaterName === debate.debaters.left.name ? "left" : "right";

export const getModeratorIntro = (events?: DebateEvent[]): string | null => {
    if (!events) return null;
    const introEvent = events.find(
        e => e.event === "moderator_intro_done" || e.debater === "Moderator"
    );
    return introEvent?.data?.output || introEvent?.text || null;
};

export const mapEventToArgument = (event: DebateEvent, debate: DebateData): DebateArgument => {
    const debaterName = event.debater || event.agent || event.data?.debater;
    const debaterId = getDebaterSide(debate, debaterName);

    const argument = event.data?.argument || (typeof event.argument === "object" ? event.argument : undefined);
    const text = argument?.text || event.text || "...";

    const rawType = argument?.type || event.data?.argument?.type;
    const cardType: CardType = isCardType(rawType) ? rawType : "attack";
    const confidence = argument?.confidence ?? event.data?.argument?.confidence ?? event.confidence ?? DEFAULT_CONFIDENCE;

    return {
        debaterId,
        text,
        cardType,
        confidence
    };
};

export const buildArguments = (debate: DebateData, events?: DebateEvent[]): DebateArgument[] => {
    if (!events) return debate.arguments;

    return events
        .filter(
            e =>
                e.event !== "moderator_intro_done" &&
                e.debater !== "Moderator" &&
                e.agent !== "moderator_agent"
        )
        .map(event => mapEventToArgument(event, debate));
};
