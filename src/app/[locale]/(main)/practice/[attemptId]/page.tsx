"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { usePracticeStore } from "@/stores/practice-store";
import { getAttempt } from "@/lib/api/attempts";
import { ApiError } from "@/lib/api/client";
import { getTestSetQuestions, fetchTestSetsProgress } from "@/lib/api/test-sets";
import { getLocalePath } from "@/lib/utils";
import { fetchDrillNav, loadDrillQuestion } from "@/lib/api/speed-drill";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { PracticeSession } from "./practice-session";

export default function PracticePage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ attemptId: string }>()!;
  const init = usePracticeStore((s) => s.init);
  const initDrill = usePracticeStore((s) => s.initDrill);
  const setTestSetDupPct = usePracticeStore((s) => s.setTestSetDupPct);
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
        window.location.href = getLocalePath(`/results/${params.attemptId}`);
        return;
      }

      if (attempt.lazy_load) {
        // Determine which nav page to fetch (resume may be on a later page)
        let startPage = 1;
        try {
          const saved = localStorage.getItem(`practiceIndex:${params.attemptId}`);
          if (saved) { const idx = parseInt(saved, 10); if (!isNaN(idx) && idx >= 50) startPage = Math.floor(idx / 50) + 1; }
        } catch {}
        // Cross-device fallback: use server-stored index, then answered_count
        if (startPage === 1 && attempt.current_index != null && attempt.current_index >= 50) {
          startPage = Math.floor(attempt.current_index / 50) + 1;
        } else if (startPage === 1 && attempt.answered_count >= 50) {
          startPage = Math.floor(attempt.answered_count / 50) + 1;
        }

        const nav = await fetchDrillNav(params.attemptId, startPage);
        if (signal?.aborted) return;

        const firstId = nav.question_ids[0];
        if (!firstId) throw new Error("No questions in drill");

        const firstQ = await loadDrillQuestion(firstId, params.attemptId);
        if (signal?.aborted) return;

        // For smart mode: pass question_meta from the attempt response so
        // the navigator can render level groups without loading all 39 questions.
        // Also pass a synthetic header label ("智能组题 · N 题").
        const drillMeta = attempt.mode === "smart"
          ? {
              testSetName: `${t("common.modes.smart")} · ${t("common.questions", { count: nav.total })}`,
              questionMeta: attempt.question_meta,
            }
          : undefined;

        initDrill(params.attemptId, nav.total, nav.page, nav.question_ids, nav.answered_ids, firstQ, attempt.current_index, drillMeta);
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
        init(params.attemptId, questions, attempt.test_set_name, attempt.test_set_type, attempt.started_at, attempt.answers, attempt.previously_answered, attempt.current_index);

        // Dup-ratio badge: only meaningful for classic/extended listening+reading
        // (hitcf sets are all duplicates; speed drill / mock exam bypass this path).
        const group = attempt.test_set_group;
        const type = attempt.test_set_type;
        if ((group === "classic" || group === "extended") && (type === "listening" || type === "reading")) {
          fetchTestSetsProgress({ type, group })
            .then((map) => {
              if (signal?.aborted) return;
              const p = map[attempt.test_set_id];
              if (p && p.total > 0) {
                setTestSetDupPct(Math.round((p.dup / p.total) * 100));
              } else {
                setTestSetDupPct(null);
              }
            })
            .catch(() => setTestSetDupPct(null));
        } else {
          setTestSetDupPct(null);
        }
      }
      setLoading(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // 404 = attempt doesn't exist or belongs to another user → go to tests
      if (err instanceof ApiError && err.status === 404) {
        router.replace("/tests");
        return;
      }
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
