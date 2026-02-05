import { DebateData, DebateArgument } from "@/types/debate";
import { DebateEvent } from "@/types/debate-event";
import { CardType } from "@/types/type_d";
import { DEFAULT_CONFIDENCE, VALID_CARD_TYPES } from "./constants";
import { Side } from "./types";

const isCardType = (value?: string): value is CardType => {
    if (!value) return false;
    return VALID_CARD_TYPES.includes(value as CardType);
};

const isDebaterName = (debate: DebateData, debaterName?: string): debaterName is string =>
    !!debaterName &&
    (debaterName === debate.debaters.left.name || debaterName === debate.debaters.right.name);

export const getDebaterSide = (debate: DebateData, debaterName?: string): Side =>
    debaterName === debate.debaters.left.name ? "left" : "right";

const hasArgumentText = (event: DebateEvent) =>
    !!event.data?.argument?.text || !!event.argument?.text || !!event.text;

const isJudgeEvent = (event: DebateEvent) =>
    !!event.judge || !!event.data?.judge;

const isPresenterEvent = (event: DebateEvent) =>
    event.event === "moderator_intro_done" ||
    event.event === "moderator_conclusion_done" ||
    event.agent === "moderator_agent";

export const getPresenterIntro = (events?: DebateEvent[]): string | null => {
    if (!events) return null;
    const introEvent = events.find(
        e => e.event === "moderator_intro_done"
    );
    return introEvent?.data?.output || introEvent?.text || null;
};

export const getPresenterConclusion = (events?: DebateEvent[]): string | null => {
    if (!events) return null;
    const conclusionEvent = events.find(
        e => e.event === "moderator_conclusion_done"
    );
    return conclusionEvent?.data?.output || conclusionEvent?.text || null;
};


export const mapEventToArgument = (event: DebateEvent, debate: DebateData): DebateArgument | null => {
    const debaterName = event.debater || event.agent || event.data?.debater;
    if (!isDebaterName(debate, debaterName)) return null;
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
        .filter(e => !isPresenterEvent(e) && !isJudgeEvent(e) && hasArgumentText(e))
        .map(event => mapEventToArgument(event, debate))
        .filter((arg): arg is DebateArgument => !!arg);
};
