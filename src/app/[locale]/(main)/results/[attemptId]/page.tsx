"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { getAttemptReview } from "@/lib/api/attempts";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { ResultsView } from "./results-view";
import { useTranslations } from "next-intl";
import type { AttemptReview } from "@/lib/api/types";

export default function ResultsPage() {
  const t = useTranslations();
  const params = useParams<{ attemptId: string }>()!;
  const [review, setReview] = useState<AttemptReview | null>(null);
  const [loading, setLoading] = useState(true);
  const retriesRef = useRef(0);

  const fetchReview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAttemptReview(params.attemptId);
      setReview(data);
      retriesRef.current = 0;
    } catch {
      // Auto-retry once after a short delay (covers mobile wake-up network lag)
      if (retriesRef.current < 1) {
        retriesRef.current += 1;
        await new Promise((r) => setTimeout(r, 1500));
        try {
          const data = await getAttemptReview(params.attemptId);
          setReview(data);
          retriesRef.current = 0;
          return;
        } catch {
          // fall through to error state
        }
      }
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, [params.attemptId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  // Re-fetch when page becomes visible again (mobile wake-up from background)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !review) {
        retriesRef.current = 0;
        fetchReview();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [review, fetchReview]);

  if (loading) return <LoadingSpinner />;
  if (!review) {
    return (
      <ErrorState
        message={t("results.loadError")}
        onRetry={fetchReview}
      />
    );
  }

  return <ResultsView attempt={review} />;
}
