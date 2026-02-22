"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAttempt } from "@/lib/api/attempts";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ResultsView } from "./results-view";
import type { AttemptDetail } from "@/lib/api/types";

export default function ResultsPage() {
  const params = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttempt(params.attemptId)
      .then(setAttempt)
      .catch(() => setAttempt(null))
      .finally(() => setLoading(false));
  }, [params.attemptId]);

  if (loading) return <LoadingSpinner />;
  if (!attempt) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        无法加载成绩数据
      </div>
    );
  }

  return <ResultsView attempt={attempt} />;
}
