import { memo } from "react";

type DebateScoreProps = {
    leftScore: number;
    rightScore: number;
    debaterNames: {
        left: string;
        right: string;
    };
}

const DebateScore = ({
    leftScore,
    rightScore,
    debaterNames,
}: DebateScoreProps) => {
    return (
        <section
            aria-label="Debate score"
            className="mb-6 flex items-center gap-8"
        >
            <div className="text-center">
                <strong
                    itemProp="homeTeam"
                    className="font-display text-4xl text-debater-left-glow"
                >
                    {debaterNames.left}: {leftScore}
                </strong>
            </div>

            <span aria-hidden className="text-2xl text-muted-foreground">
                vs
            </span>

            <div className="text-center">
                <strong
                    itemProp="awayTeam"
                    className="font-display text-4xl text-debater-right-glow"
                >
                    {debaterNames.right}: {rightScore}
                </strong>
            </div>
        </section>
    );
}

export default memo(DebateScore);
