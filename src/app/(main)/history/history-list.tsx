"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Headphones,
  BookOpen,
  Mic,
  PenLine,
  ChevronRight,
  Clock,
  Trophy,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { listAttempts } from "@/lib/api/attempts";
import { listSpeakingAttempts } from "@/lib/api/speaking-attempts";
import { estimateTcfLevelFromRatio } from "@/lib/tcf-levels";
import { useTranslations, useLocale } from "next-intl";
import type { AttemptResponse, SpeakingAttemptResponse } from "@/lib/api/types";
import { TYPE_COLORS, TYPE_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Unified history item type
interface HistoryItem {
  id: string;
  test_set_name: string | null;
  test_set_type: string;
  mode: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  // For listening/reading/writing
  score: number | null;
  total: number;
  answered_count: number;
  // For speaking
  speakingOverall: number | null;
  // Source discriminator
  _source: "attempt" | "speaking";
}

function fromAttempt(a: AttemptResponse): HistoryItem {
  return {
    id: a.id,
    test_set_name: a.test_set_name ?? null,
    test_set_type: a.test_set_type ?? "",
    mode: a.mode,
    status: a.status,
    started_at: a.started_at,
    completed_at: a.completed_at,
    score: a.score,
    total: a.total,
    answered_count: a.answered_count,
    speakingOverall: null,
    _source: "attempt",
  };
}

function fromSpeaking(s: SpeakingAttemptResponse): HistoryItem {
  return {
    id: s.id,
    test_set_name: s.test_set_name,
    test_set_type: "speaking",
    mode: s.mode,
    status: s.status,
    started_at: s.started_at,
    completed_at: s.completed_at,
    score: null,
    total: 100,
    answered_count: 0,
    speakingOverall: s.scores?.overall ?? null,
    _source: "speaking",
  };
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  listening: Headphones,
  reading: BookOpen,
  speaking: Mic,
  writing: PenLine,
};

const LEVEL_ORDER: Record<string, number> = {
  C2: 0, C1: 1, B2: 2, B1: 3, A2: 4, A1: 5,
};

const PAGE_SIZE = 20;

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr);
  const loc = locale === "zh" ? "zh-CN" : "en-US";
  return d.toLocaleDateString(loc, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

function groupByDate(items: HistoryItem[]) {
  const today: HistoryItem[] = [];
  const thisWeek: HistoryItem[] = [];
  const earlier: HistoryItem[] = [];
  for (const item of items) {
    const d = item.completed_at || item.started_at;
    if (isToday(d)) today.push(item);
    else if (isThisWeek(d)) thisWeek.push(item);
    else earlier.push(item);
  }
  return { today, thisWeek, earlier };
}

function SummaryCard({ items, total }: { items: HistoryItem[]; total: number }) {
  const t = useTranslations();
  const completed = items.filter(
    (a) => a.status === "completed" && a._source === "attempt" && a.score != null && a.total > 0,
  );
  const avgPct =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, a) => sum + (a.score! / a.total) * 100, 0) /
            completed.length,
        )
      : null;
  const bestLevel =
    completed.length > 0
      ? completed
          .map((a) => estimateTcfLevelFromRatio(a.score!, a.total))
          .sort(
            (a, b) => (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9),
          )[0]
      : null;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          {t("history.summary.title")}
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x text-center">
        <div className="px-2">
          <div className="text-2xl font-bold">{total}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {t("history.summary.totalAttempts")}
          </div>
        </div>
        <div className="px-2">
          <div className="text-2xl font-bold">
            {avgPct != null ? `${avgPct}%` : "—"}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {t("history.summary.avgScore")}
          </div>
        </div>
        <div className="px-2">
          <div className={cn("text-2xl font-bold", bestLevel?.color)}>
            {bestLevel?.level ?? "—"}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {t("history.summary.bestLevel")}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeFilterChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          value === "all"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80",
        )}
      >
        {t("history.filter.all")}
      </button>
      {TYPE_KEYS.map((type) => {
        const Icon = TYPE_ICONS[type];
        const colors = TYPE_COLORS[type];
        const isActive = value === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? colors?.iconBg
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <Icon className="h-3 w-3" />
            {t(`common.types.${type}`)}
          </button>
        );
      })}
    </div>
  );
}

