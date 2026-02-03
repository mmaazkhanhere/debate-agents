'use client';

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { styleItems } from "@/constants/select-constants";
import { DebaterProfile } from "../_types/type";

type Props = {
    selectionStep: 'debater1' | 'debater2';
    debater: DebaterProfile;
    onSelectDebater: (d: DebaterProfile) => void;
    selected?: boolean;
};


const DebaterCard = ({
    selectionStep,
    debater,
    onSelectDebater,
    selected = false,
}: Props) => {
    const isLeft = selectionStep === 'debater1';

    return (
        <article
            itemScope
            className="h-full"
        >
            <section
                role="button"
                tabIndex={0}
                onClick={() => onSelectDebater(debater)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectDebater(debater);
                    }
                }}
                aria-label={`Select ${debater.name} as ${isLeft ? 'first' : 'second'} debater`}
                className={`
                    group relative w-full h-full cursor-pointer
                    p-0 text-left overflow-hidden rounded-2xl border bg-card
                    transition-all duration-300
                    hover:bg-primary/10
                    hover:ring-2 hover:ring-primary/40
                    hover:shadow-xl
                    hover:-translate-y-1
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                    active:scale-[0.98]
                    ${selected ? 'ring-2 ring-primary shadow-[0_0_0_3px_rgba(59,130,246,0.25)]' : ''}
                `}
            >
                {/* Persona accent strip */}
                <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

                <div className="flex h-full w-full flex-col lg:flex-row">
                    {/* IMAGE */}
                    <div
                        className="relative w-full h-[32%] min-h-[200px] overflow-hidden lg:h-full lg:w-[45%]"
                    >
                        <Image
                            src={debater.avatar}
                            alt={`${debater.name} portrait`}
                            fill
                            priority
                            itemProp="image"
                            className="object-cover scale-100 saturate-90 contrast-105 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div
                            className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent"
                            aria-hidden
                        />
                    </div>

                    {/* CONTENT */}
                    <div className="flex flex-1 flex-col gap-5 p-5 lg:p-6">
                        {/* HEADER */}
                        <header className="space-y-1">
                            <h3
                                className="text-2xl font-semibold leading-tight"
                                itemProp="name"
                            >
                                {debater.name}
                            </h3>
                            <p
                                className="text-sm text-muted-foreground"
                                itemProp="jobTitle"
                            >
                                {debater.title}
                            </p>
                        </header>

                        {/* STATS */}
                        <section
                            aria-label="Persona style breakdown"
                            className="space-y-3 rounded-xl border bg-secondary/40 p-4"
                        >
                            {styleItems.map((item) => (
                                <StatBar
                                    key={item.key}
                                    label={item.label}
                                    value={debater.stats[item.key]}
                                    color={item.color}
                                    track={item.track}
                                />
                            ))}
                        </section>

                        {/* TRAITS */}
                        <section aria-label="Signature traits" className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                Signature traits
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    className="text-xs border border-primary/30 bg-primary/10 text-foreground"
                                    itemProp="knowsAbout"
                                >
                                    {debater.ideology}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {debater.specialty}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {debater.catchphrase}
                                </Badge>
                            </div>
                        </section>

                        {/* FOOTER CTA */}
                        <footer
                            className={`
                                mt-auto flex items-center gap-2 text-sm font-semibold
                                transition-colors
                                ${selected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                            `}
                        >
                            <CheckCircle2 className="h-4 w-4" aria-hidden />
                            <span>{selected ? 'Selected' : 'Select debater'}</span>
                        </footer>
                    </div>
                </div>
            </section>
        </article>
    );
}


function StatBar({
    label,
    value,
    color,
    track,
}: {
    label: string;
    value: number;
    color: string;
    track: string;
}) {
    const clamped = Math.min(100, Math.max(0, value));

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{label}</span>
                <span className="hidden lg:inline font-semibold tabular-nums text-foreground">
                    {clamped}
                </span>
            </div>

            <div className={`h-1.5 lg:h-2 w-full rounded-full ${track}`}>
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
        </div>
    );
}

export default DebaterCard;