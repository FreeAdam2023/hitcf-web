"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useExamStore } from "@/stores/exam-store";
import { getAttempt } from "@/lib/api/attempts";
import { getTestSet, getTestSetQuestions } from "@/lib/api/test-sets";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { ExamSession } from "./exam-session";

export default function ExamPage() {
  const params = useParams<{ attemptId: string }>();
  const init = useExamStore((s) => s.init);
  const storeAttemptId = useExamStore((s) => s.attemptId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const attempt = await getAttempt(params.attemptId);

      if (attempt.status === "completed") {
        window.location.href = `/results/${params.attemptId}`;
        return;
      }

      const testSet = await getTestSet(attempt.test_set_id);
      const questions = await getTestSetQuestions(attempt.test_set_id, "exam");
      const timeLimitSeconds = testSet.time_limit_minutes * 60;

      // Extract existing answers for progress recovery
      const existingAnswers = attempt.answers
        .filter((a) => a.selected)
        .map((a) => ({
          question_id: a.question_id,
          question_number: a.question_number,
          selected: a.selected!,
        }));

      init(
        params.attemptId,
        questions,
        timeLimitSeconds,
        attempt.started_at,
        existingAnswers.length > 0 ? existingAnswers : undefined,
        attempt.flagged_questions.length > 0 ? attempt.flagged_questions : undefined,
      );
      setLoading(false);
    } catch {
      setError("无法加载考试数据");
      setLoading(false);
    }
  }, [params.attemptId, init]);

  useEffect(() => {
    if (storeAttemptId === params.attemptId) {
      setLoading(false);
      return;
    }
    load();
  }, [params.attemptId, storeAttemptId, load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return <ExamSession />;
}