function DateGroup({ label, items }: { label: string; items: HistoryItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </h3>
      {items.map((a) => (
        <HistoryCard key={`${a._source}-${a.id}`} item={a} />
      ))}
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isCompleted = item.status === "completed";
  const isSpeaking = item._source === "speaking";

  // URL depends on source
  let url: string;
  if (isSpeaking) {
    url = `/speaking-practice/results/${item.id}`;
  } else if (isCompleted) {
    url = `/results/${item.id}`;
  } else if (item.mode === "exam") {
    url = `/exam/${item.id}`;
  } else {
    url = `/practice/${item.id}`;
  }

  // Score display
  const pct = isSpeaking
    ? (item.speakingOverall != null ? Math.round(item.speakingOverall) : null)
    : (isCompleted && item.score != null && item.total > 0
        ? Math.round((item.score / item.total) * 100)
        : null);

  const tcf =
    !isSpeaking && isCompleted && item.score != null
      ? estimateTcfLevelFromRatio(item.score, item.total)
      : null;

  const colors = TYPE_COLORS[item.test_set_type || ""];
  const Icon = TYPE_ICONS[item.test_set_type || ""] || Trophy;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(url)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(url);
      }}
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-200 cursor-pointer hover:bg-accent/50 hover:shadow-sm"
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          colors?.iconBg || "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {item.test_set_name || "-"}
          </span>
          {!isCompleted && !isSpeaking && (
            <Badge
              variant="outline"
              className="shrink-0 border-amber-300 bg-amber-50 text-amber-700 text-[10px] dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
            >
              {t("history.incomplete")}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          {item.test_set_type && (
            <span>{t(`common.types.${item.test_set_type}`)}</span>
          )}
          <span>{t(`common.modes.${item.mode}`)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.completed_at
              ? formatDate(item.completed_at, locale)
              : formatDate(item.started_at, locale)}
          </span>
        </div>

        {/* Score bar */}
        {pct !== null && (
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
              {isSpeaking
                ? `${pct}/100`
                : `${item.score}/${item.total}`}
            </span>
          </div>
        )}
        {!isCompleted && !isSpeaking && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/40"
                style={{
                  width: `${item.total > 0 ? (item.answered_count / item.total) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {item.answered_count}/{item.total}
            </span>
          </div>
        )}
      </div>

      {/* Level badge + arrow */}
      <div className="flex items-center gap-2">
        {tcf && (
          <span
            className={cn(
              "rounded-md px-2 py-1 text-xs font-semibold",
              tcf.color,
              tcf.bgColor,
            )}
          >
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
  const [allItems, setAllItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");

  const hasMore = allItems.length < total;

  const fetchPage = useCallback(
    async (pageNum: number, type: string, reset: boolean) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      try {
        const includeRegular = type === "all" || (type !== "speaking");
        const includeSpeaking = type === "all" || type === "speaking";

        const promises: Promise<unknown>[] = [];

        if (includeRegular) {
          promises.push(
            listAttempts({
              page: pageNum,
              page_size: PAGE_SIZE,
              type: type === "all" ? undefined : type,
            }),
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        if (includeSpeaking) {
          promises.push(
            listSpeakingAttempts({
              page: pageNum,
              page_size: PAGE_SIZE,
            }),
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        const [regularResult, speakingResult] = await Promise.all(promises) as [
          { items: AttemptResponse[]; total: number } | null,
          { items: SpeakingAttemptResponse[]; total: number } | null,
        ];

        const regularItems = regularResult
          ? regularResult.items.map(fromAttempt)
          : [];
        const speakingItems = speakingResult
          ? speakingResult.items.map(fromSpeaking)
          : [];

        // Merge and sort by date (newest first)
        const merged = [...regularItems, ...speakingItems].sort((a, b) => {
          const dateA = new Date(a.completed_at || a.started_at).getTime();
          const dateB = new Date(b.completed_at || b.started_at).getTime();
          return dateB - dateA;
        });

        const totalCount =
          (regularResult?.total ?? 0) + (speakingResult?.total ?? 0);

        setTotal(totalCount);
        setAllItems((prev) =>
          reset ? merged : [...prev, ...merged],
        );
      } catch {
        if (reset) setAllItems([]);
      } finally {
        if (reset) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    fetchPage(1, typeFilter, true);
  }, [typeFilter, fetchPage]);

  const handleTypeChange = (v: string) => {
    setTypeFilter(v);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, typeFilter, false);
  };

  const grouped = groupByDate(allItems);

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
      ) : !allItems.length ? (
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
          <SummaryCard items={allItems} total={total} />

          <TypeFilterChips value={typeFilter} onChange={handleTypeChange} />

          <div className="space-y-6">
            <DateGroup label={t("history.groups.today")} items={grouped.today} />
            <DateGroup
              label={t("history.groups.thisWeek")}
              items={grouped.thisWeek}
            />
            <DateGroup
              label={t("history.groups.earlier")}
              items={grouped.earlier}
            />
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("history.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
