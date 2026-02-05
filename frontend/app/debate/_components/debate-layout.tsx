import { useDebateViewModel } from "@/hooks/useDebateViewModel";
import DebateArena from "./debate_layout/debate-arena";
import DebateOverlays from "./debate_layout/debate-overlay";
import DebatePresenter from "./debate-presenter";



type DebateLayoutProps = {
    debate: any;
    engine: any;
    onExit?: () => void;
}


const DebateLayout = ({ debate, engine, onExit }: DebateLayoutProps) => {
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
                        : engine.phase === "moderatorConclusion"
                            ? engine.presenterConclusionResponse ?? undefined
                            : undefined
                }

                onAnnouncementFinished={
                    engine.phase === "intro"
                        ? engine.nextRound
                        : engine.phase === "moderatorConclusion"
                            ? engine.sendConclude
                            : undefined
                }
            />


            <DebateArena debate={debate} engine={engine} />

            <DebateOverlays
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
