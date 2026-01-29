"use client"

import { useEffect, useState, useRef } from "react";
import { mockDebate, DebateData } from "@/data/mockDebate";
import DebateLayout from "./debate-layout";
import { useDebateEngine } from "@/hooks/useDebateEngine";
import { useDebateAudio } from "@/hooks/useDebateAudio";
import { useRouter } from "next/navigation";
import { debateApi } from "@/services/debate-api";
import { useDebateStream } from "@/hooks/useDebateStream";
import { DebateConfig } from "@/types/type_d";

const DebateStage = () => {
    const router = useRouter();
    const [config, setConfig] = useState<DebateData | null>(null);
    const [debateId, setDebateId] = useState<string | null>(null);
    const [isDebateFinished, setIsDebateFinished] = useState(false);
    const hasInitiated = useRef(false);

    // Load config from session storage and start debate
    useEffect(() => {
        const storedConfig = sessionStorage.getItem('debate_config');
        if (!storedConfig) {
            router.push('/select');
            return;
        }

        try {
            const parsedConfig: DebateConfig = JSON.parse(storedConfig);

            // Construct the full DebateData object from the selection
            const debateData: DebateData = {
                ...mockDebate, // Default fallback for presenter, judges, etc.
                topic: parsedConfig.topic.title,
                debaters: {
                    left: {
                        ...mockDebate.debaters.left,
                        name: parsedConfig.debater1.name,
                        title: parsedConfig.debater1.title,
                        avatar: parsedConfig.debater1.avatar || mockDebate.debaters.left.avatar,
                        id: 'left'
                    },
                    right: {
                        ...mockDebate.debaters.right,
                        name: parsedConfig.debater2.name,
                        title: parsedConfig.debater2.title,
                        avatar: parsedConfig.debater2.avatar || mockDebate.debaters.right.avatar,
                        id: 'right'
                    }
                },
                arguments: []
            };

            setConfig(debateData);

            // Initiate the backend debate logic
            const initDebate = async () => {
                if (hasInitiated.current) return;
                hasInitiated.current = true;

                try {
                    const id = await debateApi.startDebate(
                        debateData.topic,
                        debateData.debaters.left.name,
                        debateData.debaters.right.name
                    );
                    setDebateId(id);
                } catch (error) {
                    console.error("Failed to start debate session:", error);
                }
            };

            initDebate();

        } catch (e) {
            console.error("Failed to parse debate config", e);
            router.push('/select');
        }
    }, [router]);

    // Connect to SSE stream
    const { messages, isConnected, close } = useDebateStream(debateId);

    // Pass data to engine (only if config is loaded)
    // We use a safe fallback for the engine call to prevent crashes during loading
    const engineConfig = config || mockDebate;
    const engine = useDebateEngine(engineConfig, messages, isDebateFinished);

    useDebateAudio(engine.phase, !!config);

    const handleEndDebate = () => {
        setIsDebateFinished(true);
        close();
    };

    // Auto-end debate after rounds conclude
    // We check if we have reached the last argument of the final round
    useEffect(() => {
        const totalRounds = config?.totalRounds || 2;
        const finalArgumentIndex = (totalRounds * 2) - 1;

        if (engine.roundIndex === finalArgumentIndex && engine.phase === 'reaction') {
            const timer = setTimeout(() => {
                handleEndDebate();
            }, 3000); // Give it some time to show the last reaction
            return () => clearTimeout(timer);
        }
    }, [engine.roundIndex, engine.phase, config?.totalRounds]);

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

            {/* Dev/Control Panel */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <div className={`px-3 py-1 rounded text-xs font-bold ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isConnected ? 'LIVE' : 'OFFLINE'}
                </div>
                {!isDebateFinished && (
                    <button
                        onClick={handleEndDebate}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded shadow-lg transition-colors cursor-pointer"
                    >
                        End Debate &rarr; Judge
                    </button>
                )}
            </div>
        </div>
    );
}

export default DebateStage