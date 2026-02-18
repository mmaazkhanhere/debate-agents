const STORAGE_KEY = "arena_session_id";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

type SessionRecord = {
    id: string;
    expires_at: number;
};

const safeParse = (raw: string | null): SessionRecord | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.id !== "string" || typeof parsed.expires_at !== "number") {
            return null;
        }
        return parsed as SessionRecord;
    } catch {
        return null;
    }
};

const generateId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
};

export const getOrCreateSessionId = (): string => {
    if (typeof window === "undefined") return "";

    const now = Date.now();
    const existing = safeParse(localStorage.getItem(STORAGE_KEY));

    if (existing && existing.expires_at > now && existing.id.trim().length > 0) {
        return existing.id;
    }

    const record: SessionRecord = {
        id: generateId(),
        expires_at: now + SESSION_TTL_MS,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    return record.id;
};

export const peekSessionId = (): string | null => {
    if (typeof window === "undefined") return null;
    const existing = safeParse(localStorage.getItem(STORAGE_KEY));
    if (!existing) return null;
    if (existing.expires_at <= Date.now()) return null;
    return existing.id;
};
