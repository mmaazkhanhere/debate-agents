import { Judge } from "@/types/debate";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-primary/20 text-primary border-primary/40';
    case 'Medium':
      return 'bg-primary/20 text-primary border-primary/40';
    case 'Hard':
      return 'bg-debater-right/20 text-debater-right border-debater-right/40';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export const countVotes = (judges: Judge[]) => {
  let left = 0;
  let right = 0;

  for (const j of judges) {
    if (j.vote === "left") left++;
    else right++;
  }

  return { left, right };
}
