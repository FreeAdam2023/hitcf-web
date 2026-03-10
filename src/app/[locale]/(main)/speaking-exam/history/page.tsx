"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  listSpeakingExamHistory,
  getSpeakingExamTrend,
} from "@/lib/api/speaking-exam";
import type {
  SpeakingExamHistoryItem,
  SpeakingExamHistoryResponse,
  TrendData,
} from "@/lib/api/speaking-exam";

const PAGE_SIZE = 10;

function scoreColor(score: number): string {
  if (score >= 16)
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
  if (score >= 12)
    return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
  if (score >= 8)
    return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
  if (score >= 5)
    return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";
  return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
}

function statusColor(status: string): string {
  if (status === "completed")
    return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800";
  if (status === "in_progress")
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800";
  return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SpeakingExamHistoryPage() {
  const t = useTranslations("speakingExam");
  const router = useRouter();

  const [trend, setTrend] = useState<TrendData | null>(null);
  const [history, setHistory] = useState<SpeakingExamHistoryResponse | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async (p: number) => {
    setHistoryLoading(true);
    try {
      const data = await listSpeakingExamHistory({
        page: p,
        page_size: PAGE_SIZE,
      });
      setHistory(data);
    } catch {
      /* silently handle */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const [trendData, historyData] = await Promise.all([
          getSpeakingExamTrend(),
          listSpeakingExamHistory({ page: 1, page_size: PAGE_SIZE }),
        ]);
        setTrend(trendData);
        setHistory(historyData);
      } catch {
        /* silently handle */
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchHistory(newPage);
  };

  if (loading) return <LoadingSpinner />;

  const stats = trend?.stats;
  const totalPages = history
    ? Math.ceil(history.total / history.page_size)
    : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-0">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t("backToExam"), href: "/speaking-exam" },
          { label: t("history") },
        ]}
      />

      {/* Score Trend */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{t("scoreTrend")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stat cards */}
          {stats && stats.total_exams > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border p-3 text-center">
                <BarChart3 className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <div className="text-lg font-bold">{stats.total_exams}</div>
                <div className="text-xs text-muted-foreground">
                  {t("totalExams")}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <Trophy className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <div className="text-lg font-bold">
                  {stats.average_score !== null
                    ? stats.average_score.toFixed(1)
                    : "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("avgScore")}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <Trophy className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                <div className="text-lg font-bold">
                  {stats.best_score !== null
                    ? stats.best_score.toFixed(1)
                    : "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("bestScore")}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <TrendingUp className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                <div className="text-lg font-bold">
                  {stats.improvement !== null ? (
                    <>
                      {stats.improvement > 0 ? "+" : ""}
                      {stats.improvement.toFixed(1)}
                    </>
                  ) : (
                    "-"
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("improvement")}
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          {trend && trend.points.length >= 2 ? (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trend.points}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val: string) =>
                      new Date(val).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    domain={[0, 20]}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val: number) => `${val}`}
                  />
                  <Tooltip
                    labelFormatter={(label) => String(label)}
                    formatter={(value) => [`${value}/20`, "Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {stats && stats.total_exams === 0
                ? t("noHistory")
                : t("pointsStr")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* History list */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">{t("history")}</h2>
        </div>

        {historyLoading && <LoadingSpinner />}

        {!historyLoading && history && history.items.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">
                {t("noHistory")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                {t("noHistoryDesc")}
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/speaking-exam")}
              >
                {t("backToExam")}
              </Button>
            </CardContent>
          </Card>
        )}

        {!historyLoading &&
          history &&
          history.items.map((item: SpeakingExamHistoryItem) => (
            <Card key={item.id} className="transition-colors hover:bg-muted/30">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.total_score !== null && (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-bold ${scoreColor(item.total_score)}`}
                      >
                        {item.total_score.toFixed(1)}/20
                      </span>
                    )}
                    {item.estimated_level && (
                      <Badge variant="outline" className="text-xs font-medium">
                        {item.estimated_level}
                      </Badge>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.created_at)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/speaking-exam/results/${item.id}`)
                  }
                >
                  {t("viewDetail")}
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || historyLoading}
            onClick={() => handlePageChange(page - 1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("prev") ?? "Prev"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || historyLoading}
            onClick={() => handlePageChange(page + 1)}
          >
            {t("next") ?? "Next"}
            <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
          </Button>
        </div>
      )}

      {/* Back button */}
      <div className="pb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/speaking-exam")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToExam")}
        </Button>
      </div>
    </div>
  );
}
