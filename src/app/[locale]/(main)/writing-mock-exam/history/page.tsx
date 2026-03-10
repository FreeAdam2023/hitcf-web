"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Trophy, TrendingUp, Calendar } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import {
  listWritingExamHistory, getWritingExamTrend,
} from "@/lib/api/writing-exam";
import type { WritingExamHistoryItem, TrendData } from "@/lib/api/writing-exam";

function scoreBadgeColor(score: number | null): string {
  if (score === null) return "bg-muted text-muted-foreground";
  if (score >= 16) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
  if (score >= 12) return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
  if (score >= 8) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
  if (score >= 5) return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";
  return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
}

export default function WritingExamHistoryPage() {
  const t = useTranslations("writingMockExam");
  const router = useRouter();
  const [items, setItems] = useState<WritingExamHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listWritingExamHistory({ page, page_size: 10 }),
      getWritingExamTrend(),
    ])
      .then(([hist, trendData]) => {
        setItems(hist.items);
        setTotal(hist.total);
        setTrend(trendData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingSpinner />;

  const totalPages = Math.ceil(total / 10);
  const stats = trend?.stats;
  const chartData = trend?.points.map((p) => ({
    date: new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: p.score,
  })) || [];

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 sm:px-0">
      <Breadcrumb items={[
        { label: t("backToExam"), href: "/writing-mock-exam" },
        { label: t("history") },
      ]} />

      {/* Stats */}
      {stats && stats.total_exams > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: t("totalExams"), value: stats.total_exams },
            { label: t("avgScore"), value: stats.average_score !== null ? `${stats.average_score}/20` : "-" },
            { label: t("bestScore"), value: stats.best_score !== null ? `${stats.best_score}/20` : "-" },
            { label: t("improvement"), value: stats.improvement !== null ? `${stats.improvement > 0 ? "+" : ""}${stats.improvement}` : "-" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="py-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trend chart */}
      {chartData.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              {t("scoreTrend")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(label) => String(label)}
                  formatter={(value) => [`${value}/20`, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* History list */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-medium">{t("noHistory")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noHistoryDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => router.push(`/writing-mock-exam/results/${item.id}`)}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {item.tcf_score !== null ? (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-bold ${scoreBadgeColor(item.tcf_score)}`}>
                      {item.tcf_score}/20
                    </span>
                  ) : (
                    <Badge variant="secondary">{item.status}</Badge>
                  )}
                  {item.estimated_level && (
                    <Badge variant="outline">{item.estimated_level}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ←
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            →
          </Button>
        </div>
      )}

      <Button variant="ghost" className="w-full" onClick={() => router.push("/writing-mock-exam")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToExam")}
      </Button>
    </div>
  );
}
