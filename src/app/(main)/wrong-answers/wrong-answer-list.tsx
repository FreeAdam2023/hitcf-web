"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { PaginatedResponse, WrongAnswerItem, WrongAnswerStats } from "@/lib/api/types";

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

  // Filters
  const [type, setType] = useState("all");
  const [mastered, setMastered] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);

  // Fetch stats once
  useEffect(() => {
    getWrongAnswerStats().then(setWaStats).catch((err) => { console.warn("Stats fetch failed:", err); });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await listWrongAnswers({
        type: type === "all" ? undefined : type,
        is_mastered: mastered === "all" ? undefined : mastered === "true",
        sort_by: sortBy,
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
  }, [type, mastered, sortBy, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      toast.success(result.is_mastered ? t("wrongAnswers.markMastered") : t("wrongAnswers.markUnmastered"));
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

      initPractice(result.id, practiceQuestions.length > 0 ? practiceQuestions : questions.slice(0, result.total));
      router.push(`/practice/${result.id}`);
    } catch (err) {
      console.error("Failed to start practice", err);
      setStartingPractice(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
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
        {canAccessPaid && (
          <Button
            onClick={handleStartPractice}
            disabled={startingPractice || !data?.items.length}
          >
            <BookOpen className="mr-1.5 h-4 w-4" />
            {startingPractice ? t("wrongAnswers.generating") : t("wrongAnswers.practiceFromWrong")}
          </Button>
        )}
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

      {/* Stats overview */}
      {canAccessPaid && waStats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("wrongAnswers.stats.total")}</p>
              <p className="text-xl font-bold">{waStats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("wrongAnswers.stats.mastered")}</p>
              <p className="text-xl font-bold">{waStats.mastered}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("wrongAnswers.stats.unmastered")}</p>
              <p className="text-xl font-bold">{waStats.unmastered}</p>
            </div>
          </div>
        </div>
      )}

      {canAccessPaid && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("wrongAnswers.filters.allTypes")}</SelectItem>
                <SelectItem value="listening">{t("common.types.listening")}</SelectItem>
                <SelectItem value="reading">{t("common.types.reading")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mastered} onValueChange={(v) => { setMastered(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("wrongAnswers.filters.allStatus")}</SelectItem>
                <SelectItem value="false">{t("wrongAnswers.filters.unmastered")}</SelectItem>
                <SelectItem value="true">{t("wrongAnswers.filters.mastered")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t("wrongAnswers.filters.recentWrong")}</SelectItem>
                <SelectItem value="most_wrong">{t("wrongAnswers.filters.mostWrong")}</SelectItem>
                <SelectItem value="level">{t("wrongAnswers.filters.byLevel")}</SelectItem>
              </SelectContent>
            </Select>
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
