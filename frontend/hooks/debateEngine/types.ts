// import { DebateArgument } from "@/types/debate";
import { CardType } from "@/types/type_d";

// export type DebatePhase =
//     | "intro"
//     | "drawing"
//     | "playing"
//     | "speaking"
//     | "concluding"
//     | "judging"
//     | "verdict"
//     | "waiting";

export type Side = "left" | "right";

export type ConfidenceBySide = Record<Side, number>;
// export type ScoreBySide = Record<Side, number>;

export type PlayedCard = {
    id: string;
    type: CardType;
    text: string;
    speaker: string;
    side: Side;
    confidence: number;
}
