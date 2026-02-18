import { useEffect, useState } from "react";
import { DebateData } from "@/types/debate";
import { DebateConfig } from "@/types/debate-selection";
import { useParams, useRouter } from "next/navigation";
import { useClientSessionId } from "@/hooks/useClientSessionId";
import { useAuth } from "@/contexts/auth-context";

export const useDebateSession = () => {
    const router = useRouter();
    const params = useParams();
    const [config, setConfig] = useState<DebateData | null>(null);
    const sessionId = useClientSessionId();
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const debateIdParam = params?.debate_id;
    const debateId = Array.isArray(debateIdParam) ? debateIdParam[0] : debateIdParam ?? null;

    useEffect(() => {
        if (!debateId) {
            router.push("/");
            return;
        }

        const stored = sessionStorage.getItem("debate_config");
        if (!stored) {
            router.push("/");
            return;
        }

        const parsed: DebateConfig = JSON.parse(stored);

        const debateData: DebateData = {
            topic: parsed.topic.title,
            debaters: {
                left: { ...parsed.debater1, id: "left" },
                right: { ...parsed.debater2, id: "right" },
            },
            arguments: [],
            judges: [],
            totalRounds: 1, //TODO: This is something that is going to be received from backend
        };

        setConfig(debateData);
    }, [debateId, router]);

    return { config, debateId, sessionId, userId };
}
