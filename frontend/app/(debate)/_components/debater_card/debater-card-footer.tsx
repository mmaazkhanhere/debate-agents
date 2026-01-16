import { cn } from "@/lib/utils";
import { Side } from "@/types/type_d";

type DebaterCardFooterProps = {
    speaker: string;
    side: Side;
    confidence: number;
}

const DebaterCardFooter = ({ speaker, side, confidence }: DebaterCardFooterProps) => {
    const activeDots = Math.ceil(confidence / 33);

    return (
        <div
            className={cn(
                "px-4 py-2 border-t bg-slate-900/50",
                side === "left"
                    ? "border-blue-500/20"
                    : "border-red-500/20"
            )}
        >
            <div className="flex items-center justify-between">
                <span
                    className={cn(
                        "text-xs font-medium",
                        side === "left"
                            ? "text-blue-400"
                            : "text-red-400"
                    )}
                >
                    {speaker}
                </span>

                <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span
                            key={i}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                i < activeDots
                                    ? side === "left"
                                        ? "bg-blue-400"
                                        : "bg-red-400"
                                    : "bg-slate-600"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DebaterCardFooter;
