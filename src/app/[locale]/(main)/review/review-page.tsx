"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowDownWideNarrow, BookOpen, Clock, Headphones, Star, Trash2, CheckSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { WrongAnswerCard } from "@/components/wrong-answers/wrong-answer-card";
import { BookmarkCard } from "@/components/wrong-answers/bookmark-card";
import { HighlightCard } from "@/components/review/highlight-card";
import {
  listWrongAnswers,
  toggleMastered,
  practiceWrongAnswers,
  getWrongAnswerStats,
  deleteWrongAnswer,
  batchDeleteWrongAnswers,
  clearMasteredWrongAnswers,
} from "@/lib/api/wrong-answers";
import {
  listBookmarks,
  getBookmarkStats,
  toggleBookmark,
  practiceBookmarks,
} from "@/lib/api/bookmarks";
import { listHighlights, deleteHighlight } from "@/lib/api/highlights";
import { useAuthStore } from "@/stores/auth-store";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { useTranslations } from "next-intl";
import { useRouter as useI18nRouter } from "@/i18n/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { PracticeStartDialog } from "@/components/review/practice-start-dialog";
import { TYPE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PaginatedResponse, WrongAnswerItem, WrongAnswerStats, BookmarkItem, BookmarkStats, HighlightItem } from "@/lib/api/types";

type Tab = "wrong" | "bookmarks" | "highlights";

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

