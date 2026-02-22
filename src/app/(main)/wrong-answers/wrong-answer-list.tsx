"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { listWrongAnswers, toggleMastered, practiceWrongAnswers } from "@/lib/api/wrong-answers";
import { usePracticeStore } from "@/stores/practice-store";
import { getTestSetQuestions } from "@/lib/api/test-sets";
import type { PaginatedResponse, WrongAnswerItem } from "@/lib/api/types";

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

const TYPE_LABELS: Record<string, string> = {
  listening: "听力",
  reading: "阅读",
};

export function WrongAnswerList() {
  const router = useRouter();
  const initPractice = usePracticeStore((s) => s.init);

  const [data, setData] = useState<PaginatedResponse<WrongAnswerItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingPractice, setStartingPractice] = useState(false);

  // Filters
  const [type, setType] = useState("all");
  const [mastered, setMastered] = useState("all");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listWrongAnswers({
        type: type === "all" ? undefined : type,
        is_mastered: mastered === "all" ? undefined : mastered === "true",
        page,
        page_size: 20,
      });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [type, mastered, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleMastered = async (id: string) => {
    try {
      const result = await toggleMastered(id);
      // Update the local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === id ? { ...item, is_mastered: result.is_mastered } : item,
          ),
        };
      });
    } catch (err) {
      console.error("Failed to toggle mastered", err);
    }
  };

  const handleStartPractice = async () => {
    setStartingPractice(true);
    try {
      const result = await practiceWrongAnswers({
        type: type === "all" ? undefined : type,
        count: 10,
      });

      // Fetch full question details using the first question's test_set_id
      const questions = await getTestSetQuestions(result.test_set_id, "practice");
      // Filter to only the questions from wrong answers practice
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
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">错题本</h1>
        <Button
          size="sm"
          onClick={handleStartPractice}
          disabled={startingPractice || !data?.items.length}
        >
          <BookOpen className="mr-1 h-4 w-4" />
          {startingPractice ? "正在生成..." : "从错题练习"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
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
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : !data?.items.length ? (
        <div className="py-16 text-center text-muted-foreground">
          暂无错题记录
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-start gap-3 pt-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.question_number && (
                        <span className="text-sm font-medium text-muted-foreground">
                          #{item.question_number}
                        </span>
                      )}
                      {item.question_type && (
                        <Badge variant="outline">
                          {TYPE_LABELS[item.question_type] || item.question_type}
                        </Badge>
                      )}
                      {item.level && <Badge variant="secondary">{item.level}</Badge>}
                      <span className="text-xs text-muted-foreground">
                        错误 {item.wrong_count} 次
                      </span>
                    </div>
                    {item.question_text && (
                      <p className="text-sm line-clamp-2">{item.question_text}</p>
                    )}
                  </div>
                  <Button
                    variant={item.is_mastered ? "secondary" : "outline"}
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleToggleMastered(item.id)}
                  >
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                    {item.is_mastered ? "已掌握" : "标记掌握"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {data.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page >= data.total_pages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
