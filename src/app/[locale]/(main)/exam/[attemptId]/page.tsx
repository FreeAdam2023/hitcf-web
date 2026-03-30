"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useExamStore } from "@/stores/exam-store";
import { getAttempt, getMockExamQuestions } from "@/lib/api/attempts";
import { ApiError } from "@/lib/api/client";
import { getTestSet, getTestSetQuestions } from "@/lib/api/test-sets";
import { getLocalePath } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { ExamSession } from "./exam-session";

export default function ExamPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ attemptId: string }>()!;
  const init = useExamStore((s) => s.init);
  const storeAttemptId = useExamStore((s) => s.attemptId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const attempt = await getAttempt(params.attemptId, { signal });

      if (attempt.status === "completed") {
        window.location.href = getLocalePath(`/results/${params.attemptId}`);
        return;
      }

      let questions;
      let timeLimitSeconds: number;

      if (attempt.is_mock_exam) {
        questions = await getMockExamQuestions(params.attemptId, { signal });
        // Compute time limit from question types present
        const hasListening = questions.some((q) => q.type === "listening");
        const hasReading = questions.some((q) => q.type === "reading");
        timeLimitSeconds = (hasListening ? 35 : 0) * 60 + (hasReading ? 60 : 0) * 60;
      } else {
        const testSet = await getTestSet(attempt.test_set_id, { signal });
        questions = await getTestSetQuestions(attempt.test_set_id, "exam", { signal });
        timeLimitSeconds = testSet.time_limit_minutes * 60;
      }

      // Extract existing answers for progress recovery
      const existingAnswers = attempt.answers
        .filter((a) => a.selected)
        .map((a) => ({
          question_id: a.question_id,
          question_number: a.question_number,
          selected: a.selected as string,
        }));

      if (signal?.aborted) return;
      init(
        params.attemptId,
        questions,
        timeLimitSeconds,
        attempt.started_at,
        existingAnswers.length > 0 ? existingAnswers : undefined,
        attempt.flagged_questions.length > 0 ? attempt.flagged_questions : undefined,
      );
      setLoading(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (err instanceof ApiError && err.status === 404) {
        router.replace("/tests");
        return;
      }
      setError(t("exam.session.loadError"));
      setLoading(false);
    }
  }, [params.attemptId, init]);

  useEffect(() => {
    if (storeAttemptId === params.attemptId) {
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    load(controller.signal);
    return () => controller.abort();
  }, [params.attemptId, storeAttemptId, load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={() => load()} />;

  return <ExamSession />;
}
