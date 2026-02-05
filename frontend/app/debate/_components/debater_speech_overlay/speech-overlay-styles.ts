export const speechAlignmentStyles = {
    left: {
        container: "justify-start",
        slideFrom: -20,
        text: "text-blue-400",
        border: "border-blue-500/30 bg-slate-900/80",
        caret: "bg-blue-400",
        dot: "bg-blue-400",
        accentLine: "bg-linear-to-r from-blue-500 to-transparent",
        accentGlow: "bg-linear-to-r from-transparent via-blue-500 to-transparent",
    },
    right: {
        container: "justify-end",
        slideFrom: 20,
        text: "text-red-400",
        border: "border-red-500/30 bg-slate-900/80",
        caret: "bg-red-400",
        dot: "bg-red-400",
        accentLine: "bg-linear-to-l from-red-500 to-transparent",
        accentGlow: "bg-linear-to-r from-transparent via-red-500 to-transparent",
    },
} as const;
