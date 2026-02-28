"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Headphones, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { WrongAnswerCard } from "@/components/wrong-answers/wrong-answer-card";
import {
  listWrongAnswers,
  toggleMastered,
  practiceWrongAnswers,
  getWrongAnswerStats,
} from "@/lib/api/wrong-answers";
import { usePracticeStore } from "@/stores/practice-store";
import { useAuthStore } from "@/stores/auth-store";
import { getTestSetQuestions } from "@/lib/api/test-sets";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { TYPE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PaginatedResponse, WrongAnswerItem, WrongAnswerStats } from "@/lib/api/types";

const TYPE_CHIPS: Array<{ key: string; Icon?: React.ElementType }> = [
  { key: "all" },
  { key: "listening", Icon: Headphones },
  { key: "reading", Icon: BookOpen },
];

function MasteryRing({ mastered, total }: { mastered: number; total: number }) {
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6"
          className="stroke-muted" />
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6"
          className="stroke-green-500 transition-all duration-700"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums">{pct}%</span>
    </div>
  );
}

export function WrongAnswerList() {
  const t = useTranslations();
  const router = useRouter();
  const initPractice = usePracticeStore((s) => s.init);
  const canAccessPaid = useAuthStore((s) => {
    if (s.isLoading) return true;
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });

  const [data, setData] = useState<PaginatedResponse<WrongAnswerItem> | null>(null);
  const [waStats, setWaStats] = useState<WrongAnswerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [startingPractice, setStartingPractice] = useState(false);

  // Filters — defaults: unmastered only, sorted by most wrong
  const [type, setType] = useState("all");
  const [hideUnmastered, setHideUnmastered] = useState(true);
  const [page, setPage] = useState(1);

  // Fetch stats once
  useEffect(() => {
    getWrongAnswerStats()
      .then(setWaStats)
      .catch((err) => { console.warn("Stats fetch failed:", err); });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await listWrongAnswers({
        type: type === "all" ? undefined : type,
        is_mastered: hideUnmastered ? false : undefined,
        sort_by: "most_wrong",
        page,
        page_size: 20,
      });
      setData(result);
    } catch (err) {
      setData({ items: [], page: 1, page_size: 20, total: 0, total_pages: 0 } as PaginatedResponse<WrongAnswerItem>);
      setFetchError(err instanceof Error ? err.message : t("wrongAnswers.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [type, hideUnmastered, page, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTypeChange = (v: string) => {
    setType(v);
    setPage(1);
  };

  const handleToggleMastered = async (id: string) => {
    try {
      const result = await toggleMastered(id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === id ? { ...item, is_mastered: result.is_mastered } : item,
          ),
        };
      });
      // Also refresh stats
      getWrongAnswerStats().then(setWaStats).catch(() => {});
      toast.success(
        result.is_mastered ? t("wrongAnswers.markMastered") : t("wrongAnswers.markUnmastered"),
      );
    } catch (err) {
      console.error("Failed to toggle mastered", err);
      toast.error(t("common.errors.operationFailed"));
    }
  };

  const handleStartPractice = async () => {
    setStartingPractice(true);
    try {
      const result = await practiceWrongAnswers({
        type: type === "all" ? undefined : type,
        count: 10,
      });

      const questions = await getTestSetQuestions(result.test_set_id, "practice");
      const questionIdSet = new Set(result.question_ids);
      const practiceQuestions = questions.filter((q) => questionIdSet.has(q.id));

      initPractice(
        result.id,
        practiceQuestions.length > 0 ? practiceQuestions : questions.slice(0, result.total),
      );
      router.push(`/practice/${result.id}`);
    } catch (err) {
      console.error("Failed to start practice", err);
      setStartingPractice(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("wrongAnswers.title")}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("wrongAnswers.subtitle")}
        </p>
      </div>

      {!canAccessPaid && (
        <UpgradeBanner
          variant="hero"
          title={t("wrongAnswers.upgradeBanner.title")}
          description={t("wrongAnswers.upgradeBanner.description")}
          features={[
            t("wrongAnswers.upgradeBanner.features.0"),
            t("wrongAnswers.upgradeBanner.features.1"),
            t("wrongAnswers.upgradeBanner.features.2"),
            t("wrongAnswers.upgradeBanner.features.3"),
          ]}
        />
      )}

      {/* Progress card + Practice button */}
      {canAccessPaid && waStats && (
        <div className="flex items-center justify-between rounded-xl border bg-card p-4">
          <div className="flex items-center gap-4">
            <MasteryRing mastered={waStats.mastered} total={waStats.total} />
            <div>
              <p className="text-sm font-medium">{t("wrongAnswers.progress.title")}</p>
              <p className="text-sm text-muted-foreground">
                {t("wrongAnswers.progress.masteredOf", {
                  mastered: waStats.mastered,
                  total: waStats.total,
                })}
              </p>
            </div>
          </div>
          <Button
            onClick={handleStartPractice}
            disabled={startingPractice || !data?.items.length}
          >
            {startingPractice ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {t("wrongAnswers.generating")}
              </>
            ) : (
              <>
                <BookOpen className="mr-1.5 h-4 w-4" />
                {t("wrongAnswers.practiceFromWrong", { count: 10 })}
              </>
            )}
          </Button>
        </div>
      )}

      {canAccessPaid && (
        <>
          {/* Filters: type chips + hide-mastered toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {TYPE_CHIPS.map(({ key, Icon }) => {
                const colors = TYPE_COLORS[key];
                const isActive = type === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleTypeChange(key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? key === "all"
                          ? "bg-primary text-primary-foreground"
                          : colors?.iconBg
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {key === "all"
                      ? t("wrongAnswers.filters.allTypes")
                      : t(`common.types.${key}`)}
                  </button>
                );
              })}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={hideUnmastered}
                onCheckedChange={(checked) => { setHideUnmastered(!!checked); setPage(1); }}
              />
              {t("wrongAnswers.filters.hideUnmastered")}
            </label>
          </div>

          {/* List */}
          {loading ? (
            <LoadingSpinner />
          ) : fetchError ? (
            <ErrorState message={fetchError} onRetry={fetchData} />
          ) : !data?.items.length ? (
            <EmptyState
              title={t("wrongAnswers.empty.title")}
              description={t("wrongAnswers.empty.description")}
              action={
                <Button onClick={() => router.push("/tests")}>
                  {t("wrongAnswers.goToTests")}
                </Button>
              }
            />
          ) : (
            <>
              <div className="space-y-3">
                {data.items.map((item) => (
                  <WrongAnswerCard
                    key={item.id}
                    item={item}
                    onToggleMastered={handleToggleMastered}
                  />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={data.total_pages}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
