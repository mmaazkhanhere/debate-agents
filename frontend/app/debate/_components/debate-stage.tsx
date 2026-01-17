"use client"

import { mockDebate } from "@/data/mockDebate";
import DebateLayout from "./debate-layout";

import ModeratorZone from "./moderator";
import { useDebateEngine } from "@/hooks/useDebateEngine";
import { useDebateAudio } from "@/hooks/useDebateAudio";
import { useRouter } from "next/navigation";

const DebateStage = () => {
    const debate = mockDebate;
    const router = useRouter();

    const engine = useDebateEngine(debate);
    useDebateAudio(engine.phase, true);

    if (engine.phase === "intro") {
        return (
            <ModeratorZone
                topic={debate.topic}
                presenterName={debate.presenter.name}
                announcement={debate.presenter.introText}
                onAnnouncementComplete={engine.nextRound}
                round={engine.roundIndex + 1}
                totalRounds={debate.arguments.length}
            />
        );
    }

    return (
        <DebateLayout
            debate={debate}
            engine={engine}
            onExit={() => router.push("/select")}
        />
    );
}

export default DebateStage