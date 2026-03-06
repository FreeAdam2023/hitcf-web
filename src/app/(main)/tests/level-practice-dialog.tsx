"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePracticeStore } from "@/stores/practice-store";
import { startSpeedDrill } from "@/lib/api/speed-drill";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const result = await startSpeedDrill({ type, levels, count, dedup: true });

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
                return (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                      active
                        ? LEVEL_COLORS[level]
                        : "bg-secondary text-muted-foreground/60 hover:text-muted-foreground",
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count selection */}
          <div>
            <p className="mb-2.5 text-sm font-medium text-muted-foreground">{t("speedDrill.questionCount")}</p>
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
