"use client";

import { useEffect, useState, useCallback } from "react";
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const attempt = await getAttempt(params.attemptId);

      if (attempt.status === "completed") {
        window.location.href = `/results/${params.attemptId}`;
        return;
      }

      const questions = await getTestSetQuestions(
        attempt.test_set_id,
        "practice",
      );

      init(params.attemptId, questions);
      setLoading(false);
    } catch {
      setError("无法加载练习数据");
      setLoading(false);
    }
  }, [params.attemptId, init]);

  useEffect(() => {
    // Don't re-init if already loaded for this attempt
    if (storeAttemptId === params.attemptId) {
      setLoading(false);
      return;
    }
    load();
  }, [params.attemptId, storeAttemptId, load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return <PracticeSession />;
}
