"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, PenLine, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { getWritingAttemptResults } from "@/lib/api/writing-attempts";
import { getTestSet } from "@/lib/api/test-sets";
import type { WritingAttemptResults, WritingFeedback, TestSetDetail } from "@/lib/api/types";
import { useWritingExamStore } from "@/stores/writing-exam-store";

const CRITERION_NAMES: Record<string, string> = {
  adequation: "Adequation",
  coherence: "Coherence",
  vocabulaire: "Vocabulaire",
  grammaire: "Grammaire",
};

function scoreColor(score: number): string {
  if (score >= 4) return "bg-green-500";
  if (score >= 3) return "bg-yellow-500";
  if (score >= 2) return "bg-orange-500";
  return "bg-red-500";
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function TaskFeedbackPanel({
  taskNumber,
  feedback,
  essayText,
  wordCount,
}: {
  taskNumber: number;
  feedback: WritingFeedback;
  essayText: string;
  wordCount: number;
})
/* eslint-enable @typescript-eslint/no-unused-vars */ {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const criteria = ["adequation", "coherence", "vocabulaire", "grammaire"] as const;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Tache {taskNumber}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{feedback.total_score}</span>
            <span className="text-sm text-muted-foreground">/ 20</span>
            <Badge variant="secondary">NCLC {feedback.estimated_nclc}</Badge>
            <Badge variant="outline">{feedback.estimated_level}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 4 criteria scores */}
        <div className="grid gap-3">
          {criteria.map((key) => {
            const c = feedback[key];
            if (!c) return null;
            const criterionDesc = t(`testDetail.criteria.${key}`);
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {CRITERION_NAMES[key]}
                    <span className="ml-1 text-xs text-muted-foreground">({criterionDesc})</span>
                  </span>
                  <span className="text-sm font-semibold">{c.score}/5</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full transition-all ${scoreColor(c.score)}`}
                    style={{ width: `${(c.score / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{c.feedback}</p>
              </div>
            );
          })}
        </div>

        {/* Overall comment */}
        <Separator />
        <div>
          <p className="mb-1 text-sm font-medium">{t("testDetail.overallComment")}</p>
          <p className="text-sm text-muted-foreground">{feedback.overall_comment}</p>
        </div>

        {/* Expandable corrections + suggestions */}
        {(feedback.corrections.length > 0 || feedback.vocab_suggestions.length > 0) && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:underline"
            >
              {expanded ? t("writingExam.results.hideDetails") : t("writingExam.results.showDetails")}
            </button>
            {expanded && (
              <div className="space-y-3">
                {feedback.corrections.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">{t("testDetail.corrections")}</p>
                    <div className="space-y-2">
                      {feedback.corrections.map((c, i) => (
                        <div key={i} className="rounded-md bg-muted/50 p-2.5 text-xs">
                          <div className="flex items-start gap-1.5">
                            <span className="line-through text-red-500">{c.original}</span>
                            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="font-medium text-green-600">{c.corrected}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground">{c.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {feedback.vocab_suggestions.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">{t("testDetail.vocabSuggestions")}</p>
                    <div className="space-y-2">
                      {feedback.vocab_suggestions.map((v, i) => (
                        <div key={i} className="rounded-md bg-muted/50 p-2.5 text-xs">
                          <div className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">{v.original}</span>
                            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="font-medium text-blue-600">{v.suggestion}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground">{v.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function WritingExamResultsPage() {
  const t = useTranslations();
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const reset = useWritingExamStore((s) => s.reset);

  const [results, setResults] = useState<WritingAttemptResults | null>(null);
  const [testSet, setTestSet] = useState<TestSetDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear exam store on results page
    reset();

    getWritingAttemptResults(params.attemptId)
      .then((data) => {
        setResults(data);
        return getTestSet(data.test_set_id).catch(() => null);
      })
      .then((ts) => {
        if (ts) setTestSet(ts);
      })
      .catch((err) => {
        console.error("Failed to load results", err);
      })
      .finally(() => setLoading(false));
  }, [params.attemptId, reset]);

  if (loading) return <LoadingSpinner />;
  if (!results) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t("writingExam.results.notFound")}
      </div>
    );
  }

  const totalPossible = results.tasks.length * 20;
  const pct = totalPossible > 0 ? Math.round(((results.total_score ?? 0) / totalPossible) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Breadcrumb
        items={[
          { label: t("testDetail.breadcrumbTests"), href: "/tests?tab=writing" },
          { label: testSet?.name ?? t("writingExam.results.title") },
        ]}
      />

      {/* Summary card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <PenLine className="mt-0.5 h-6 w-6 shrink-0 text-violet-500" />
            <div className="flex-1">
              <CardTitle className="text-xl">
                {testSet?.name ?? t("writingExam.results.title")}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {results.mode === "exam" ? t("writingExam.results.examMode") : t("writingExam.results.practiceMode")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold">{results.total_score ?? 0}</span>
              <span className="text-lg text-muted-foreground"> / {totalPossible}</span>
            </div>
            {results.average_nclc && (
              <Badge variant="secondary" className="text-base px-3 py-1">
                {results.average_nclc}
              </Badge>
            )}
          </div>
          <Progress value={pct} className="h-2" />
          <p className="text-sm text-muted-foreground text-right">{pct}%</p>
        </CardContent>
      </Card>

      {/* Per-task results */}
      {results.tasks.map((task) =>
        task.feedback ? (
          <TaskFeedbackPanel
            key={task.task_number}
            taskNumber={task.task_number}
            feedback={task.feedback}
            essayText={task.essay_text}
            wordCount={task.word_count}
          />
        ) : (
          <Card key={task.task_number}>
            <CardContent className="py-6 text-center text-muted-foreground">
              Tache {task.task_number} — {t("writingExam.results.notGraded")}
            </CardContent>
          </Card>
        ),
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/tests?tab=writing")}
        >
          {t("writingExam.results.backToTests")}
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            if (results.test_set_id) {
              router.push(`/tests/${results.test_set_id}`);
            }
          }}
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          {t("writingExam.results.tryAgain")}
        </Button>
      </div>
    </div>
  );
}
