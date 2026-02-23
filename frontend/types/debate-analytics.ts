export type DebateMetricsSummary = {
    debate_count: number;
    total_tokens: number;
    total_cost_usd: number;
    total_duration_seconds: number;
};

export type DebateListItem = {
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
    duration_seconds: number;
};
