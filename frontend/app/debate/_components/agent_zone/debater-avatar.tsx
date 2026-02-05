import Image from "next/image";
import { cn } from "@/lib/utils";

type DebaterAvatarProps = {
    src: string;
    side: "left" | "right";
};

const DebaterAvatar = ({ src, side }: DebaterAvatarProps) => {
    const isLeft = side === "left";

    return (
        <div
            aria-hidden
            className={cn(
                "relative w-16 h-16 rounded-xl overflow-hidden",
                "bg-slate-800 bg-linear-to-br border",
                isLeft
                    ? "from-blue-900/50 to-blue-800/30 border-blue-500/30"
                    : "from-red-900/50 to-red-800/30 border-red-500/30"
            )}
        >
            <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                priority={false}
            />
        </div>
    );
};

export default DebaterAvatar;
