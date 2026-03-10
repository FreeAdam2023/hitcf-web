"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePracticeStore } from "@/stores/practice-store";
import { startSpeedDrill, fetchLevelStats } from "@/lib/api/speed-drill";
import type { LevelStats } from "@/lib/api/speed-drill";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const COUNT_OPTIONS = [10, 30, 0]; // 0 = all

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  A2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  B2: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  C1: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  C2: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
};

interface LevelPracticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "listening" | "reading";
}

export function LevelPracticeDialog({ open, onOpenChange, type }: LevelPracticeDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const initPractice = usePracticeStore((s) => s.init);

  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(LEVELS));
  const [count, setCount] = useState(10);
  const [includeDone, setIncludeDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LevelStats | null>(null);

  // Fetch level stats when dialog opens
  useEffect(() => {
    if (open) {
      fetchLevelStats(type).then(setStats).catch(() => setStats(null));
    }
  }, [open, type]);

  // Compute totals for selected levels
  const selectedTotal = stats
    ? Array.from(selectedLevels).reduce((sum, lvl) => {
        const s = stats.levels[lvl];
        return sum + (s ? s.total : 0);
      }, 0)
    : null;

  const selectedCompleted = stats
    ? Array.from(selectedLevels).reduce((sum, lvl) => {
        const s = stats.levels[lvl];
        return sum + (s ? s.completed : 0);
      }, 0)
    : null;

  const selectedRemaining =
    selectedTotal !== null && selectedCompleted !== null
      ? selectedTotal - selectedCompleted
      : null;

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const allSelected = selectedLevels.size === LEVELS.length;

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const levels = allSelected ? undefined : Array.from(selectedLevels);
      const result = await startSpeedDrill({ type, levels, count, dedup: !includeDone });

      if (!result.questions.length) {
        setError(t("speedDrill.noMoreQuestions"));
        setLoading(false);
        return;
      }

      initPractice(result.attempt_id, result.questions);
      onOpenChange(false);
      router.push(`/practice/${result.attempt_id}`);
    } catch {
      setError(t("speedDrill.startFailed"));
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("speedDrill.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Level selection */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{t("speedDrill.selectLevel")}</p>
              <button
                onClick={() => setSelectedLevels(allSelected ? new Set() : new Set(LEVELS))}
                className="text-xs text-primary hover:underline"
              >
                {allSelected ? t("speedDrill.deselectAll") : t("speedDrill.selectAll")}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => {
                const active = selectedLevels.has(level);
                const levelStats = stats?.levels[level];
                const completed = levelStats?.completed ?? 0;
                const total = levelStats?.total ?? 0;
                const allDone = total > 0 && completed >= total;

                return (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={cn(
                      "relative rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                      active
                        ? LEVEL_COLORS[level]
                        : "bg-secondary text-muted-foreground/60 hover:text-muted-foreground",
                    )}
                  >
                    {level}
                    {stats && total > 0 && (
                      <span className={cn(
                        "block text-[10px] font-normal leading-tight mt-0.5",
                        allDone ? "text-green-600 dark:text-green-400" : "opacity-70",
                      )}>
                        {completed}/{total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Include done toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("speedDrill.includeDone")}</span>
            <button
              role="switch"
              aria-checked={includeDone}
              onClick={() => setIncludeDone((v) => !v)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
                includeDone ? "bg-primary" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform mt-0.5",
                  includeDone ? "translate-x-[18px]" : "translate-x-0.5",
                )}
              />
            </button>
          </div>

          {/* Count selection */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{t("speedDrill.questionCount")}</p>
              {selectedRemaining !== null && selectedTotal !== null && (
                <span className="text-xs text-muted-foreground">
                  {includeDone
                    ? t("speedDrill.totalCount", { count: selectedTotal })
                    : t("speedDrill.remainingCount", { count: selectedRemaining })}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={cn(
                    "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
                    count === n
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n === 0 ? t("speedDrill.allQuestions") : t("speedDrill.questionsLabel", { count: n })}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={loading || selectedLevels.size === 0}
          >
            <Play className="mr-1.5 h-4 w-4" />
            {loading ? t("speedDrill.generating") : t("speedDrill.startDrill")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
