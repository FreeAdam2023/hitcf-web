"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePracticeStore } from "@/stores/practice-store";
import { getAttempt } from "@/lib/api/attempts";
import { getTestSetQuestions } from "@/lib/api/test-sets";
import { fetchDrillNav, loadDrillQuestion } from "@/lib/api/speed-drill";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { PracticeSession } from "./practice-session";

export default function PracticePage() {
  const t = useTranslations();
  const params = useParams<{ attemptId: string }>()!;
  const init = usePracticeStore((s) => s.init);
  const initDrill = usePracticeStore((s) => s.initDrill);
  const storeAttemptId = usePracticeStore((s) => s.attemptId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const attempt = await getAttempt(params.attemptId, { signal });

      if (attempt.status !== "in_progress") {
        window.location.href = `/results/${params.attemptId}`;
        return;
      }

      if (attempt.lazy_load) {
        // Lazy loading: fetch all question IDs (lightweight) + first question on demand
        const nav = await fetchDrillNav(params.attemptId, 1, 2000);
        if (signal?.aborted) return;

        const firstId = nav.question_ids[0];
        if (!firstId) throw new Error("No questions in drill");

        const firstQ = await loadDrillQuestion(firstId, params.attemptId);
        if (signal?.aborted) return;

        initDrill(params.attemptId, nav.total, nav.question_ids, nav.answered_ids, firstQ);
      } else {
        const questions = await getTestSetQuestions(
          attempt.test_set_id,
          "practice",
          {
            signal,
            questionIds: attempt.filtered_question_ids,
          },
        );

        if (signal?.aborted) return;
        init(params.attemptId, questions, attempt.test_set_name, attempt.test_set_type, attempt.started_at, attempt.answers, attempt.previously_answered);
      }
      setLoading(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(t("practice.session.loadError"));
      setLoading(false);
    }
  }, [params.attemptId, init, initDrill]);

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

  return <PracticeSession />;
}
