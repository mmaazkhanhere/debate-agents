import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

type DebaterCardHeaderProps = {
    icon: typeof Flame;
    label: string;
    gradient: string;
    confidence: number;
}

const DebaterCardHeader = ({
    icon: Icon,
    label,
    gradient,
    confidence,
}: DebaterCardHeaderProps) => {
    return (
        <div
            className={cn(
                "px-4 py-2 flex items-center justify-between bg-linear-to-r",
                gradient
            )}
        >
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white tracking-wider">
                    {label}
                </span>
            </div>

            <div className="flex items-center gap-1">
                <span className="text-[10px] text-white/80">PWR</span>
                <span className="text-xs font-bold text-white">
                    {confidence}
                </span>
            </div>
        </div>
    );
}

export default DebaterCardHeader;
