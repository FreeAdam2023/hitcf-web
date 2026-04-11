"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  fetchSmartPracticeCoverage,
  startSmartPractice,
  type SmartPracticeCoverage,
} from "@/lib/api/smart-practice";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  type: "listening" | "reading";
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-500",
  A2: "bg-green-500",
  B1: "bg-blue-500",
  B2: "bg-violet-500",
  C1: "bg-amber-500",
  C2: "bg-rose-500",
};

export function SmartPracticePanel({ type }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [coverage, setCoverage] = useState<SmartPracticeCoverage | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState<number | null>(null);
  const [showLevels, setShowLevels] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    fetchSmartPracticeCoverage(type)
      .then(setCoverage)
      .catch(() => {
        // Silent fail — coverage is optional UI
      })
      .finally(() => setLoading(false));
  }, [type, isAuthenticated]);

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

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <Button
            size="sm"
            onClick={() => handleStart(10)}
            disabled={starting !== null}
            variant="outline"
            className="border-violet-500/30 text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
          >
            {starting === 10 ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-1.5 h-4 w-4" />
            )}
            {t("smartPractice.quick")}
          </Button>
          <Button
            size="sm"
            onClick={() => handleStart(39)}
            disabled={starting !== null}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {starting === 39 ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-4 w-4" />
            )}
            {t("smartPractice.full")}
          </Button>
        </div>
      </div>

      {/* Coverage progress */}
      {isAuthenticated && coverage && coverage.pool_total > 0 && (
        <div className="mt-4 space-y-3">
          {/* Overall progress bar — clickable to toggle per-level breakdown */}
          <button
            type="button"
            onClick={() => setShowLevels((v) => !v)}
            className="w-full text-left space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground inline-flex items-center gap-1">
                {showLevels ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                {t("smartPractice.totalProgress")}
              </span>
              <span className="font-mono">
                {coverage.total_done} / {coverage.pool_total} ({coverage.pct}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted group-hover:bg-muted/70 transition-colors">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
                style={{ width: `${coverage.pct}%` }}
              />
            </div>
          </button>

          {/* Per-level breakdown — collapsed by default */}
          {showLevels && (
            <div className="grid grid-cols-6 gap-1.5">
              {coverage.levels.map((lvl) => (
                <div key={lvl.level} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold">{lvl.level}</span>
                    <span className="text-muted-foreground">
                      {lvl.done}/{lvl.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${LEVEL_COLORS[lvl.level] || "bg-muted-foreground"} transition-all`}
                      style={{ width: `${lvl.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-3 text-xs text-muted-foreground">
          <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
        </div>
      )}
    </div>
  );
}
