"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Headphones, BookOpen, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePracticeStore } from "@/stores/practice-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  startSpeedDrill,
  getInProgressDrills,
  resumeSpeedDrill,
  abandonSpeedDrill,
  type InProgressAttempt,
} from "@/lib/api/speed-drill";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const COUNT_OPTIONS = [5, 10, 20, 50, 100, 0]; // 0 = all

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  A2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  B2: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  C1: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  C2: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
};

export function SpeedDrillConfig() {
  const t = useTranslations();
  const router = useRouter();
  const initPractice = usePracticeStore((s) => s.init);
  const canAccessPaid = useAuthStore((s) => {
    if (s.isLoading) return true; // Don't flash paywall while loading
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });

  const [type, setType] = useState("listening");
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(LEVELS));
  const [count, setCount] = useState(10);
  const [dedup, setDedup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState<InProgressAttempt[]>([]);
  const [resumingId, setResumingId] = useState<string | null>(null);

  // Load in-progress attempts on mount
  useEffect(() => {
    getInProgressDrills().then(setInProgress).catch(() => {});
  }, []);

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const allSelected = selectedLevels.size === LEVELS.length;
  const toggleSelectAll = () =>
    setSelectedLevels(allSelected ? new Set() : new Set(LEVELS));

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const levels = selectedLevels.size === LEVELS.length ? undefined : Array.from(selectedLevels);
      const result = await startSpeedDrill({ type, levels, count, dedup });

      if (!result.questions.length) {
        setError(t("speedDrill.noMoreQuestions"));
        setLoading(false);
        return;
      }

      initPractice(result.attempt_id, result.questions);
      router.push(`/practice/${result.attempt_id}`);
    } catch {
      setError(t("speedDrill.startFailed"));
      setLoading(false);
    }
  };

  const handleResume = async (attemptId: string) => {
    setResumingId(attemptId);
    try {
      const result = await resumeSpeedDrill(attemptId);
      initPractice(result.attempt_id, result.questions);
      router.push(`/practice/${result.attempt_id}`);
    } catch {
      setError(t("speedDrill.startFailed"));
      setResumingId(null);
    }
  };

  const handleAbandon = async (attemptId: string) => {
    try {
      await abandonSpeedDrill(attemptId);
      setInProgress((prev) => prev.filter((a) => a.attempt_id !== attemptId));
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("speedDrill.title")}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("speedDrill.subtitle")}
        </p>
      </div>

      {!canAccessPaid && (
        <UpgradeBanner
          variant="hero"
          title={t("speedDrill.upgradeBanner.title")}
          description={t("speedDrill.upgradeBanner.description")}
          features={[
            t("speedDrill.upgradeBanner.features.0"),
            t("speedDrill.upgradeBanner.features.1"),
            t("speedDrill.upgradeBanner.features.2"),
            t("speedDrill.upgradeBanner.features.3"),
          ]}
        />
      )}

      {/* In-progress attempts */}
      {inProgress.length > 0 && (
        <Card>
          <CardContent className="space-y-3 pt-5">
            <p className="text-sm font-medium">{t("speedDrill.inProgress")}</p>
            {inProgress.map((a) => (
              <div
                key={a.attempt_id}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
              >
                <div className="text-sm">
                  <span className="font-medium">
                    {a.answered_count}/{a.total}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {new Date(a.started_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAbandon(a.attempt_id)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    {t("speedDrill.abandon")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResume(a.attempt_id)}
                    disabled={resumingId === a.attempt_id}
                  >
                    <ArrowRight className="mr-1 h-3 w-3" />
                    {resumingId === a.attempt_id ? "..." : t("speedDrill.resume")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className={cn("overflow-hidden", !canAccessPaid && "pointer-events-none opacity-50")}>
        <CardContent className="space-y-6 pt-6">
          {/* Type selection */}
          <div>
            <p className="mb-3 text-sm font-medium">{t("speedDrill.selectType")}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("listening")}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                  type === "listening"
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/50"
                    : "border-transparent bg-secondary/50 hover:bg-secondary",
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  type === "listening" ? "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-400" : "bg-muted text-muted-foreground",
                )}>
                  <Headphones className="h-5 w-5" />
                </div>
                <span className={cn("text-sm font-medium", type === "listening" ? "text-foreground" : "text-muted-foreground")}>
                  {t("common.types.listening")}
                </span>
              </button>
              <button
                onClick={() => setType("reading")}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                  type === "reading"
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/50"
                    : "border-transparent bg-secondary/50 hover:bg-secondary",
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  type === "reading" ? "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400" : "bg-muted text-muted-foreground",
                )}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className={cn("text-sm font-medium", type === "reading" ? "text-foreground" : "text-muted-foreground")}>
                  {t("common.types.reading")}
                </span>
              </button>
            </div>
          </div>

          {/* Level selection */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">{t("speedDrill.selectLevel")}</p>
              <button
                onClick={toggleSelectAll}
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
            <p className="mb-3 text-sm font-medium">{t("speedDrill.questionCount")}</p>
            <div className="flex flex-wrap gap-2">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
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

          {/* Dedup toggle */}
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-sm font-medium">{t("speedDrill.dedup")}</span>
            <button
              type="button"
              role="switch"
              aria-checked={dedup}
              onClick={() => setDedup(!dedup)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                dedup ? "bg-primary" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                  dedup ? "translate-x-[18px]" : "translate-x-0.5",
                )}
              />
            </button>
          </label>
        </CardContent>
      </Card>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleStart}
        disabled={loading || selectedLevels.size === 0 || !canAccessPaid}
      >
        <Play className="mr-1.5 h-4 w-4" />
        {loading ? t("speedDrill.generating") : t("speedDrill.startDrill")}
      </Button>
    </div>
  );
}
