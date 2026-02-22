"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePracticeStore } from "@/stores/practice-store";
import { getAttempt } from "@/lib/api/attempts";
import { getTestSetQuestions } from "@/lib/api/test-sets";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PracticeSession } from "./practice-session";

export default function PracticePage() {
  const params = useParams<{ attemptId: string }>();
  const init = usePracticeStore((s) => s.init);
  const storeAttemptId = usePracticeStore((s) => s.attemptId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't re-init if already loaded for this attempt
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

        const questions = await getTestSetQuestions(
          attempt.test_set_id,
          "practice",
        );
        if (cancelled) return;

        init(params.attemptId, questions);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("无法加载练习数据");
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

  return <PracticeSession />;
}
