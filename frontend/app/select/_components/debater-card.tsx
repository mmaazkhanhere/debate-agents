'use client';

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, Zap } from "lucide-react";
import { DebaterOption } from "../_types/type";

type Props = {
    step: 'debater1' | 'debater2';
    debater: DebaterOption;
    onSelect: (d: DebaterOption) => void;
};

const Stat = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) => (
    <div className="flex items-center justify-between">
        <div className="
      flex items-center gap-2 text-xs
      text-muted-foreground
      group-hover:text-foreground
      transition-colors
    ">
            {icon}
            <span>{label}</span>
        </div>

        <span className="text-sm font-bold tabular-nums text-foreground">
            {value}
        </span>
    </div>
);

const DebaterCard = ({ step, debater, onSelect }: Props) => {
    const isLeft = step === 'debater1';

    const accent = isLeft
        ? 'from-debater-left/80'
        : 'from-debater-right/80';

    return (
        <article
            itemScope
            itemType="https://schema.org/Person"
            className="h-full"
        >
            <Button
                type="button"
                variant="ghost"
                onClick={() => onSelect(debater)}
                aria-label={`Select ${debater.name} as ${isLeft ? 'first' : 'second'} debater`}
                className="
                    group relative w-full h-full p-0 text-left overflow-hidden rounded-2xl border bg-card transition-all duration-300 
                    hover:bg-primary/10 hover:ring-2 hover:ring-primary/40 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none 
                    focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
                {/* HERO IMAGE */}
                <div className="relative h-52 w-full overflow-hidden">
                    <Image
                        src={debater.avatar}
                        alt={`${debater.name} portrait`}
                        fill
                        priority
                        itemProp="image"
                        className="object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
                    />



                    {/* NAME + TITLE */}
                    <header className="absolute bottom-4 left-4 right-4">
                        <h3
                            className="text-lg font-bold leading-tight text-white drop-shadow-md"
                            itemProp="name"
                        >
                            {debater.name}
                        </h3>
                        <p
                            className="text-xs text-white/85 truncate"
                            itemProp="jobTitle"
                        >
                            {debater.title}
                        </p>
                    </header>
                </div>

                {/* CONTENT */}
                <div className="p-4 space-y-4">
                    {/* STATS */}
                    <section
                        aria-label="Debater statistics"
                        className="rounded-xl bg-secondary p-3 space-y-2"
                    >
                        <Stat
                            icon={<Brain className="w-3.5 h-3.5 transition-colors" />}
                            label="Logic"
                            value={debater.stats.logic}
                        />
                        <Stat
                            icon={<MessageCircle className="w-3.5 h-3.5 transition-colors" />}
                            label="Charisma"
                            value={debater.stats.charisma}
                        />
                        <Stat
                            icon={<Zap className="w-3.5 h-3.5 transition-colors" />}
                            label="Aggression"
                            value={debater.stats.aggression}
                        />
                    </section>

                    {/* META */}
                    <section
                        aria-label="Debater ideology and specialty"
                        className="flex flex-wrap items-center gap-2"
                    >
                        <Badge
                            className="text-xs border border-primary bg-secondary text-secondary-foreground"
                            itemProp="knowsAbout"
                        >
                            {debater.ideology}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="text-xs"
                        >
                            {debater.specialty}
                        </Badge>
                    </section>

                    {/* CTA — ALWAYS VISIBLE (A11Y FIX) */}
                    <footer className="
            flex items-center gap-1 pt-1 text-xs
            text-muted-foreground
            group-hover:text-foreground
            transition-colors
          ">
                        <Zap className="w-3 h-3" aria-hidden />
                        <span>Select debater</span>
                    </footer>
                </div>
            </Button>
        </article>
    );
};

export default DebaterCard;
