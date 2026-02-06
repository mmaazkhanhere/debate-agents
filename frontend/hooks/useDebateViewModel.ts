import { DebateEngine } from "./debateEngine/types";


export const useDebateViewModel = (debate: any, engine: DebateEngine) => {
    const isJudging =
        engine.phase === "judging" || engine.phase === "winnerAnnouncement";

    const judges = debate.judges ?? [];
    const presenter = debate.presenter ?? { name: "Piers Morgan" };

    const winner =
        engine.phase === "winnerAnnouncement"
            ? judges.filter(judge => judge.vote === "left").length >
                judges.filter(judge => judge.vote === "right").length
                ? "left"
                : "right"
            : null;

    const totalRounds = debate.totalRounds ?? 0;
    const computedRound = engine.roundIndex < 0
        ? 0
        : Math.floor(engine.roundIndex / 2) + 1;
    const round = totalRounds > 0 ? Math.min(computedRound, totalRounds) : computedRound;

    return {
        isJudging,
        judges,
        presenter,
        winner,
        round,
    };
};
