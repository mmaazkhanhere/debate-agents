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