import { cn } from "@/lib/utils";

const AgentAvatar = ({ avatar, side }: { avatar: string; side: "left" | "right" }) => {
    return (
        <figure
            aria-hidden
            className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center text-3xl",
                "bg-linear-to-br border",
                side === "left"
                    ? "from-blue-900/50 to-blue-800/30 border-blue-500/30"
                    : "from-red-900/50 to-red-800/30 border-red-500/30"
            )}
        >
            {avatar}
        </figure>
    );
}

export default AgentAvatar
