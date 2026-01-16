import { cn } from "@/lib/utils";
import TurnIndicator from "./turn-indicator";
import AgentCard from "./agent-card";
import AgentCardDeck from "./agent-card-deck";

type Props = {
    name: string;
    title: string;
    avatar: string;
    side: "left" | "right";
    isActive: boolean;
    cardsRemaining: number;
    confidence: number;
    score: number;
}

const AgentZone = (props: Props) => {
    const alignment = props.side === "left" ? "items-start" : "items-end";

    return (
        <section
            aria-label={`Debater ${props.name}`}
            className={cn("relative flex flex-col gap-3", alignment)}
        >
            <TurnIndicator isActive={props.isActive} side={props.side} />

            <AgentCard {...props} />

            <AgentCardDeck
                side={props.side}
                cardsRemaining={props.cardsRemaining}
                isActive={props.isActive}
            />
        </section>
    );
}

export default AgentZone