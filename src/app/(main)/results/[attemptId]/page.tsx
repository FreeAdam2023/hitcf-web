"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAttemptReview } from "@/lib/api/attempts";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { ResultsView } from "./results-view";
import type { AttemptReview } from "@/lib/api/types";

export default function ResultsPage() {
  const params = useParams<{ attemptId: string }>();
  const [review, setReview] = useState<AttemptReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttemptReview(params.attemptId)
      .then(setReview)
      .catch(() => setReview(null))
      .finally(() => setLoading(false));
  }, [params.attemptId]);

  if (loading) return <LoadingSpinner />;
  if (!review) {
    return (
      <ErrorState
        message="无法加载成绩数据"
        onRetry={() => {
          setLoading(true);
          getAttemptReview(params.attemptId)
            .then(setReview)
            .catch(() => setReview(null))
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  return <ResultsView attempt={review} />;
}
