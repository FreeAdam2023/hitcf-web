"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { getWritingAttempt } from "@/lib/api/writing-attempts";
import { getTestSetQuestions } from "@/lib/api/test-sets";
import { useWritingExamStore } from "@/stores/writing-exam-store";
import type { QuestionBrief } from "@/lib/api/types";
import { WritingExamSession } from "./writing-exam-session";

export default function WritingExamPage() {
  const t = useTranslations();
  const params = useParams<{ attemptId: string }>()!;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const init = useWritingExamStore((s) => s.init);
  const goToTask = useWritingExamStore((s) => s.goToTask);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const attempt = await getWritingAttempt(params.attemptId);

        if (attempt.status === "completed") {
          router.replace(`/writing-exam/${params.attemptId}/results`);
          return;
        }
        if (attempt.status === "grading") {
          router.replace(`/writing-exam/${params.attemptId}/results`);
          return;
        }

        // Load questions for the test set
        const questions = await getTestSetQuestions(attempt.test_set_id, "practice");
        const writingTasks = questions
          .filter((q: QuestionBrief) => q.type === "writing")
          .sort((a: QuestionBrief, b: QuestionBrief) => a.question_number - b.question_number);

        if (cancelled) return;

        init(
          attempt.id,
          attempt.test_set_id,
          writingTasks,
          attempt.mode as "practice" | "exam",
          attempt.time_limit_seconds,
          attempt.started_at,
          attempt.essays,
        );
        // ?task=N → jump to that tâche (1-indexed)
        const taskParam = searchParams.get("task");
        if (taskParam) {
          const idx = Math.max(0, Math.min(parseInt(taskParam, 10) - 1, writingTasks.length - 1));
          if (idx > 0) goToTask(idx);
        }
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load writing exam", err);
          setError(t("writingExam.loadError"));
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [params.attemptId, router, init, t]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="py-16 text-center text-muted-foreground">{error}</div>
    );
  }

  return (
    <WritingExamSession singleTaskMode={!!searchParams.get("task")} />
  );
}
