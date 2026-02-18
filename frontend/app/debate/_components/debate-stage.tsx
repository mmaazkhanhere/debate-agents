"use client";

import DebateLayout from "./debate-layout";
import { useDebateEngine } from "@/hooks/useDebateEngine";
import { useDebateAudio } from "@/hooks/useDebateAudio";
import { useDebateStream } from "@/hooks/useDebateStream";
import { useDebateSession } from "@/hooks/useDebateSession";
import { useEffect, useMemo, useState, useCallback } from "react";
import { DebateData } from "@/types/debate";
import { buildJudges } from "@/hooks/debateEngine/stream";

const EMPTY_DEBATE: DebateData = {
    topic: "",
    debaters: {
        left: { id: "left", name: "", title: "", avatar: "" },
        right: { id: "right", name: "", title: "", avatar: "" },
    },
    arguments: [],
    judges: [],
    totalRounds: 2,
};

const DebateStage = () => {
    const { config, debateId, sessionId, userId } = useDebateSession();
    const { messages, close } = useDebateStream(debateId, sessionId, userId);
    const [isDebateFinished, setIsDebateFinished] = useState(false);

    // Always provide stable config to hooks
    const safeConfig = useMemo(() => config ?? EMPTY_DEBATE, [config]);
    const judges = useMemo(() => buildJudges(safeConfig, messages), [safeConfig, messages]);
    const enrichedDebate = useMemo(
        () => ({ ...safeConfig, judges }),
        [safeConfig, judges]
    );

    // Hooks are now unconditional
    const engine = useDebateEngine(enrichedDebate, messages, isDebateFinished);
    useDebateAudio(engine.phase, !!config);

    const handleEndDebate = useCallback(() => {
        setIsDebateFinished(true);
        close();
    }, [close]);

    useEffect(() => {
        if (engine.phase === "complete") {
            handleEndDebate();
        }
    }, [engine.phase, handleEndDebate]);

    // Only UI is conditional
    if (!config) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-50">
                <div className="animate-pulse">Preparing the Arena...</div>
            </div>
        );
    }

    return (
        <div className="relative">
            <DebateLayout
                debate={enrichedDebate}
                engine={engine}
            />
        </div>
    );
};

export default DebateStage;
