"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, CheckCircle, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { getStatsOverview } from "@/lib/api/stats";
import type { StatsOverview } from "@/lib/api/stats";

const MODE_LABELS: Record<string, string> = {
  practice: "练习",
  exam: "考试",
  speed_drill: "速练",
};

export function DashboardView() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStatsOverview()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!stats) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        无法加载统计数据
      </div>
    );
  }

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">练习次数</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.total_attempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">答题总数</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.total_questions_answered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">正确率</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{pct(stats.accuracy_rate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="h-4 w-4" />
              <span className="text-xs">连续天数</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.streak_days}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category accuracy */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">听力正确率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={stats.listening_accuracy * 100} className="flex-1" />
              <span className="text-sm font-medium">{pct(stats.listening_accuracy)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">阅读正确率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={stats.reading_accuracy * 100} className="flex-1" />
              <span className="text-sm font-medium">{pct(stats.reading_accuracy)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level distribution */}
      {Object.keys(stats.by_level).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">等级分布</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
