"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLB7_TARGET } from "@/lib/constants";

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

function getStatusText(accuracy: number): { text: string; color: string } {
  if (accuracy >= CLB7_TARGET) {
    return { text: "已达标 ✓", color: "text-green-600 dark:text-green-400" };
  }
  const gap = Math.round((CLB7_TARGET - accuracy) * 100);
  if (accuracy >= 0.6) {
    return { text: `还差 ${gap}%`, color: "text-blue-600 dark:text-blue-400" };
  }
  return { text: "继续加油", color: "text-orange-600 dark:text-orange-400" };
}

function getOverallReadiness(listening: number, reading: number): {
  pct: number;
  label: string;
  color: string;
} {
  const avg = (listening + reading) / 2;
  const readiness = Math.min(Math.round((avg / CLB7_TARGET) * 100), 100);

  if (readiness >= 100) return { pct: readiness, label: "已达标", color: "text-green-600 dark:text-green-400" };
  if (readiness >= 80) return { pct: readiness, label: "接近目标", color: "text-blue-600 dark:text-blue-400" };
  return { pct: readiness, label: "继续努力", color: "text-orange-600 dark:text-orange-400" };
}

function getSummary(listening: number, reading: number): string {
  const lOk = listening >= CLB7_TARGET;
  const rOk = reading >= CLB7_TARGET;

  if (lOk && rOk) return "听力和阅读均已达标，继续保持！";
  if (lOk) {
    const gap = Math.round((CLB7_TARGET - reading) * 100);
    return `听力已达标，阅读还差 ${gap}% 就能达到 CLB 7！`;
  }
  if (rOk) {
    const gap = Math.round((CLB7_TARGET - listening) * 100);
    return `阅读已达标，听力还差 ${gap}% 就能达到 CLB 7！`;
  }
  return "坚持练习，向 CLB 7 发起冲刺！";
}

function getStreakMessage(days: number): { text: string; color: string } {
  if (days >= 30) return { text: `${days} 天！你就是传奇`, color: "text-orange-500" };
  if (days >= 7) return { text: `连续 ${days} 天，别让火灭了！`, color: "text-orange-500" };
  if (days >= 3) return { text: `连续 ${days} 天，保持住！`, color: "text-orange-500" };
  if (days >= 1) return { text: "今天已练习，明天继续", color: "text-orange-400" };
  return { text: "今天还没练习哦", color: "text-muted-foreground" };
}

function getStreakMilestone(days: number): string | null {
  if (days >= 30) return "30 天成就";
  if (days >= 14) return "14 天成就";
  if (days >= 7) return "7 天成就";
  if (days >= 3) return "3 天成就";
  return null;
}

export function CLB7Readiness({
  listeningAccuracy,
  readingAccuracy,
  totalAttempts,
  streakDays,
}: CLB7ReadinessProps) {
  const overall = getOverallReadiness(listeningAccuracy, readingAccuracy);
  const streak = getStreakMessage(streakDays);
  const milestone = getStreakMilestone(streakDays);
  const categories = [
    { label: "听力", accuracy: listeningAccuracy },
    { label: "阅读", accuracy: readingAccuracy },
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
              <h2 className="text-lg font-bold">CLB 7 准备度</h2>
            </div>
            <p className={cn("mt-0.5 text-sm font-medium", overall.color)}>
              {overall.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {getSummary(listeningAccuracy, readingAccuracy)}
            </p>
          </div>
        </div>

        {/* Quick stats with streak fire */}
        <div className="mt-5 flex gap-4 border-t pt-4 text-center">
          <div className="flex-1">
            <div className="text-xl font-bold">{totalAttempts}</div>
            <div className="text-xs text-muted-foreground">练习次数</div>
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
              {streakDays > 0 ? streak.text : "开始连续打卡"}
            </div>
            {milestone && (
              <div className="mt-0.5 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {milestone}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{Math.round(listeningAccuracy * 100)}%</div>
            <div className="text-xs text-muted-foreground">听力</div>
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{Math.round(readingAccuracy * 100)}%</div>
            <div className="text-xs text-muted-foreground">阅读</div>
          </div>
        </div>

        {/* Per-category progress */}
        <div className="mt-5 space-y-3">
          {categories.map((cat) => {
            const status = getStatusText(cat.accuracy);
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
