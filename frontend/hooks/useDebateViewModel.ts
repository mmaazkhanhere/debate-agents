import { DebateEngine } from "./debateEngine/types";


export const useDebateViewModel = (debate: any, engine: DebateEngine) => {
    const isJudging = engine.phase === "judging" || engine.phase === "verdict";

    const judges = debate.judges ?? [];
    const presenter = debate.presenter ?? { name: "Piers Morgan" };

    const winner =
        engine.phase === "verdict"
            ? judges.filter(judge => judge.vote === "left").length >
                judges.filter(judge => judge.vote === "right").length
                ? "left"
                : "right"
            : null;

    const round = Math.floor(Math.max(0, engine.roundIndex) / 2);

    return {
        isJudging,
        judges,
        presenter,
        winner,
        round,
    };
};
