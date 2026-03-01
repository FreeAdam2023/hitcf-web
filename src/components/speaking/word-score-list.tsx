"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { WordScore } from "@/hooks/use-speech-assessment";

function wordColor(score: number, errorType: string): string {
  if (errorType === "Omission") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
  if (errorType === "Insertion") return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
  if (score >= 80) return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
  if (score >= 60) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400";
  return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
}

function errorLabel(errorType: string): string | null {
  if (errorType === "Mispronunciation") return "Mispron.";
  if (errorType === "Omission") return "Omitted";
  if (errorType === "Insertion") return "Extra";
  return null;
}

export function WordScoreList({ words }: { words: WordScore[] }) {
  const t = useTranslations("speakingPractice");

  if (words.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {t("wordByWord")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {words.map((w, i) => {
          const label = errorLabel(w.errorType);
          return (
            <span
              key={i}
              className={cn(
                "group relative inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors",
                wordColor(w.accuracy, w.errorType),
              )}
              title={`${w.word}: ${w.accuracy}% ${w.errorType !== "None" ? `(${w.errorType})` : ""}`}
            >
              {w.errorType === "Omission" ? (
                <span className="line-through">{w.word}</span>
              ) : (
                w.word
              )}
              {label && (
                <span className="text-[10px] opacity-70">{label}</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-green-500" /> {t("legendGood")}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-yellow-500" /> {t("legendFair")}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> {t("legendPoor")}
        </span>
      </div>
    </div>
  );
}
