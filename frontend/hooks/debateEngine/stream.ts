import { DebateData, DebateArgument, Judge } from "@/types/debate";
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

type JudgePayload = {
    judge?: string;
    winner?: string;
    reasoning?: string;
    winner_weakness?: string;
};

const cleanText = (value?: string) =>
    value?.replace(/\s+/g, " ").trim() ?? "";

const parseJsonFromText = (rawText?: string): JudgePayload | null => {
    if (!rawText) return null;
    const trimmed = rawText.trim();
    if (!trimmed) return null;

    try {
        return JSON.parse(trimmed) as JudgePayload;
    } catch {
        const start = trimmed.indexOf("{");
        const end = trimmed.lastIndexOf("}");
        if (start >= 0 && end > start) {
            const slice = trimmed.slice(start, end + 1);
            try {
                return JSON.parse(slice) as JudgePayload;
            } catch {
                return null;
            }
        }
    }

    return null;
};

const extractJudgePayload = (event: DebateEvent): JudgePayload | null => {
    if (event.data?.judge && typeof event.data.judge === "string") {
        return {
            judge: event.data.judge,
            winner: (event.data as any).winner,
            reasoning: (event.data as any).reasoning,
            winner_weakness: (event.data as any).winner_weakness,
        };
    }

    if ((event as any).judge && typeof (event as any).judge === "string") {
        return {
            judge: (event as any).judge,
            winner: (event as any).winner,
            reasoning: (event as any).reasoning,
            winner_weakness: (event as any).winner_weakness,
        };
    }

    const rawOutput =
        event.data?.output ||
        (event as any).output ||
        event.text;
    const parsed = parseJsonFromText(rawOutput);
    if (parsed?.judge) return parsed;

    return null;
};

const isJudgeEvent = (event: DebateEvent) => !!extractJudgePayload(event);

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

const inferVoteSide = (debate: DebateData, winner?: string): Side | null => {
    if (!winner) return null;
    const normalizedWinner = cleanText(winner).toLowerCase();
    const leftName = cleanText(debate.debaters.left.name).toLowerCase();
    const rightName = cleanText(debate.debaters.right.name).toLowerCase();

    if (normalizedWinner === "left" || normalizedWinner === leftName) return "left";
    if (normalizedWinner === "right" || normalizedWinner === rightName) return "right";
    if (leftName && normalizedWinner.includes(leftName)) return "left";
    if (rightName && normalizedWinner.includes(rightName)) return "right";

    return null;
};

export const buildJudges = (debate: DebateData, events?: DebateEvent[]): Judge[] => {
    if (!events || events.length === 0) return debate.judges ?? [];

    const seen = new Set<string>();
    const judges: Judge[] = [];

    for (const event of events) {
        const payload = extractJudgePayload(event);
        if (!payload) continue;

        const vote = inferVoteSide(debate, payload.winner);
        if (!vote) continue;

        const name = cleanText(payload.judge) || cleanText(event.agent) || "Judge";
        const title = cleanText(event.agent) || "Judge";
        const reasoning = cleanText(payload.reasoning);
        const quotedLine = cleanText(payload.winner_weakness);

        const key = `${name}|${vote}|${reasoning}|${quotedLine}`;
        if (seen.has(key)) continue;
        seen.add(key);

        judges.push({
            id: judges.length + 1,
            name,
            title,
            vote,
            reasoning,
            quotedLine,
        });
    }

    return judges.length > 0 ? judges : debate.judges ?? [];
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
