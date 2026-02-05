import { useEffect, useRef, useState } from "react";
import { startDebate } from "@/actions/debate-api";
import { DebateData } from "@/types/debate";
import { DebateConfig } from "@/app/select/_types/type";
import { useRouter } from "next/navigation";

export const useDebateSession = () => {
    const router = useRouter();
    const [config, setConfig] = useState<DebateData | null>(null);
    const [debateId, setDebateId] = useState<string | null>(null);
    const hasInitiated = useRef(false);

    useEffect(() => {
        const stored = sessionStorage.getItem("debate_config");
        if (!stored) {
            router.push("/select");
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

        const init = async () => {
            if (hasInitiated.current) return;
            hasInitiated.current = true;

            const id = await startDebate(
                debateData.topic,
                debateData.debaters.left.name,
                debateData.debaters.right.name
            );
            setDebateId(id);
        };

        init();
    }, [router]);

    return { config, debateId };
}
