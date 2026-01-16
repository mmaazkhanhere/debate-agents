import { Reaction } from "@/types/type_d";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-crowd-positive/20 text-crowd-positive border-crowd-positive/40';
    case 'Medium':
      return 'bg-primary/20 text-primary border-primary/40';
    case 'Hard':
      return 'bg-debater-right/20 text-debater-right border-debater-right/40';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export const pseudoRandom = (seed: number) => {
  return (Math.sin(seed) * 10000) % 1;
}

export const resolveReactionClass = (
  reaction: Reaction,
  memberId: number
): string => {
  if (!reaction) return "crowd-dot-neutral";

  const seed = (memberId * 13) % 10;

  if (reaction === "positive") {
    if (seed < 7) return "crowd-dot-positive";
    if (seed < 9) return "crowd-dot-neutral";
    return "crowd-dot-negative";
  }

  if (reaction === "negative") {
    if (seed < 6) return "crowd-dot-negative";
    if (seed < 8) return "crowd-dot-neutral";
    return "crowd-dot-positive";
  }

  return "crowd-dot-neutral";
}


export const getSideClasses = (isLeft: boolean) => {
  return {
    zone: isLeft ? "debater-zone-left" : "debater-zone-right",
    avatarShell: isLeft
      ? "bg-debater-left/20 border-2 border-debater-left"
      : "bg-debater-right/20 border-2 border-debater-right",
    glowText: isLeft ? "text-debater-left-glow" : "text-debater-right-glow",
    badge: isLeft
      ? "bg-debater-left/20 text-debater-left-glow"
      : "bg-debater-right/20 text-debater-right-glow",
    dot: isLeft ? "bg-debater-left" : "bg-debater-right",
    speakingShadow: isLeft
      ? "0 0 40px hsl(220 85% 55% / 0.6)"
      : "0 0 40px hsl(0 75% 50% / 0.6)",
  };
}