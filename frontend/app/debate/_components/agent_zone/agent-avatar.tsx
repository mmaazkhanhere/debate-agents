import { cn } from "@/lib/utils";

const AgentAvatar = ({ avatar, side }: { avatar: string; side: "left" | "right" }) => {
    const isImage = avatar.startsWith("/") || avatar.startsWith("http");

    return (
        <figure
            aria-hidden
            className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center text-3xl overflow-hidden bg-slate-800",
                "bg-linear-to-br border",
                side === "left"
                    ? "from-blue-900/50 to-blue-800/30 border-blue-500/30"
                    : "from-red-900/50 to-red-800/30 border-red-500/30"
            )}
        >
            {isImage ? (
                <img
                    src={avatar}
                    alt="Agent Avatar"
                    className="w-full h-full object-cover"
                />
            ) : (
                <span>{avatar}</span>
            )}
        </figure>
    );
}

export default AgentAvatar
