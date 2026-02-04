"use client";

import DebateLayout from "./debate-layout";
import { useRouter } from "next/navigation";
import { useDebateEngine } from "@/hooks/useDebateEngine";
import { useDebateAudio } from "@/hooks/useDebateAudio";
import { useDebateStream } from "@/hooks/useDebateStream";
import { useDebateSession } from "@/hooks/useDebateSession";
import { useEffect, useState, useMemo } from "react";
import { DebateData } from "@/types/debate";

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
    const router = useRouter();
    const { config, debateId } = useDebateSession();
    const { messages, isConnected, close } = useDebateStream(debateId);
    const [isDebateFinished, setIsDebateFinished] = useState(false);

    // Always provide stable config to hooks
    const safeConfig = useMemo(() => config ?? EMPTY_DEBATE, [config]);

    // ✅ Hooks are now unconditional
    const engine = useDebateEngine(safeConfig, messages, isDebateFinished);
    useDebateAudio(engine.phase, !!config);

    const handleEndDebate = () => {
        setIsDebateFinished(true);
        close();
    };

    useEffect(() => {
        if (engine.phase === "conclusion") {
            handleEndDebate();
        }
    }, [engine.phase]);

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
                debate={config}
                engine={engine}
                onExit={() => router.push("/select")}
            />
        </div>
    );
};

export default DebateStage;
