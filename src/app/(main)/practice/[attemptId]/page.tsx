"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { usePracticeStore } from "@/stores/practice-store";
import { getAttempt } from "@/lib/api/attempts";
import { getTestSetQuestions } from "@/lib/api/test-sets";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { PracticeSession } from "./practice-session";

export default function PracticePage() {
  const params = useParams<{ attemptId: string }>();
  const init = usePracticeStore((s) => s.init);
  const storeAttemptId = usePracticeStore((s) => s.attemptId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const attempt = await getAttempt(params.attemptId, { signal });

      if (attempt.status === "completed") {
        window.location.href = `/results/${params.attemptId}`;
        return;
      }

      const questions = await getTestSetQuestions(
        attempt.test_set_id,
        "practice",
        { signal },
      );

      if (signal?.aborted) return;
      init(params.attemptId, questions, attempt.test_set_name, attempt.test_set_type);
      setLoading(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("无法加载练习数据");
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

  return <PracticeSession />;
}
