"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SkeletonGrid } from "@/components/shared/skeleton-card";
import { ErrorState } from "@/components/shared/error-state";
import { AccuracyTrendChart } from "@/components/dashboard/accuracy-trend-chart";
import { DailyPracticeChart } from "@/components/dashboard/daily-practice-chart";
import { LevelRadarChart } from "@/components/dashboard/level-radar-chart";
import { CLB7Readiness } from "@/components/dashboard/clb7-readiness";
import { getStatsOverview, getStatsHistory } from "@/lib/api/stats";
import type { StatsOverview } from "@/lib/api/stats";
import type { StatsHistory } from "@/lib/api/types";

import { MODE_LABELS } from "@/lib/constants";

export function DashboardView() {
  const router = useRouter();
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
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <SkeletonGrid count={2} />
      </div>
    );
  }

  if (error || !stats) {
    return <ErrorState message="无法加载统计数据" onRetry={load} />;
  }

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  const hasData = stats.total_attempts > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>

      {/* Hero: CLB 7 Readiness — THE one number that matters */}
      <CLB7Readiness
        listeningAccuracy={stats.listening_accuracy}
        readingAccuracy={stats.reading_accuracy}
        totalAttempts={stats.total_attempts}
        streakDays={stats.streak_days}
      />

      {/* Quick actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/tests">{hasData ? "继续练习" : "开始练习"}</Link>
        </Button>
        <Button variant="outline" className="gap-1.5" asChild>
          <a href="https://t.me/hitcf_group" target="_blank" rel="noopener noreferrer">
            <Users className="h-4 w-4" />
            加入备考群
          </a>
        </Button>
      </div>

      {/* Charts — show trends only when there's data */}
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
            {showDetails ? "收起详情" : "查看详情"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
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

              {/* Level distribution */}
              {Object.keys(stats.by_level).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">等级分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>等级</TableHead>
                          <TableHead className="text-right">答题数</TableHead>
                          <TableHead className="text-right">正确数</TableHead>
                          <TableHead className="text-right">正确率</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(stats.by_level)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([level, data]) => (
                            <TableRow key={level}>
                              <TableCell className="font-medium">{level}</TableCell>
                              <TableCell className="text-right">{data.answered}</TableCell>
                              <TableCell className="text-right">{data.correct}</TableCell>
                              <TableCell className="text-right">{pct(data.accuracy)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent attempts */}
              {stats.recent_attempts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">最近记录</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>模式</TableHead>
                          <TableHead className="text-right">得分</TableHead>
                          <TableHead className="text-right">完成时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.recent_attempts.map((a) => (
                          <TableRow
                            key={a.id}
                            role="link"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push(`/results/${a.id}`); }}
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => router.push(`/results/${a.id}`)}
                          >
                            <TableCell>{MODE_LABELS[a.mode] || a.mode}</TableCell>
                            <TableCell className="text-right">
                              {a.score ?? "-"} / {a.total}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {a.completed_at
                                ? new Date(a.completed_at).toLocaleDateString("zh-CN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
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
