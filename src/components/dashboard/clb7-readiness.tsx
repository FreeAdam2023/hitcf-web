"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLB7_TARGET } from "@/lib/constants";
import { useTranslations } from "next-intl";

interface CLB7ReadinessProps {
  listeningAccuracy: number;
  readingAccuracy: number;
  totalAttempts: number;
  streakDays: number;
}

function getBarColor(accuracy: number): string {
  if (accuracy >= CLB7_TARGET) return "[&>div]:bg-green-500";
  if (accuracy >= 0.6) return "[&>div]:bg-blue-500";
  return "[&>div]:bg-orange-500";
}

function getStatusText(accuracy: number, t: (key: string, values?: Record<string, string | number>) => string): { text: string; color: string } {
  if (accuracy >= CLB7_TARGET) {
    return { text: t("dashboard.readiness.reached"), color: "text-green-600 dark:text-green-400" };
  }
  const gap = Math.round((CLB7_TARGET - accuracy) * 100);
  if (accuracy >= 0.6) {
    return { text: t("dashboard.readiness.gap", { gap }), color: "text-blue-600 dark:text-blue-400" };
  }
  return { text: t("dashboard.readiness.keepGoing"), color: "text-orange-600 dark:text-orange-400" };
}

function getOverallReadiness(listening: number, reading: number, t: (key: string) => string): {
  pct: number;
  label: string;
  color: string;
} {
  const avg = (listening + reading) / 2;
  const readiness = Math.min(Math.round((avg / CLB7_TARGET) * 100), 100);

  if (readiness >= 100) return { pct: readiness, label: t("dashboard.readiness.reached"), color: "text-green-600 dark:text-green-400" };
  if (readiness >= 80) return { pct: readiness, label: t("dashboard.readiness.nearTarget"), color: "text-blue-600 dark:text-blue-400" };
  return { pct: readiness, label: t("dashboard.readiness.needEffort"), color: "text-orange-600 dark:text-orange-400" };
}

function getSummary(listening: number, reading: number, t: (key: string, values?: Record<string, string | number>) => string): string {
  const lOk = listening >= CLB7_TARGET;
  const rOk = reading >= CLB7_TARGET;

  if (lOk && rOk) return t("dashboard.readiness.summaryBothReached");
  if (lOk) {
    const gap = Math.round((CLB7_TARGET - reading) * 100);
    return t("dashboard.readiness.summaryListeningReached", { gap });
  }
  if (rOk) {
    const gap = Math.round((CLB7_TARGET - listening) * 100);
    return t("dashboard.readiness.summaryReadingReached", { gap });
  }
  return t("dashboard.readiness.summaryKeepGoing");
}

function getStreakMessage(days: number, t: (key: string, values?: Record<string, string | number>) => string): { text: string; color: string } {
  if (days >= 30) return { text: t("dashboard.readiness.streakLegend", { days }), color: "text-orange-500" };
  if (days >= 7) return { text: t("dashboard.readiness.streakWeek", { days }), color: "text-orange-500" };
  if (days >= 3) return { text: t("dashboard.readiness.streakDays", { days }), color: "text-orange-500" };
  if (days >= 1) return { text: t("dashboard.readiness.streakToday"), color: "text-orange-400" };
  return { text: t("dashboard.readiness.streakNone"), color: "text-muted-foreground" };
}

function getStreakMilestone(days: number, t: (key: string) => string): string | null {
  if (days >= 30) return t("dashboard.readiness.milestone30");
  if (days >= 14) return t("dashboard.readiness.milestone14");
  if (days >= 7) return t("dashboard.readiness.milestone7");
  if (days >= 3) return t("dashboard.readiness.milestone3");
  return null;
}

export function CLB7Readiness({
  listeningAccuracy,
  readingAccuracy,
  totalAttempts,
  streakDays,
}: CLB7ReadinessProps) {
  const t = useTranslations();
  const overall = getOverallReadiness(listeningAccuracy, readingAccuracy, t);
  const streak = getStreakMessage(streakDays, t);
  const milestone = getStreakMilestone(streakDays, t);
  const categories = [
    { label: t("dashboard.readiness.listening"), accuracy: listeningAccuracy },
    { label: t("dashboard.readiness.reading"), accuracy: readingAccuracy },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-primary/40" />
      <CardContent className="pt-6">
        {/* Hero: overall readiness */}
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-primary">{overall.pct}%</div>
              <div className="text-[10px] font-medium text-primary/70">CLB 7</div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary shrink-0" />
              <h2 className="text-lg font-bold">{t("dashboard.readiness.title")}</h2>
            </div>
            <p className={cn("mt-0.5 text-sm font-medium", overall.color)}>
              {overall.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {getSummary(listeningAccuracy, readingAccuracy, t)}
            </p>
          </div>
        </div>

        {/* Quick stats with streak fire */}
        <div className="mt-5 flex gap-4 border-t pt-4 text-center">
          <div className="flex-1">
            <div className="text-xl font-bold">{totalAttempts}</div>
            <div className="text-xs text-muted-foreground">{t("dashboard.readiness.practiceCount")}</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-center gap-1">
              <Flame className={cn(
                "h-5 w-5",
                streakDays > 0 ? "text-orange-500 animate-pulse" : "text-muted-foreground/40",
              )} />
              <span className="text-xl font-bold">{streakDays}</span>
            </div>
            <div className={cn("text-xs font-medium", streak.color)}>
              {streakDays > 0 ? streak.text : t("dashboard.readiness.startStreak")}
            </div>
            {milestone && (
              <div className="mt-0.5 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {milestone}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{Math.round(listeningAccuracy * 100)}%</div>
            <div className="text-xs text-muted-foreground">{t("dashboard.readiness.listening")}</div>
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{Math.round(readingAccuracy * 100)}%</div>
            <div className="text-xs text-muted-foreground">{t("dashboard.readiness.reading")}</div>
          </div>
        </div>

        {/* Per-category progress */}
        <div className="mt-5 space-y-3">
          {categories.map((cat) => {
            const status = getStatusText(cat.accuracy, t);
            const pctValue = Math.round(cat.accuracy * 100);
            return (
              <div key={cat.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{pctValue}%</span>
                    <span className={cn("text-xs font-medium", status.color)}>
                      {status.text}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Progress
                    value={Math.min(pctValue, 100)}
                    className={cn("h-2.5", getBarColor(cat.accuracy))}
                  />
                  {/* Target line at 78% */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-foreground/40"
                    style={{ left: `${CLB7_TARGET * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
