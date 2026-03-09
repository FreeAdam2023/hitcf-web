"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Mic, Clock, Calendar, RotateCcw, List, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PronunciationScoreCard } from "@/components/speaking/pronunciation-score-card";
import { WordScoreList } from "@/components/speaking/word-score-list";
import { getSpeakingAttempt } from "@/lib/api/speaking-attempts";
import type { SpeakingAttemptResponse } from "@/lib/api/types";
import type { PronunciationScores } from "@/hooks/use-speech-assessment";
import type { WordScore } from "@/hooks/use-speech-assessment";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

export default function SpeakingResultsPage() {
  const t = useTranslations();
  const params = useParams<{ attemptId: string }>()!;
  const [attempt, setAttempt] = useState<SpeakingAttemptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSpeakingAttempt(params.attemptId)
      .then(setAttempt)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span className="ml-3 text-sm text-muted-foreground">
          {t("speakingPractice.results.loading")}
        </span>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t("speakingPractice.results.notFound")}
      </div>
    );
  }

  const scores: PronunciationScores | null = attempt.scores
    ? {
        accuracy: attempt.scores.accuracy,
        fluency: attempt.scores.fluency,
        completeness: attempt.scores.completeness,
        prosody: attempt.scores.prosody,
        overall: attempt.scores.overall,
      }
    : null;

  const wordScores: WordScore[] = attempt.word_scores.map((w) => ({
    word: w.word,
    accuracy: w.accuracy,
    errorType: w.errorType as WordScore["errorType"],
  }));

  // Build retry URL
  const retryUrl = `/speaking-practice?testSetId=${attempt.test_set_id}&questionId=${attempt.question_id}&mode=${attempt.mode}`;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Breadcrumb
        items={[
          { label: t("testDetail.breadcrumbTests"), href: "/tests?tab=speaking" },
          { label: attempt.test_set_name ?? t("speakingPractice.title") },
          { label: t("speakingPractice.results.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t("speakingPractice.results.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {attempt.test_set_name}
            </p>
          </div>
        </div>
        <Badge variant={attempt.mode === "exam" ? "default" : "secondary"}>
          {attempt.mode === "exam"
            ? t("speakingPractice.examMode")
            : t("speakingPractice.practiceMode")}
        </Badge>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {attempt.completed_at
            ? formatDate(attempt.completed_at)
            : formatDate(attempt.started_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(attempt.duration_seconds)}
        </span>
        {scores && (
          <span className="font-medium text-foreground">
            {t("speakingPractice.overall")}: {scores.overall}/100
          </span>
        )}
      </div>

      {/* Transcript */}
      {attempt.transcript && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("speakingPractice.transcript")}
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {attempt.transcript}
          </p>
        </div>
      )}

      {/* Scores */}
      {scores && (
        <>
          <Separator />
          <div className="grid gap-4 lg:grid-cols-2">
            <PronunciationScoreCard scores={scores} />
            <div className="rounded-lg border bg-card p-4">
              <WordScoreList words={wordScores} />
            </div>
          </div>
        </>
      )}

      {/* Action buttons */}
      <Separator />
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="default">
          <Link href={retryUrl}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t("speakingPractice.retryTopic")}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/history">
            <List className="mr-1.5 h-3.5 w-3.5" />
            {t("speakingPractice.allRecords")}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tests?tab=speaking">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            {t("speakingPractice.backToTests")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
