import { useDebateViewModel } from "@/hooks/useDebateViewModel";
import DebateArena from "./debate_layout/debate-arena";
import DebateRuntimeOverlays from "./debate_layout/debate-runtime-overlays";
import DebatePresenter from "./debate-presenter";
import type { DebateData } from "@/types/debate";
import type { DebateEngine } from "@/hooks/useDebateEngine";



type DebateLayoutProps = {
    debate: DebateData;
    engine: DebateEngine;
};


const DebateLayout = ({ debate, engine }: DebateLayoutProps) => {
    const vm = useDebateViewModel(debate, engine);

    return (
        <div className="flex min-h-screen flex-col overflow-y-auto bg-slate-950 text-slate-50">
            <DebatePresenter
                debateTopic={debate.topic}
                currentRound={vm.round}
                totalRounds={debate.totalRounds}
                announcementText={
                    engine.phase === "intro"
                        ? engine.presenterIntroResponse ?? undefined
                        : engine.phase === "presenterConclusion"
                            ? engine.presenterConclusionResponse ?? undefined
                            : undefined
                }

                onAnnouncementFinished={
                    engine.phase === "intro"
                        ? engine.nextRound
                        : engine.phase === "presenterConclusion"
                            ? engine.sendConclude
                            : undefined
                }
            />


            <DebateArena debate={debate} engine={engine} />

            <DebateRuntimeOverlays
                debate={debate}
                engine={engine}
                judges={vm.judges}
                isJudging={vm.isJudging}
                winner={vm.winner}
            />
        </div>
    );
};

export default DebateLayout;
