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

const extractLoosePayload = (rawText: string): JudgePayload | null => {
    if (!rawText.trim()) return null;

    const source = rawText.replace(/\r/g, "");
    const lower = source.toLowerCase();

    const patterns = [
        { key: "judge", aliases: ["judge"] },
        { key: "winner", aliases: ["winner"] },
        { key: "reasoning", aliases: ["reasoning", "rationale"] },
        { key: "winner_weakness", aliases: ["winner_weakness", "winner weakness", "weakness"] },
    ] as const;

    const hits: Array<{ key: keyof JudgePayload; start: number; end: number }> = [];

    for (const entry of patterns) {
        for (const alias of entry.aliases) {
            const match = new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b\\s*[:=]`, "i").exec(lower);
            if (match && typeof match.index === "number") {
                hits.push({
                    key: entry.key,
                    start: match.index,
                    end: match.index + match[0].length,
                });
                break;
            }
        }
    }

    if (hits.length === 0) return null;

    hits.sort((a, b) => a.start - b.start);
    const payload: JudgePayload = {};

    for (let i = 0; i < hits.length; i += 1) {
        const current = hits[i];
        const next = hits[i + 1];
        const slice = source.slice(current.end, next?.start ?? source.length);
        const cleaned = slice
            .replace(/^[\s"'`{]+/, "")
            .replace(/[\s"'`,}]+$/, "")
            .trim();
        if (cleaned) {
            payload[current.key] = cleaned;
        }
    }

    return payload.winner ? payload : null;
};

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

    return extractLoosePayload(trimmed);
};

const extractJudgePayload = (event: DebateEvent): JudgePayload | null => {
    if (event.data?.judge && typeof event.data.judge === "string") {
        return {
            judge: event.data.judge,
            winner: event.data.winner,
            reasoning: event.data.reasoning,
            winner_weakness: event.data.winner_weakness,
        };
    }

    if (event.judge && typeof event.judge === "string") {
        return {
            judge: event.judge,
            winner: event.winner,
            reasoning: event.reasoning,
            winner_weakness: event.winner_weakness,
        };
    }

    const rawOutput =
        event.data?.output ||
        event.output ||
        event.text;
    const parsed = parseJsonFromText(rawOutput);
    if (parsed?.judge) return parsed;

    return null;
};

const isJudgeEvent = (event: DebateEvent) => !!extractJudgePayload(event);

const isPresenterAgent = (event: DebateEvent) =>
    event.agent === "presenter_agent" || event.data?.agent === "presenter_agent";

const getEventOutput = (event: DebateEvent): string | null =>
    event.data?.output || event.output || event.text || null;

const isPresenterEvent = (event: DebateEvent) =>
    event.event === "presenter_intro_done" ||
    event.event === "presenter_conclusion_done" ||
    isPresenterAgent(event);

export const getPresenterIntro = (events?: DebateEvent[]): string | null => {
    if (!events) return null;
    const introEvent = events.find(e => e.event === "presenter_intro_done");
    if (introEvent) return getEventOutput(introEvent);

    const presenterEvents = events.filter(isPresenterAgent);
    if (presenterEvents.length === 0) return null;

    return getEventOutput(presenterEvents[0]);
};

export const getPresenterConclusion = (events?: DebateEvent[]): string | null => {
    if (!events) return null;
    const conclusionEvent = events.find(e => e.event === "presenter_conclusion_done");
    if (conclusionEvent) return getEventOutput(conclusionEvent);

    const presenterEvents = events.filter(isPresenterAgent);
    if (presenterEvents.length < 2) return null;

    return getEventOutput(presenterEvents[presenterEvents.length - 1]);
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
    if (/debater[_\s-]*1|speaker[_\s-]*1|side[_\s-]*1/.test(normalizedWinner)) return "left";
    if (/debater[_\s-]*2|speaker[_\s-]*2|side[_\s-]*2/.test(normalizedWinner)) return "right";
    if (/affirmative|pro\b/.test(normalizedWinner)) return "left";
    if (/negative|con\b/.test(normalizedWinner)) return "right";

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
