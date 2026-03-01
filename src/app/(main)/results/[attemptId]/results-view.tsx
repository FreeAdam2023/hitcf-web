"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ScoreCard } from "@/components/results/score-card";
import { EncouragementCard } from "@/components/results/encouragement-card";
import { TcfScoreGrid } from "@/components/results/tcf-score-grid";
import { NclcTable } from "@/components/results/nclc-table";
import { LevelBreakdown } from "@/components/results/level-breakdown";
import { QuestionReviewItem } from "@/components/results/question-review-item";
import { calcTcfScore } from "@/lib/tcf-levels";
import { createAttempt } from "@/lib/api/attempts";
import { listTestSets } from "@/lib/api/test-sets";
import { practiceWrongAnswers } from "@/lib/api/wrong-answers";
import { useAuthStore } from "@/stores/auth-store";
import { ShareDialog } from "@/components/results/share-dialog";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { TYPE_COLORS } from "@/lib/constants";
import { useTranslations } from "next-intl";
import type { AttemptReview, TestSetItem } from "@/lib/api/types";

interface ResultsViewProps {
  attempt: AttemptReview;
}

export function ResultsView({ attempt }: ResultsViewProps) {
  const t = useTranslations();
  const router = useRouter();
  const canAccessPaid = useAuthStore((s) => {
    if (s.isLoading) return true;
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const [filter, setFilter] = useState<"all" | "wrong">("all");
  const [practicingWrong, setPracticingWrong] = useState(false);
  const [startingNext, setStartingNext] = useState(false);
  const [nextTestSet, setNextTestSet] = useState<TestSetItem | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const score = attempt.score ?? 0;
  const isPointBased = attempt.test_set_type === "listening" || attempt.test_set_type === "reading";
  const tcfPoints = isPointBased ? calcTcfScore(attempt.answers) : undefined;
  const sortedAnswers = [...attempt.answers].sort(
    (a, b) => a.question_number - b.question_number,
  );
  const filteredAnswers =
    filter === "wrong"
      ? sortedAnswers.filter((a) => a.is_correct === false)
      : sortedAnswers;

  // Calculate time taken
  let timeTakenSeconds: number | null = null;
  if (attempt.started_at && attempt.completed_at) {
    const start = new Date(attempt.started_at).getTime();
    const end = new Date(attempt.completed_at).getTime();
    timeTakenSeconds = Math.round((end - start) / 1000);
  }

  // Format completed date
  const completedDate = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const wrongCount = sortedAnswers.filter((a) => a.is_correct === false).length;

  // Find next test set
  useEffect(() => {
    if (!attempt.test_set_type) return;
    const type = attempt.test_set_type as "listening" | "reading" | "speaking" | "writing";
    listTestSets({ type, page_size: 100 })
      .then((res) => {
        const sorted = [...res.items].sort((a, b) => a.order - b.order);
        const currentIdx = sorted.findIndex((t) => t.id === attempt.test_set_id);
        if (currentIdx >= 0 && currentIdx < sorted.length - 1) {
          setNextTestSet(sorted[currentIdx + 1]);
        }
      })
      .catch((err) => {
        console.error("ResultsView: failed to load next test set", err);
      });
  }, [attempt.test_set_id, attempt.test_set_type]);

  async function handlePracticeWrong() {
    if (!attempt.test_set_type || wrongCount === 0) return;
    setPracticingWrong(true);
    try {
      const res = await practiceWrongAnswers({ type: attempt.test_set_type });
      if (!res?.id) {
        setPracticingWrong(false);
        return;
      }
      router.push(`/practice/${res.id}`);
    } catch {
      setPracticingWrong(false);
    }
  }

  async function handleNextTest() {
    if (!nextTestSet) return;
    setStartingNext(true);
    try {
      const res = await createAttempt({
        test_set_id: nextTestSet.id,
        mode: attempt.mode,
      });
      const path = attempt.mode === "exam" ? "exam" : "practice";
      router.push(`/${path}/${res.id}`);
    } catch {
      setStartingNext(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: t("results.breadcrumbTests"), href: attempt.test_set_type ? `/tests?tab=${attempt.test_set_type}` : "/tests" },
          ...(attempt.test_set_id
            ? [{ label: attempt.test_set_name || t("results.breadcrumbReport"), href: `/tests/${attempt.test_set_id}` }]
            : []),
          { label: t("results.breadcrumbReport") },
        ]}
      />
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            {attempt.test_set_name || t("results.defaultTitle")}
          </h1>
          <Badge variant="secondary">
            {t(`common.modes.${attempt.mode}`)}
          </Badge>
          {attempt.test_set_type && (
            <Badge
              variant="outline"
              className={TYPE_COLORS[attempt.test_set_type]?.badge ?? ""}
            >
              {t(`common.types.${attempt.test_set_type}`)}
            </Badge>
          )}
        </div>
        {completedDate && (
          <p className="mt-1 text-sm text-muted-foreground">{completedDate}</p>
        )}
      </div>

      {/* Score card */}
      <ScoreCard
        score={score}
        total={attempt.total}
        answeredCount={attempt.answered_count}
        timeTakenSeconds={timeTakenSeconds}
        tcfPoints={tcfPoints}
      />

      {/* TCF score grid (listening/reading only) */}
      {isPointBased && <TcfScoreGrid answers={sortedAnswers} />}

      {/* Encouragement card */}
      <EncouragementCard score={score} total={attempt.total} tcfPoints={tcfPoints} />

      {/* NCLC level table (listening/reading only) */}
      {isPointBased && tcfPoints != null && (
        <NclcTable
          tcfPoints={tcfPoints}
          testType={attempt.test_set_type as "listening" | "reading"}
        />
      )}

      {/* Level breakdown */}
      <LevelBreakdown answers={attempt.answers} />

      {/* Upgrade prompt for free users */}
      {!canAccessPaid && (
        <UpgradeBanner
          variant="hero"
          title={t("results.upgradeBanner.title")}
          description={t("results.upgradeBanner.description")}
          features={[
            t("results.upgradeBanner.features.0"),
            t("results.upgradeBanner.features.1"),
            t("results.upgradeBanner.features.2"),
            t("results.upgradeBanner.features.3"),
          ]}
        />
      )}

      {/* Per-question review */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("results.reviewTitle")}</h2>
          <div className="flex gap-1">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              {t("results.filterAll")}
            </Button>
            <Button
              variant={filter === "wrong" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("wrong")}
            >
              {t("results.filterWrongOnly")}{wrongCount > 0 && ` (${wrongCount})`}
            </Button>
          </div>
        </div>

        <div className="divide-y rounded-md border">
          {filteredAnswers.length > 0 ? (
            filteredAnswers.map((ans) => (
              <QuestionReviewItem key={ans.question_id} answer={ans} />
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {filter === "wrong" ? t("results.noWrongAnswers") : t("results.noAnswerRecords")}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {wrongCount > 0 && attempt.test_set_type && (
          <Button
            onClick={handlePracticeWrong}
            disabled={practicingWrong}
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            {practicingWrong ? t("common.actions.creating") : t("results.practiceWrong", { count: wrongCount })}
          </Button>
        )}
        <Button variant="outline" onClick={() => setShareOpen(true)}>
          <Share2 className="mr-1.5 h-4 w-4" />
          {t("results.share.button")}
        </Button>
        {nextTestSet && (
          <Button onClick={handleNextTest} disabled={startingNext}>
            <ArrowRight className="mr-1.5 h-4 w-4" />
            {startingNext ? t("common.actions.creating") : t("results.nextSet", { name: nextTestSet.name })}
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href={attempt.test_set_type ? `/tests?tab=${attempt.test_set_type}` : "/tests"}>{t("results.backToTests")}</Link>
        </Button>
      </div>

      {/* Share poster dialog */}
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        testSetName={attempt.test_set_name || t("results.defaultTitle")}
        testSetType={attempt.test_set_type || "listening"}
        score={score}
        total={attempt.total}
        tcfPoints={tcfPoints}
        timeTakenSeconds={timeTakenSeconds}
        completedDate={
          attempt.completed_at
            ? new Date(attempt.completed_at).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
        }
      />
    </div>
  );
}
