"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startSmartPractice } from "@/lib/api/smart-practice";
import { startSpeedDrill } from "@/lib/api/speed-drill";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  type: "listening" | "reading";
}

const LEVELS: Array<{ level: string; color: string }> = [
  { level: "A1", color: "hover:border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { level: "A2", color: "hover:border-green-500/40 hover:bg-green-500/10 text-green-700 dark:text-green-400" },
  { level: "B1", color: "hover:border-blue-500/40 hover:bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { level: "B2", color: "hover:border-violet-500/40 hover:bg-violet-500/10 text-violet-700 dark:text-violet-400" },
  { level: "C1", color: "hover:border-amber-500/40 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { level: "C2", color: "hover:border-rose-500/40 hover:bg-rose-500/10 text-rose-700 dark:text-rose-400" },
];

const LEVEL_DRILL_COUNT = 20;

export function SmartPracticePanel({ type }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [starting, setStarting] = useState<number | null>(null);
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [drillLoading, setDrillLoading] = useState<string | null>(null);

  const handleStart = async (size: number) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setStarting(size);
    try {
      const res = await startSmartPractice({ type, size });
      router.push(`/practice/${res.attempt_id}`);
    } catch {
      toast.error(t("common.errors.generic"));
      setStarting(null);
    }
  };

  const handleLevelStart = async (level: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setDrillLoading(level);
    try {
      const res = await startSpeedDrill({
        type,
        levels: [level],
        count: LEVEL_DRILL_COUNT,
        dedup: true,
      });
      if (res.attempt_id) {
        router.push(`/practice/${res.attempt_id}`);
      } else {
        toast.error(t("speedDrill.noMoreQuestions"));
        setDrillLoading(null);
      }
    } catch {
      toast.error(t("common.errors.generic"));
      setDrillLoading(null);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-purple-500/5 p-5 dark:border-violet-500/30">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">{t("smartPractice.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("smartPractice.subtitle")}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 ml-auto">
          <Button
            onClick={() => handleStart(10)}
            disabled={starting !== null}
            className="bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 h-10 px-5 text-sm font-semibold"
          >
            {starting === 10 ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-1.5 h-4 w-4" />
            )}
            {t("smartPractice.quick")}
          </Button>
          <button
            type="button"
            onClick={() => handleStart(39)}
            disabled={starting !== null}
            className="text-xs text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 underline-offset-2 hover:underline transition-colors disabled:opacity-50"
          >
            {starting === 39 ? (
              <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
            ) : null}
            {t("smartPractice.fullLink")}
          </button>
        </div>
      </div>

      {/* Collapsible "filter by level" — secondary path, not a parallel section */}
      <div className="mt-4 border-t border-violet-500/10 pt-3">
        <button
          type="button"
          onClick={() => setLevelsOpen((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {levelsOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span>{t("smartPractice.byLevel")}</span>
        </button>
        {levelsOpen && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {LEVELS.map(({ level, color }) => (
              <Button
                key={level}
                variant="outline"
                size="sm"
                onClick={() => handleLevelStart(level)}
                disabled={drillLoading !== null}
                className={`h-8 min-w-[52px] border-2 font-semibold ${color}`}
              >
                {drillLoading === level ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  level
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
