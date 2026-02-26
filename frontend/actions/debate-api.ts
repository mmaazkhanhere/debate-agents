const API_BASE_URL = process.env.NEXT_PUBLIC_DEBATE_API_BASE_URL?.trim();

function getApiBaseUrl(): string {
    if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_DEBATE_API_BASE_URL is not set");
    }
    return API_BASE_URL.replace(/\/+$/, "");
}

type StartDebateResponse = {
    debate_id: string;
}

type DebateListResponse = {
    debates: Array<{
        debate_id: string;
        topic: string;
        debater_1: string;
        debater_2: string;
        status: string;
        created_at: number;
        completed_at: number | null;
        error_message: string | null;
        summary: string | null;
        total_tokens: number;
        total_cost_usd: number;
        cost_breakdown: Array<{
            model: string;
            input_tokens: number;
            output_tokens: number;
            total_tokens: number;
            cost_usd: number;
        }>;
        duration_seconds: number;
    }>;
}

type DebateAnalyticsResponse = {
    debate_count: number;
    total_tokens: number;
    total_cost_usd: number;
    total_duration_seconds: number;
}

type DebateOverviewResponse = {
    analytics: DebateAnalyticsResponse;
    debates: DebateListResponse["debates"];
}

/**
 * Initiates a new debate session with the backend.
 * 
 * @param topic - The debate topic
 * @param debater1 - Name of the first debater
 * @param debater2 - Name of the second debater
 * @returns Promise resolving to the debate ID
 * @throws Error if the request fails
 */
export async function startDebate(
    topic: string,
    debater1: string,
    debater2: string,
    sessionId: string,
    userId?: string | null
): Promise<string> {
    if (!sessionId || sessionId.trim().length === 0) {
        throw new Error("sessionId is required to start a debate");
    }
    const response = await fetch(`${getApiBaseUrl()}/debate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            topic,
            debater_1: debater1,
            debater_2: debater2,
            session_id: sessionId,
            user_id: userId ?? null,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to start debate: ${response.statusText}`);
    }

    const data: StartDebateResponse = await response.json();
    return data.debate_id;
}

/**
 * Constructs the Server-Sent Events (SSE) endpoint URL for a debate.
 * 
 * @param debateId - The unique debate identifier
 * @returns The complete SSE endpoint URL
 */
export function buildDebateEventsUrl(debateId: string): string {
    return `${getApiBaseUrl()}/debate/${debateId}/events`;
}

export function buildDebateEventsUrlWithIdentity(
    debateId: string,
    sessionId: string,
    userId?: string | null
): string {
    if (!sessionId || sessionId.trim().length === 0) {
        throw new Error("sessionId is required to subscribe to debate events");
    }
    const params = new URLSearchParams({ session_id: sessionId });
    if (userId) {
        params.set("user_id", userId);
    }
    return `${getApiBaseUrl()}/debate/${debateId}/events?${params.toString()}`;
}

export async function listDebates(
    sessionId: string,
    userId?: string | null
): Promise<DebateListResponse> {
    if (!sessionId || sessionId.trim().length === 0) {
        throw new Error("sessionId is required to list debates");
    }
    const params = new URLSearchParams({ session_id: sessionId });
    if (userId) {
        params.set("user_id", userId);
    }
    const response = await fetch(`${getApiBaseUrl()}/debates?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to list debates: ${response.statusText}`);
    }
    return response.json();
}

export async function getDebateAnalytics(
    sessionId: string,
    userId?: string | null
): Promise<DebateAnalyticsResponse> {
    if (!sessionId || sessionId.trim().length === 0) {
        throw new Error("sessionId is required to get analytics");
    }
    const params = new URLSearchParams({ session_id: sessionId });
    if (userId) {
        params.set("user_id", userId);
    }
    const response = await fetch(`${getApiBaseUrl()}/debates/analytics?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }
    return response.json();
}

export async function getDebateOverview(
    sessionId: string,
    userId?: string | null
): Promise<DebateOverviewResponse> {
    if (!sessionId || sessionId.trim().length === 0) {
        throw new Error("sessionId is required to get analytics overview");
    }
    const params = new URLSearchParams({ session_id: sessionId });
    if (userId) {
        params.set("user_id", userId);
    }
    const response = await fetch(`${getApiBaseUrl()}/debates/overview?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch analytics overview: ${response.statusText}`);
    }
    return response.json();
}
