import { cn } from "@/lib/utils";
import ActiveTurnBadge from "./active-turn-badge";
import DebaterProfileCard from "./debater-profile-card";
import DebaterDeckIndicator from "./debater-deck-indicator";

type Props = {
    name: string;
    title: string;
    avatar: string;
    side: "left" | "right";
    isCurrentTurn: boolean;
    cardsRemaining: number;
    debaterConfidence: number;
    debaterScore: number;
}

const DebaterSection = (props: Props) => {
    const alignmentClass = props.side === "left"
        ? "items-center md:items-start"
        : "items-center md:items-end";

    return (
        <section
            aria-label={`Debater ${props.name}`}
            className={cn(
                "relative flex w-full flex-row items-center justify-center gap-3 md:w-auto md:flex-col md:justify-start",
                alignmentClass
            )}
        >
            <ActiveTurnBadge isCurrentTurn={props.isCurrentTurn} debaterSide={props.side} />

            <DebaterProfileCard {...props} />

            <DebaterDeckIndicator
                side={props.side}
                cardsRemaining={props.cardsRemaining}
                isCurrentTurn={props.isCurrentTurn}
            />
        </section>
    );
}

export default DebaterSection
