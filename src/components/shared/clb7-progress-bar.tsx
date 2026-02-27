"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getStatsOverview, type StatsOverview } from "@/lib/api/stats";
import { useAuthStore } from "@/stores/auth-store";
import { CLB7_TARGET } from "@/lib/constants";
import { useTranslations } from "next-intl";

function getBarColor(accuracy: number): string {
  if (accuracy >= CLB7_TARGET) return "[&>div]:bg-green-500";
  if (accuracy >= 0.6) return "[&>div]:bg-blue-500";
  return "[&>div]:bg-orange-500";
}

function getStatusLabel(accuracy: number): { gap: number; reached: boolean; color: string } {
  if (accuracy >= CLB7_TARGET) {
    return { gap: 0, reached: true, color: "text-green-600 dark:text-green-400" };
  }
  const gap = Math.round((CLB7_TARGET - accuracy) * 100);
  return { gap, reached: false, color: "text-muted-foreground" };
}

export function CLB7ProgressBar() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<StatsOverview | null>(null);

  useEffect(() => {
    if (!user) return;
    getStatsOverview()
      .then(setStats)
      .catch((err) => { console.warn("Stats fetch failed:", err); });
  }, [user]);

  if (!stats || stats.total_attempts === 0) return null;

  const listening = stats.listening_accuracy;
  const reading = stats.reading_accuracy;
  const listeningPct = Math.round(listening * 100);
  const readingPct = Math.round(reading * 100);
  const listeningStatus = getStatusLabel(listening);
  const readingStatus = getStatusLabel(reading);

  return (
    <div className="mb-4 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{t('clb7Progress.target')}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{t('clb7Progress.listening', { pct: listeningPct })}</span>
            <span className={cn("font-medium", listeningStatus.color)}>
              {listeningStatus.reached ? t('clb7Progress.reached') : t('clb7Progress.gap', { gap: listeningStatus.gap })}
            </span>
          </div>
          <div className="relative">
            <Progress
              value={Math.min(listeningPct, 100)}
              className={cn("h-2", getBarColor(listening))}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-foreground/30"
              style={{ left: `${CLB7_TARGET * 100}%` }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{t('clb7Progress.reading', { pct: readingPct })}</span>
            <span className={cn("font-medium", readingStatus.color)}>
              {readingStatus.reached ? t('clb7Progress.reached') : t('clb7Progress.gap', { gap: readingStatus.gap })}
            </span>
          </div>
          <div className="relative">
            <Progress
              value={Math.min(readingPct, 100)}
              className={cn("h-2", getBarColor(reading))}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-foreground/30"
              style={{ left: `${CLB7_TARGET * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
