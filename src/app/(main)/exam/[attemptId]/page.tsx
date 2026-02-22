"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useExamStore } from "@/stores/exam-store";
import { getAttempt } from "@/lib/api/attempts";
import { getTestSet, getTestSetQuestions } from "@/lib/api/test-sets";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ExamSession } from "./exam-session";

export default function ExamPage() {
  const params = useParams<{ attemptId: string }>();
  const init = useExamStore((s) => s.init);
  const storeAttemptId = useExamStore((s) => s.attemptId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeAttemptId === params.attemptId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const attempt = await getAttempt(params.attemptId);
        if (cancelled) return;

        if (attempt.status === "completed") {
          window.location.href = `/results/${params.attemptId}`;
          return;
        }

        const testSet = await getTestSet(attempt.test_set_id);
        if (cancelled) return;

        const questions = await getTestSetQuestions(attempt.test_set_id, "exam");
        if (cancelled) return;

        const timeLimitSeconds = testSet.time_limit_minutes * 60;
        init(params.attemptId, questions, timeLimitSeconds, attempt.started_at);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("无法加载考试数据");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.attemptId, storeAttemptId, init]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="py-16 text-center text-muted-foreground">{error}</div>
    );
  }

  return <ExamSession />;
}
