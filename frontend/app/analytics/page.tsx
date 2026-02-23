"use client";

import { useEffect, useMemo, useState } from "react";
import { getDebateOverview } from "@/actions/debate-api";
import { useClientSessionId } from "@/hooks/useClientSessionId";
import { useAuth } from "@/contexts/auth-context";
import type { DebateListItem, DebateMetricsSummary } from "@/types/debate-analytics";

const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
};

const formatCost = (value: number) =>
    `$${Number(value || 0).toFixed(4)}`;

const AnalyticsPage = () => {
    const sessionId = useClientSessionId();
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const [summary, setSummary] = useState<DebateMetricsSummary | null>(null);
    const [debates, setDebates] = useState<DebateListItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSummaryDebate, setActiveSummaryDebate] = useState<DebateListItem | null>(null);

    useEffect(() => {
        if (!sessionId) return;
        let cancelled = false;
        setLoading(true);
        setError(null);

        getDebateOverview(sessionId, userId)
            .then((overview) => {
                if (cancelled) return;
                setSummary(overview.analytics);
                setDebates(overview.debates ?? []);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.message ?? "Failed to load analytics.");
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [sessionId, userId]);

    const kpis = useMemo(() => {
        const base = summary ?? {
            debate_count: 0,
            total_tokens: 0,
            total_cost_usd: 0,
            total_duration_seconds: 0,
        };
        return [
            { label: "Total Debates", value: base.debate_count.toString() },
            { label: "Total Tokens", value: base.total_tokens.toLocaleString() },
            { label: "Total Cost", value: formatCost(base.total_cost_usd) },
            { label: "Total Duration", value: formatDuration(base.total_duration_seconds) },
        ];
    }, [summary]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-display">Debate Analytics</h1>
                    <p className="text-sm text-slate-400 mt-2">
                        Aggregate usage, cost, and runtime across your debates.
                    </p>
                </header>

                {error && (
                    <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-4"
                        >
                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                {item.label}
                            </p>
                            <p className="mt-2 text-xl font-semibold text-slate-100">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Debate History</h2>
                        {loading && (
                            <span className="text-xs text-slate-500">Loading...</span>
                        )}
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-900/80 text-slate-400">
                                <tr>
                                    <th className="px-4 py-3 text-left">Topic</th>
                                    <th className="px-4 py-3 text-left">Debaters</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Summary</th>
                                    <th className="px-4 py-3 text-left">Tokens</th>
                                    <th className="px-4 py-3 text-left">Cost</th>
                                    <th className="px-4 py-3 text-left">Duration</th>
                                    <th className="px-4 py-3 text-left">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {debates.length === 0 && !loading ? (
                                    <tr>
                                        <td className="px-4 py-6 text-slate-500" colSpan={8}>
                                            No debates found.
                                        </td>
                                    </tr>
                                ) : (
                                    debates.map((debate) => (
                                        <tr
                                            key={debate.debate_id}
                                            className="border-t border-slate-800/80"
                                        >
                                            <td className="px-4 py-3 text-slate-200">
                                                {debate.topic}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {debate.debater_1} vs {debate.debater_2}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                                                    {debate.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 max-w-xs">
                                                <div className="line-clamp-2">
                                                    {debate.summary ?? "-"}
                                                </div>
                                                {debate.summary ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveSummaryDebate(debate)}
                                                        className="mt-2 text-xs text-slate-400 underline-offset-2 hover:underline"
                                                    >
                                                        Expand
                                                    </button>
                                                ) : null}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {debate.total_tokens.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                <div className="group relative inline-block">
                                                    <span className="cursor-help">
                                                        {formatCost(debate.total_cost_usd)}
                                                    </span>
                                                    {debate.cost_breakdown.length > 0 ? (
                                                        <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-80 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs text-slate-200 shadow-xl group-hover:block">
                                                            <p className="mb-2 font-semibold text-slate-100">Cost Breakdown by Model</p>
                                                            <div className="space-y-2">
                                                                {debate.cost_breakdown.map((item) => (
                                                                    <div
                                                                        key={`${debate.debate_id}-${item.model}`}
                                                                        className="rounded border border-slate-800 bg-slate-950/50 p-2"
                                                                    >
                                                                        <p className="truncate font-medium text-slate-100">
                                                                            {item.model}
                                                                        </p>
                                                                        <p className="text-slate-400">
                                                                            Tokens: {item.total_tokens.toLocaleString()} ({item.input_tokens.toLocaleString()} in / {item.output_tokens.toLocaleString()} out)
                                                                        </p>
                                                                        <p className="text-slate-300">
                                                                            Cost: {formatCost(item.cost_usd)}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {formatDuration(debate.duration_seconds)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {new Date(debate.created_at * 1000).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            {activeSummaryDebate && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
                    onClick={() => setActiveSummaryDebate(null)}
                >
                    <div
                        className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl md:p-6"
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Debate summary details"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-slate-100">
                                    {activeSummaryDebate.topic}
                                </h3>
                                <p className="mt-1 text-xs text-slate-400">
                                    {activeSummaryDebate.debater_1} vs {activeSummaryDebate.debater_2}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveSummaryDebate(null)}
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
                            >
                                Close
                            </button>
                        </div>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                            {activeSummaryDebate.summary ?? "-"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
