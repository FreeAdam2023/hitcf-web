"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const CLB7_TARGET = 0.78;

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
    return { text: "\u5DF2\u8FBE\u6807 \u2713", color: "text-green-600 dark:text-green-400" };
  }
  const gap = Math.round((CLB7_TARGET - accuracy) * 100);
  if (accuracy >= 0.6) {
    return { text: `\u8FD8\u5DEE ${gap}%`, color: "text-blue-600 dark:text-blue-400" };
  }
  return { text: "\u7EE7\u7EED\u52A0\u6CB9", color: "text-orange-600 dark:text-orange-400" };
}

function getOverallReadiness(listening: number, reading: number): {
  pct: number;
  label: string;
  color: string;
} {
  const avg = (listening + reading) / 2;
  const readiness = Math.min(Math.round((avg / CLB7_TARGET) * 100), 100);

  if (readiness >= 100) return { pct: readiness, label: "\u5DF2\u8FBE\u6807", color: "text-green-600 dark:text-green-400" };
  if (readiness >= 80) return { pct: readiness, label: "\u63A5\u8FD1\u76EE\u6807", color: "text-blue-600 dark:text-blue-400" };
  return { pct: readiness, label: "\u7EE7\u7EED\u52AA\u529B", color: "text-orange-600 dark:text-orange-400" };
}

function getSummary(listening: number, reading: number): string {
  const lOk = listening >= CLB7_TARGET;
  const rOk = reading >= CLB7_TARGET;

  if (lOk && rOk) return "\u542C\u529B\u548C\u9605\u8BFB\u5747\u5DF2\u8FBE\u6807\uFF0C\u7EE7\u7EED\u4FDD\u6301\uFF01";
  if (lOk) {
    const gap = Math.round((CLB7_TARGET - reading) * 100);
    return `\u542C\u529B\u5DF2\u8FBE\u6807\uFF0C\u9605\u8BFB\u8FD8\u5DEE ${gap}% \u5C31\u80FD\u8FBE\u5230 CLB 7\uFF01`;
  }
  if (rOk) {
    const gap = Math.round((CLB7_TARGET - listening) * 100);
    return `\u9605\u8BFB\u5DF2\u8FBE\u6807\uFF0C\u542C\u529B\u8FD8\u5DEE ${gap}% \u5C31\u80FD\u8FBE\u5230 CLB 7\uFF01`;
  }
  return "\u575A\u6301\u7EC3\u4E60\uFF0C\u5411 CLB 7 \u53D1\u8D77\u51B2\u523A\uFF01";
}

function getStreakMessage(days: number): { text: string; color: string } {
  if (days >= 30) return { text: `${days} \u5929\uFF01\u4F60\u5C31\u662F\u4F20\u5947`, color: "text-orange-500" };
  if (days >= 7) return { text: `\u8FDE\u7EED ${days} \u5929\uFF0C\u522B\u8BA9\u706B\u706D\u4E86\uFF01`, color: "text-orange-500" };
  if (days >= 3) return { text: `\u8FDE\u7EED ${days} \u5929\uFF0C\u4FDD\u6301\u4F4F\uFF01`, color: "text-orange-500" };
  if (days >= 1) return { text: "\u4ECA\u5929\u5DF2\u7EC3\u4E60\uFF0C\u660E\u5929\u7EE7\u7EED", color: "text-orange-400" };
  return { text: "\u4ECA\u5929\u8FD8\u6CA1\u7EC3\u4E60\u54E6", color: "text-muted-foreground" };
}

function getStreakMilestone(days: number): string | null {
  if (days >= 30) return "30 \u5929\u6210\u5C31";
  if (days >= 14) return "14 \u5929\u6210\u5C31";
  if (days >= 7) return "7 \u5929\u6210\u5C31";
  if (days >= 3) return "3 \u5929\u6210\u5C31";
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
    { label: "\u542C\u529B", accuracy: listeningAccuracy },
    { label: "\u9605\u8BFB", accuracy: readingAccuracy },
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
              <h2 className="text-lg font-bold">CLB 7 \u51C6\u5907\u5EA6</h2>
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
            <div className="text-xs text-muted-foreground">\u7EC3\u4E60\u6B21\u6570</div>
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
              {streakDays > 0 ? streak.text : "\u5F00\u59CB\u8FDE\u7EED\u6253\u5361"}
            </div>
            {milestone && (
              <div className="mt-0.5 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {milestone}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{Math.round(listeningAccuracy * 100)}%</div>
            <div className="text-xs text-muted-foreground">\u542C\u529B</div>
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{Math.round(readingAccuracy * 100)}%</div>
            <div className="text-xs text-muted-foreground">\u9605\u8BFB</div>
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
