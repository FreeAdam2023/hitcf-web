"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronRight, Users, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonGrid } from "@/components/shared/skeleton-card";
import { ErrorState } from "@/components/shared/error-state";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { useAuthStore } from "@/stores/auth-store";
import { AccuracyTrendChart } from "@/components/dashboard/accuracy-trend-chart";
import { DailyPracticeChart } from "@/components/dashboard/daily-practice-chart";
import { LevelRadarChart } from "@/components/dashboard/level-radar-chart";
import { CLB7Readiness } from "@/components/dashboard/clb7-readiness";
import { getStatsOverview, getStatsHistory } from "@/lib/api/stats";
import type { StatsOverview } from "@/lib/api/stats";
import type { StatsHistory } from "@/lib/api/types";
import { estimateTcfLevelFromRatio } from "@/lib/tcf-levels";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const LEVEL_BAR_COLORS: Record<string, string> = {
  A1: "bg-emerald-500",
  A2: "bg-emerald-400",
  B1: "bg-blue-400",
  B2: "bg-blue-500",
  C1: "bg-violet-400",
  C2: "bg-violet-500",
};

export function DashboardView() {
  const t = useTranslations();
  const router = useRouter();
  const canAccessPaid = useAuthStore((s) => {
    if (s.isLoading) return true;
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [history, setHistory] = useState<StatsHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getStatsOverview()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    getStatsHistory()
      .then(setHistory)
      .catch(() => setHistory(null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("dashboard.title")}
          </span>
        </h1>
        <SkeletonGrid count={2} />
      </div>
    );
  }

  if (error || !stats) {
    return <ErrorState message={t("dashboard.loadError")} onRetry={load} />;
  }

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  const hasData = stats.total_attempts > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
          {t("dashboard.title")}
        </span>
      </h1>

      {/* Hero: CLB 7 Readiness */}
      <CLB7Readiness
        listeningAccuracy={stats.listening_accuracy}
        readingAccuracy={stats.reading_accuracy}
        totalAttempts={stats.total_attempts}
        streakDays={stats.streak_days}
      />

      {/* Upgrade nudge for free users */}
      {!canAccessPaid && (
        <UpgradeBanner
          title={t("dashboard.upgradeBanner.title")}
          description={t("dashboard.upgradeBanner.description")}
        />
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/tests">{hasData ? t("dashboard.continuePractice") : t("dashboard.startPractice")}</Link>
        </Button>
        <Button variant="outline" className="gap-1.5" asChild>
          <a href="https://t.me/hitcf_group" target="_blank" rel="noopener noreferrer">
            <Users className="h-4 w-4" />
            {t("dashboard.joinStudyGroup")}
          </a>
        </Button>
      </div>

      {/* Charts */}
      {history && hasData && (
        <AccuracyTrendChart data={history.accuracy_trend} />
      )}

      {/* Expandable details */}
      {hasData && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {showDetails ? t("dashboard.hideDetails") : t("dashboard.showDetails")}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", showDetails && "rotate-180")}
            />
          </button>

          {showDetails && (
            <div className="space-y-6">
              {/* Charts row */}
              {history && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <DailyPracticeChart data={history.daily_practice} />
                  <LevelRadarChart data={history.level_radar} />
                </div>
              )}

              {/* Level distribution — card rows instead of table */}
              {Object.keys(stats.by_level).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("dashboard.levelDistribution")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(stats.by_level)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([level, data]) => {
                        const accuracy = Math.round(data.accuracy * 100);
                        return (
                          <div key={level} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono font-bold text-xs">
                                  {level}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {t("dashboard.levelScore", { correct: data.correct, answered: data.answered })}
                                </span>
                              </div>
                              <span className={cn(
                                "text-sm font-semibold tabular-nums",
                                accuracy >= 78 ? "text-green-600 dark:text-green-400" : accuracy >= 50 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400",
                              )}>
                                {pct(data.accuracy)}
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn("h-full rounded-full transition-all", LEVEL_BAR_COLORS[level] || "bg-primary")}
                                style={{ width: `${Math.min(accuracy, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              )}

              {/* Recent attempts — card rows instead of table */}
              {stats.recent_attempts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("dashboard.recentRecords")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {stats.recent_attempts.map((a) => {
                      const tcf = a.score != null ? estimateTcfLevelFromRatio(a.score, a.total) : null;
                      const scorePct = a.score != null && a.total > 0 ? Math.round((a.score / a.total) * 100) : null;
                      return (
                        <div
                          key={a.id}
                          role="link"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push(`/results/${a.id}`); }}
                          className="group flex items-center gap-3 rounded-lg p-2.5 -mx-2.5 cursor-pointer transition-colors hover:bg-accent/50"
                          onClick={() => router.push(`/results/${a.id}`)}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Trophy className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{t(`common.modes.${a.mode}`)}</span>
                              <span className="text-muted-foreground">
                                {a.score ?? "-"}/{a.total}
                                {scorePct !== null && <span className="ml-1">({scorePct}%)</span>}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {a.completed_at
                                ? new Date(a.completed_at).toLocaleDateString("zh-CN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </p>
                          </div>
                          {tcf && (
                            <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", tcf.color, tcf.bgColor)}>
                              {tcf.level}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
