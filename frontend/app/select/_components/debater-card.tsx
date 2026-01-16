'use client';

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DebaterOption } from "@/types/type_d";
import { Brain, MessageCircle, Zap } from "lucide-react";

type Props = {
    step: 'debater1' | 'debater2';
    debater: DebaterOption;
    onSelect: (d: DebaterOption) => void;
};

const Stat = ({
    icon,
    label,
    value
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {icon}
            {label}
        </div>
        <span className="text-sm font-bold tabular-nums">
            {value}
        </span>
    </div>
);

const DebaterCard = ({ step, debater, onSelect }: Props) => {
    const isLeft = step === 'debater1';

    const accent = isLeft
        ? 'from-debater-left/70 to-debater-left/10'
        : 'from-debater-right/70 to-debater-right/10';

    return (
        <article className="h-full">
            <Button
                type="button"
                variant="ghost"
                onClick={() => onSelect(debater)}
                className={[
                    'group relative w-full h-full p-0 text-left overflow-hidden',
                    'rounded-2xl border bg-card transition-all duration-300',
                    'hover:bg-primary/15 cursor-pointer',
                    'hover:-translate-y-1 hover:shadow-xl',

                ].join(' ')}
            >
                {/* HERO IMAGE */}
                <div className="relative h-52 w-full overflow-hidden">
                    <Image
                        src={debater.avatar}
                        alt={debater.name}
                        fill
                        priority
                        className="object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* GRADIENT OVERLAY */}
                    <div
                        aria-hidden
                        className={`absolute inset-0 bg-gradient-to-${accent}`}
                    />

                    {/* NAME + TITLE */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-bold leading-tight text-white drop-shadow">
                            {debater.name}
                        </h3>
                        <p className="text-xs text-white/80 truncate">
                            {debater.title}
                        </p>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-4 space-y-4">
                    {/* STATS */}
                    <div className="rounded-xl bg-secondary p-3 space-y-2">
                        <Stat
                            icon={<Brain className="w-3.5 h-3.5 text-muted-foreground" />}
                            label="Logic"
                            value={debater.stats.logic}
                        />
                        <Stat
                            icon={<MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                            label="Charisma"
                            value={debater.stats.charisma}
                        />
                        <Stat
                            icon={<Zap className="w-3.5 h-3.5 text-muted-foreground" />}
                            label="Aggression"
                            value={debater.stats.aggression}
                        />
                    </div>

                    {/* META */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className="text-xs border border-primary bg-secondary text-secondary-foreground">
                            {debater.ideology}
                        </Badge>
                        <Badge variant={"secondary"} className="text-xs">
                            {debater.specialty}
                        </Badge>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Zap className="w-3 h-3" />
                        Select debater
                    </div>
                </div>
            </Button>
        </article>
    );
};

export default DebaterCard;
