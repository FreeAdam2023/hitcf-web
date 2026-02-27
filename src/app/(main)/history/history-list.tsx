"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Headphones, BookOpen, Mic, PenLine, ChevronRight, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { listAttempts } from "@/lib/api/attempts";
import { estimateTcfLevelFromRatio } from "@/lib/tcf-levels";
import { useTranslations } from "next-intl";
import type { PaginatedResponse, AttemptResponse } from "@/lib/api/types";
import { TYPE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ElementType> = {
  listening: Headphones,
  reading: BookOpen,
  speaking: Mic,
  writing: PenLine,
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryCard({ attempt }: { attempt: AttemptResponse }) {
  const t = useTranslations();
  const router = useRouter();
  const isCompleted = attempt.status === "completed";
  const tcf =
    isCompleted && attempt.score != null
      ? estimateTcfLevelFromRatio(attempt.score, attempt.total)
      : null;

  const resumeUrl = isCompleted
    ? `/results/${attempt.id}`
    : attempt.mode === "exam"
      ? `/exam/${attempt.id}`
      : `/practice/${attempt.id}`;

  const pct = isCompleted && attempt.score != null && attempt.total > 0
    ? Math.round((attempt.score / attempt.total) * 100)
    : null;

  const colors = TYPE_COLORS[attempt.test_set_type || ""];
  const Icon = TYPE_ICONS[attempt.test_set_type || ""] || Trophy;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(resumeUrl)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push(resumeUrl); }}
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-200 cursor-pointer hover:bg-accent/50 hover:shadow-sm"
    >
      {/* Icon */}
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colors?.iconBg || "bg-muted text-muted-foreground")}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {attempt.test_set_name || "-"}
          </span>
          {!isCompleted && (
            <Badge variant="outline" className="shrink-0 border-amber-300 bg-amber-50 text-amber-700 text-[10px] dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
              {t("history.incomplete")}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          {attempt.test_set_type && (
            <span>{t(`common.types.${attempt.test_set_type}`)}</span>
          )}
          <span>{t(`common.modes.${attempt.mode}`)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {attempt.completed_at
              ? formatDate(attempt.completed_at)
              : formatDate(attempt.started_at)}
          </span>
        </div>

        {/* Score bar */}
        {isCompleted && pct !== null && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  pct >= 78 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums">
              {attempt.score}/{attempt.total}
            </span>
          </div>
        )}
        {!isCompleted && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/40"
                style={{ width: `${attempt.total > 0 ? (attempt.answered_count / attempt.total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {attempt.answered_count}/{attempt.total}
            </span>
          </div>
        )}
      </div>

      {/* Level badge + arrow */}
      <div className="flex items-center gap-2">
        {tcf && (
          <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", tcf.color, tcf.bgColor)}>
            {tcf.level}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

export function HistoryList() {
  const t = useTranslations();
  const [data, setData] = useState<PaginatedResponse<AttemptResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAttempts({ page, page_size: 20 });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("history.title")}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("history.subtitle")}
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !data?.items.length ? (
        <EmptyState
          title={t("history.empty.title")}
          description={t("history.empty.description")}
          action={
            <Button asChild>
              <Link href="/tests">{t("history.goToTests")}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((a) => (
              <HistoryCard key={a.id} attempt={a} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={data.total_pages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