export function ReviewPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const i18nRouter = useI18nRouter();
  const canAccessPaid = useAuthStore((s) => {
    if (s.isLoading) return true;
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });

  const initialTab = (searchParams.get("tab") as Tab) || "wrong";
  const [tab, setTab] = useState<Tab>(initialTab);

  // Wrong answers state
  const [waData, setWaData] = useState<PaginatedResponse<WrongAnswerItem> | null>(null);
  const [waStats, setWaStats] = useState<WrongAnswerStats | null>(null);
  const [waLoading, setWaLoading] = useState(true);
  const [waError, setWaError] = useState<string | null>(null);
  const [startingPractice, setStartingPractice] = useState(false);
  const [waPracticeDialogOpen, setWaPracticeDialogOpen] = useState(false);

  // Bookmark state
  const [bmData, setBmData] = useState<PaginatedResponse<BookmarkItem> | null>(null);
  const [bmStats, setBmStats] = useState<BookmarkStats | null>(null);
  const [bmLoading, setBmLoading] = useState(true);
  const [bmError, setBmError] = useState<string | null>(null);
  const [startingBmPractice, setStartingBmPractice] = useState(false);
  const [bmPracticeDialogOpen, setBmPracticeDialogOpen] = useState(false);

  // Highlight state
  const [hlData, setHlData] = useState<PaginatedResponse<HighlightItem> | null>(null);
  const [hlLoading, setHlLoading] = useState(true);
  const [hlError, setHlError] = useState<string | null>(null);
  const [hlPage, setHlPage] = useState(1);
  const [hlNoteFilter, setHlNoteFilter] = useState<"all" | "with_note" | "highlight_only">("all");
  const [hlTagFilter, setHlTagFilter] = useState<string | null>(null);

  // Selection mode for batch delete
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Shared filters
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "most_wrong">("recent");
  const [hideUnmastered, setHideUnmastered] = useState(true);
  const [waPage, setWaPage] = useState(1);
  const [bmPage, setBmPage] = useState(1);

  // Update URL when tab changes
  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Fetch wrong answer stats
  useEffect(() => {
    getWrongAnswerStats().then(setWaStats).catch(() => {});
  }, []);

  // Fetch bookmark stats
  useEffect(() => {
    getBookmarkStats().then(setBmStats).catch(() => {});
  }, []);

  // Fetch wrong answers
  const fetchWaData = useCallback(async () => {
    setWaLoading(true);
    setWaError(null);
    try {
      const result = await listWrongAnswers({
        type: type === "all" ? undefined : type,
        is_mastered: hideUnmastered ? false : undefined,
        sort_by: sortBy,
        page: waPage,
        page_size: 20,
      });
      setWaData(result);
    } catch (err) {
      setWaData({ items: [], page: 1, page_size: 20, total: 0, total_pages: 0 } as PaginatedResponse<WrongAnswerItem>);
      setWaError(err instanceof Error ? err.message : t("wrongAnswers.loadFailed"));
    } finally {
      setWaLoading(false);
    }
  }, [type, sortBy, hideUnmastered, waPage, t]);

  // Fetch bookmarks
  const fetchBmData = useCallback(async () => {
    setBmLoading(true);
    setBmError(null);
    try {
      const result = await listBookmarks({
        type: type === "all" ? undefined : type,
        sort_by: "recent",
        page: bmPage,
        page_size: 20,
      });
      setBmData(result);
    } catch (err) {
      setBmData({ items: [], page: 1, page_size: 20, total: 0, total_pages: 0 } as PaginatedResponse<BookmarkItem>);
      setBmError(err instanceof Error ? err.message : t("wrongAnswers.loadFailed"));
    } finally {
      setBmLoading(false);
    }
  }, [type, bmPage, t]);

  useEffect(() => {
    if (tab === "wrong") fetchWaData();
  }, [tab, fetchWaData]);

  useEffect(() => {
    if (tab === "bookmarks") fetchBmData();
  }, [tab, fetchBmData]);

  // Fetch highlights
  const fetchHlData = useCallback(async () => {
    setHlLoading(true);
    setHlError(null);
    try {
      const result = await listHighlights({
        has_note: hlNoteFilter === "with_note" ? true : hlNoteFilter === "highlight_only" ? false : undefined,
        tag: hlTagFilter || undefined,
        type: type === "all" ? undefined : type,
        page: hlPage,
        page_size: 20,
      });
      setHlData(result);
    } catch (err) {
      setHlData({ items: [], page: 1, page_size: 20, total: 0, total_pages: 0 } as PaginatedResponse<HighlightItem>);
      setHlError(err instanceof Error ? err.message : t("wrongAnswers.loadFailed"));
    } finally {
      setHlLoading(false);
    }
  }, [type, hlPage, hlNoteFilter, hlTagFilter, t]);

  useEffect(() => {
    if (tab === "highlights") fetchHlData();
  }, [tab, fetchHlData]);

  const handleDeleteHighlight = async (id: string) => {
    try {
      await deleteHighlight(id);
      setHlData((prev) => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.filter((i) => i.id !== id), total: prev.total - 1 };
      });
      toast.success(t("review.highlights.deleted"));
    } catch {
      toast.error(t("common.errors.operationFailed"));
    }
  };

  const handleUpdateHighlight = (id: string, updates: Partial<HighlightItem>) => {
    setHlData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      };
    });
  };

  const handleTypeChange = (v: string) => {
    setType(v);
    setWaPage(1);
    setBmPage(1);
    setHlPage(1);
  };

  const handleToggleMastered = async (id: string) => {
    try {
      const result = await toggleMastered(id);
      setWaData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === id ? { ...item, is_mastered: result.is_mastered } : item,
          ),
        };
      });
      getWrongAnswerStats().then(setWaStats).catch(() => {});
      toast.success(
        result.is_mastered ? t("wrongAnswers.markMastered") : t("wrongAnswers.markUnmastered"),
      );
    } catch {
      toast.error(t("common.errors.operationFailed"));
    }
  };

  const handleDeleteWrongAnswer = async (id: string) => {
    try {
      await deleteWrongAnswer(id);
      setWaData((prev) => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.filter((i) => i.id !== id), total: prev.total - 1 };
      });
      getWrongAnswerStats().then(setWaStats).catch(() => {});
      toast.success(t("wrongAnswers.deleted"));
    } catch {
      toast.error(t("common.errors.operationFailed"));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await batchDeleteWrongAnswers(Array.from(selectedIds));
      setWaData((prev) => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.filter((i) => !selectedIds.has(i.id)), total: prev.total - selectedIds.size };
      });
      getWrongAnswerStats().then(setWaStats).catch(() => {});
      toast.success(t("wrongAnswers.batchDeleted", { count: selectedIds.size }));
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch {
      toast.error(t("common.errors.operationFailed"));
    }
  };

  const handleClearMastered = async () => {
    try {
      const result = await clearMasteredWrongAnswers();
      if (result.deleted > 0) {
        fetchWaData();
        getWrongAnswerStats().then(setWaStats).catch(() => {});
        toast.success(t("wrongAnswers.clearedMastered", { count: result.deleted }));
      }
    } catch {
      toast.error(t("common.errors.operationFailed"));
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!waData) return;
    const allIds = waData.items.map((i) => i.id);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    const item = bmData?.items.find((i) => i.id === bookmarkId);
    if (!item) return;
    try {
      await toggleBookmark(item.question_id);
      setBmData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter((i) => i.id !== bookmarkId),
          total: prev.total - 1,
        };
      });
      setBmStats((prev) => prev ? { total: prev.total - 1 } : prev);
      toast.success(t("review.bookmarks.removed"));
    } catch {
      toast.error(t("common.errors.operationFailed"));
    }
  };

  const handleStartPractice = async (practiceType: string | undefined, limit: number | undefined) => {
    setStartingPractice(true);
    try {
      const result = await practiceWrongAnswers({
        type: practiceType,
        limit,
      });
      sessionStorage.setItem("practiceReturnUrl", "/review");
      i18nRouter.push(`/practice/${result.attempt_id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.errors.operationFailed"));
      setStartingPractice(false);
    }
  };

  const handleStartBookmarkPractice = async (practiceType: string | undefined, limit: number | undefined) => {
    setStartingBmPractice(true);
    try {
      const result = await practiceBookmarks({
        type: practiceType,
        limit,
      });
      sessionStorage.setItem("practiceReturnUrl", "/review?tab=bookmarks");
      i18nRouter.push(`/practice/${result.attempt_id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.errors.operationFailed"));
      setStartingBmPractice(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("review.title")}
          </span>
        </h1>
      </div>

      {!canAccessPaid && (
        <UpgradeBanner
          variant="hero"
          title={t("review.upgradeBanner.title")}
          description={t("review.upgradeBanner.description")}
          features={[
            t("review.upgradeBanner.features.0"),
            t("review.upgradeBanner.features.1"),
            t("review.upgradeBanner.features.2"),
            t("review.upgradeBanner.features.3"),
          ]}
        />
      )}

      {canAccessPaid && (
        <>
          {/* Tabs */}
          <div className="inline-flex items-center gap-1 rounded-full border bg-muted/40 p-1">
            <button
              onClick={() => handleTabChange("wrong")}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-all focus-visible:outline-none",
                tab === "wrong"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("review.tabs.wrong")}
              {waStats && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  tab === "wrong" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-muted text-muted-foreground",
                )}>
                  {waStats.unmastered}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("bookmarks")}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-all focus-visible:outline-none",
                tab === "bookmarks"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("review.tabs.bookmarks")}
              {bmStats && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  tab === "bookmarks" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-muted text-muted-foreground",
                )}>
                  {bmStats.total}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("highlights")}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-all focus-visible:outline-none",
                tab === "highlights"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("review.tabs.highlights")}
              {hlData && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  tab === "highlights" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground",
                )}>
                  {hlData.total}
                </span>
              )}
            </button>
          </div>

          {/* Wrong answers tab */}
          {tab === "wrong" && (
            <>
              {/* Progress card + Practice button */}
              {waStats && (
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
                    onClick={() => setWaPracticeDialogOpen(true)}
                    disabled={!waStats || waStats.unmastered === 0}
                  >
                    <BookOpen className="mr-1.5 h-4 w-4" />
                    {t("wrongAnswers.practiceFromWrong", { count: waStats.unmastered })}
                  </Button>
                </div>
              )}

              {/* Filters + Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
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

                  <span className="mx-1 h-4 w-px bg-border" />

                  {/* Batch select toggle */}
                  <Button
                    variant={selectionMode ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setSelectionMode(!selectionMode);
                      setSelectedIds(new Set());
                    }}
                  >
                    {selectionMode ? <X className="mr-1 h-3 w-3" /> : <CheckSquare className="mr-1 h-3 w-3" />}
                    {selectionMode ? t("wrongAnswers.cancelSelect") : t("wrongAnswers.batchSelect")}
                  </Button>

                  {/* Clear mastered */}
                  {waStats && waStats.mastered > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-destructive"
                      onClick={handleClearMastered}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      {t("wrongAnswers.clearMastered", { count: waStats.mastered })}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex rounded-lg border bg-muted/50 p-0.5">
                    <button
                      onClick={() => { setSortBy("recent"); setWaPage(1); }}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                        sortBy === "recent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {t("wrongAnswers.filters.recentWrong")}
                    </button>
                    <button
                      onClick={() => { setSortBy("most_wrong"); setWaPage(1); }}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                        sortBy === "most_wrong" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <ArrowDownWideNarrow className="h-3 w-3" />
                      {t("wrongAnswers.filters.mostWrong")}
                    </button>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={hideUnmastered}
                      onCheckedChange={(checked) => { setHideUnmastered(!!checked); setWaPage(1); }}
                    />
                    {t("wrongAnswers.filters.hideUnmastered")}
                  </label>
                </div>
              </div>

              {/* Batch action bar */}
              {selectionMode && waData && waData.items.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
                  <Checkbox
                    checked={waData.items.length > 0 && waData.items.every((i) => selectedIds.has(i.id))}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size > 0
                      ? t("wrongAnswers.selectedCount", { count: selectedIds.size })
                      : t("wrongAnswers.selectAll")}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-auto h-7 text-xs"
                    disabled={selectedIds.size === 0}
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    {t("wrongAnswers.deleteSelected")}
                  </Button>
                </div>
              )}

              {/* List */}
              {waLoading ? (
                <LoadingSpinner />
              ) : waError ? (
                <ErrorState message={waError} onRetry={fetchWaData} />
              ) : !waData?.items.length ? (
                <EmptyState
                  title={t("wrongAnswers.empty.title")}
                  description={t("wrongAnswers.empty.description")}
                  action={
                    <Button onClick={() => i18nRouter.push("/tests")}>
                      {t("wrongAnswers.goToTests")}
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {waData.items.map((item) => (
                      <WrongAnswerCard
                        key={item.id}
                        item={item}
                        onToggleMastered={handleToggleMastered}
                        onDelete={handleDeleteWrongAnswer}
                        selectionMode={selectionMode}
                        selected={selectedIds.has(item.id)}
                        onSelect={handleSelectItem}
                      />
                    ))}
                  </div>
                  <Pagination page={waPage} totalPages={waData.total_pages} onPageChange={setWaPage} />
                </>
              )}
            </>
          )}

          {/* Bookmarks tab */}
          {tab === "bookmarks" && (
            <>
              {/* Bookmark practice button */}
              {bmStats && bmStats.total > 0 && (
                <div className="flex items-center justify-between rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("review.bookmarks.total", { count: bmStats.total })}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setBmPracticeDialogOpen(true)}
                  >
                    <BookOpen className="mr-1.5 h-4 w-4" />
                    {t("review.practiceBookmarks")}
                  </Button>
                </div>
              )}

              {/* Type filter only for bookmarks */}
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

              {/* List */}
              {bmLoading ? (
                <LoadingSpinner />
              ) : bmError ? (
                <ErrorState message={bmError} onRetry={fetchBmData} />
              ) : !bmData?.items.length ? (
                <EmptyState
                  title={t("review.bookmarks.emptyTitle")}
                  description={t("review.bookmarks.emptyDescription")}
                  action={
                    <Button onClick={() => i18nRouter.push("/tests")}>
                      {t("wrongAnswers.goToTests")}
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {bmData.items.map((item) => (
                      <BookmarkCard
                        key={item.id}
                        item={item}
                        onRemove={handleRemoveBookmark}
                      />
                    ))}
                  </div>
                  <Pagination page={bmPage} totalPages={bmData.total_pages} onPageChange={setBmPage} />
                </>
              )}
            </>
          )}

          {/* Highlights tab */}
          {tab === "highlights" && (
            <>
              {/* Summary + filters */}
              {hlData && hlData.total > 0 && (
                <div className="flex items-center justify-between rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <p className="text-sm font-medium">{t("review.highlights.total", { count: hlData.total })}</p>
                  </div>
                </div>
              )}

              {/* Note filter + type filter */}
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "with_note", "highlight_only"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setHlNoteFilter(key); setHlPage(1); }}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      hlNoteFilter === key
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {t(`review.highlights.filter${key.charAt(0).toUpperCase() + key.slice(1).replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())}`)}
                  </button>
                ))}

                <span className="mx-1 h-4 w-px bg-border" />

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

              {/* Tag filter */}
              <div className="flex flex-wrap gap-1.5">
                {["collocation", "expression", "connector", "grammar", "vocabulary", "confusing", "exam_key"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setHlTagFilter(hlTagFilter === tag ? null : tag); setHlPage(1); }}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      hlTagFilter === tag
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {t(`review.highlights.tags.${tag}`)}
                  </button>
                ))}
              </div>

              {/* List */}
              {hlLoading ? (
                <LoadingSpinner />
              ) : hlError ? (
                <ErrorState message={hlError} onRetry={fetchHlData} />
              ) : !hlData?.items.length ? (
                <EmptyState
                  title={t("review.highlights.emptyTitle")}
                  description={t("review.highlights.emptyDescription")}
                  action={
                    <Button onClick={() => i18nRouter.push("/tests")}>
                      {t("wrongAnswers.goToTests")}
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {hlData.items.map((item) => (
                      <HighlightCard
                        key={item.id}
                        item={item}
                        onDelete={handleDeleteHighlight}
                        onUpdate={handleUpdateHighlight}
                      />
                    ))}
                  </div>
                  <Pagination page={hlPage} totalPages={hlData.total_pages} onPageChange={setHlPage} />
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Practice dialogs */}
      <PracticeStartDialog
        open={waPracticeDialogOpen}
        onOpenChange={setWaPracticeDialogOpen}
        mode="wrong"
        totalCount={waStats?.unmastered ?? 0}
        loading={startingPractice}
        onStart={handleStartPractice}
      />
      <PracticeStartDialog
        open={bmPracticeDialogOpen}
        onOpenChange={setBmPracticeDialogOpen}
        mode="bookmark"
        totalCount={bmStats?.total ?? 0}
        loading={startingBmPractice}
        onStart={handleStartBookmarkPractice}
      />
    </div>
  );
}
