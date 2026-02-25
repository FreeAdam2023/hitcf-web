import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  A2: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  B1: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  B2: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  C1: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  C2: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

interface LevelBadgeProps {
  level: string;
  size?: "sm" | "default";
  className?: string;
}

export function LevelBadge({ level, size = "default", className }: LevelBadgeProps) {
  const upperLevel = level.toUpperCase();
  const colorClass = LEVEL_COLORS[upperLevel] ?? "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-semibold",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        colorClass,
        className,
      )}
    >
      {upperLevel}
    </span>
  );
}
