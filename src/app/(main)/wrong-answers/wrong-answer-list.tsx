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
import type { PaginatedResponse, WrongAnswerItem, WrongAnswerStats } from "@/lib/api/types";

const TYPE_OPTIONS = [
  { value: "all", label: "全部类型" },
  { value: "listening", label: "听力" },
  { value: "reading", label: "阅读" },
];

const MASTERED_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "false", label: "未掌握" },
  { value: "true", label: "已掌握" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "最近错误" },
  { value: "most_wrong", label: "错误最多" },
  { value: "level", label: "按等级" },
];

export function WrongAnswerList() {
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
      setFetchError(err instanceof Error ? err.message : "加载错题失败");
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
      toast.success(result.is_mastered ? "已标记为掌握" : "已取消掌握标记");
    } catch (err) {
      console.error("Failed to toggle mastered", err);
      toast.error("操作失败，请重试");
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
              错题本
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            追踪薄弱环节，定向突破
          </p>
        </div>
        {canAccessPaid && (
          <Button
            onClick={handleStartPractice}
            disabled={startingPractice || !data?.items.length}
          >
            <BookOpen className="mr-1.5 h-4 w-4" />
            {startingPractice ? "生成中..." : "从错题练习"}
          </Button>
        )}
      </div>

      {!canAccessPaid && (
        <UpgradeBanner
          variant="hero"
          title="错题本是 Pro 专属功能"
          description="自动收集每次答错的题目，标记掌握状态，支持从错题直接生成练习"
          features={[
            "自动收集所有错题",
            "按类型、等级筛选",
            "一键从错题生成练习",
            "标记已掌握，追踪进步",
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
              <p className="text-xs text-muted-foreground">总错题</p>
              <p className="text-xl font-bold">{waStats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">已掌握</p>
              <p className="text-xl font-bold">{waStats.mastered}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">未掌握</p>
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
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={mastered} onValueChange={(v) => { setMastered(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MASTERED_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
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
              title="还没有错题"
              description="做完一套题后，答错的题目会自动收集到这里，方便你针对性复习"
              action={
                <Button onClick={() => router.push("/tests")}>
                  去题库开始练习
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
