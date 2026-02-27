"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Loader2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { AccentToolbar } from "@/components/writing/accent-toolbar";
import { getWritingAttempt } from "@/lib/api/writing-attempts";
import { saveWritingEssays } from "@/lib/api/writing-attempts";
import { getTestSetQuestions, getTestSet } from "@/lib/api/test-sets";
import { gradeWriting } from "@/lib/api/writing";
import { useWritingExamStore } from "@/stores/writing-exam-store";
import { cn } from "@/lib/utils";
import type { QuestionBrief, WritingFeedback, TestSetDetail } from "@/lib/api/types";

const TASK_WORD_RANGES: Record<number, [number, number]> = {
  1: [60, 120],
  2: [120, 150],
  3: [120, 180],
};

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

export default function WritingPracticePage() {
  const t = useTranslations();
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();

  const {
    attemptId,
    tasks,
    currentTaskIndex,
    essays,
    dirty,
    setEssay,
    goToTask,
    markSaved,
    init,
    reset,
  } = useWritingExamStore();

  const [loading, setLoading] = useState(true);
  const [testSet, setTestSet] = useState<TestSetDetail | null>(null);
  const [grading, setGrading] = useState<Record<string, boolean>>({});
  const [gradingResults, setGradingResults] = useState<Record<string, WritingFeedback>>({});
  const [gradingErrors, setGradingErrors] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load attempt + questions
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const attempt = await getWritingAttempt(params.attemptId);
        const [questions, ts] = await Promise.all([
          getTestSetQuestions(attempt.test_set_id, "practice"),
          getTestSet(attempt.test_set_id).catch(() => null),
        ]);

        const writingTasks = questions
          .filter((q: QuestionBrief) => q.type === "writing")
          .sort((a: QuestionBrief, b: QuestionBrief) => a.question_number - b.question_number);

        if (cancelled) return;

        if (ts) setTestSet(ts);
        init(
          attempt.id,
          attempt.test_set_id,
          writingTasks,
          "practice",
          0,
          attempt.started_at,
          attempt.essays,
        );
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load writing practice", err);
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.attemptId, init]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!attemptId) return;
    const interval = setInterval(async () => {
      const state = useWritingExamStore.getState();
      if (!state.dirty || !state.attemptId) return;

      const essaysPayload: Record<string, { text: string; word_count: number }> = {};
      for (const [key, text] of Object.entries(state.essays)) {
        essaysPayload[key] = {
          text,
          word_count: text.trim() ? text.trim().split(/\s+/).length : 0,
        };
      }

      try {
        await saveWritingEssays(state.attemptId, essaysPayload);
        markSaved();
      } catch { /* silent */ }
    }, 30_000);
    return () => clearInterval(interval);
  }, [attemptId, markSaved]);

  // Focus textarea on task switch
  useEffect(() => {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [currentTaskIndex]);

  // Keyboard: Ctrl+1/2/3
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["1", "2", "3"].includes(e.key)) {
        e.preventDefault();
        goToTask(parseInt(e.key) - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goToTask]);

  const handleGrade = useCallback(async (taskIndex: number) => {
    const task = tasks[taskIndex];
    if (!task) return;
    const taskNum = taskIndex + 1;
    const essay = essays[String(taskNum)]?.trim();
    if (!essay || essay.split(/\s+/).length < 10) return;

    setGrading((prev) => ({ ...prev, [String(taskNum)]: true }));
    setGradingErrors((prev) => ({ ...prev, [String(taskNum)]: "" }));

    try {
      const result = await gradeWriting(task.id, taskNum, essay);
      setGradingResults((prev) => ({ ...prev, [String(taskNum)]: result.feedback }));
      toast.success(t("testDetail.gradingComplete"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("testDetail.gradingFailed");
      setGradingErrors((prev) => ({ ...prev, [String(taskNum)]: message }));
      toast.error(message);
    } finally {
      setGrading((prev) => ({ ...prev, [String(taskNum)]: false }));
    }
  }, [tasks, essays, t]);

  if (loading) return <LoadingSpinner />;
  if (!attemptId || tasks.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t("writingExam.loadError")}
      </div>
    );
  }

  const task = tasks[currentTaskIndex];
  const taskNum = currentTaskIndex + 1;
  const essayText = essays[String(taskNum)] || "";
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const wordRange = TASK_WORD_RANGES[taskNum] || [60, 300];
  const isGrading = grading[String(taskNum)] || false;
  const feedback = gradingResults[String(taskNum)];
  const error = gradingErrors[String(taskNum)];

  // Task tab status
  const taskTabs = tasks.map((_, idx) => {
    const num = idx + 1;
    const text = essays[String(num)] || "";
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
    const hasFeedback = !!gradingResults[String(num)];
    return { num, wc, hasContent: wc > 0, hasFeedback };
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Breadcrumb
        items={[
          { label: t("testDetail.breadcrumbTests"), href: "/tests?tab=writing" },
          { label: testSet?.name ?? t("writingPractice.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("writingPractice.title")}</h2>
      </div>

      {/* Task tabs */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
        {taskTabs.map((tab, idx) => (
          <button
            key={tab.num}
            onClick={() => goToTask(idx)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              idx === currentTaskIndex
                ? "bg-background shadow-sm"
                : "hover:bg-background/50",
            )}
          >
            <span>Tache {tab.num}</span>
            {tab.hasFeedback ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : tab.hasContent ? (
              <span className="text-xs text-muted-foreground">{tab.wc}w</span>
            ) : (
              <Minus className="h-3 w-3 text-muted-foreground/50" />
            )}
          </button>
        ))}
      </div>

      {/* Split view */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: Consigne */}
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Consigne
          </h3>
          <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-line">
            {task?.question_text}
          </div>
          {task?.passage && (
            <div className="mt-3 rounded-md bg-muted/50 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {t("writingExam.referenceDocuments")}
              </p>
              <div className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                {task.passage}
              </div>
            </div>
          )}
        </div>

        {/* Right: Editor + Feedback */}
        <div className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            className="w-full flex-1 rounded-lg border bg-background px-4 py-3 text-sm leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[250px] resize-y disabled:opacity-50"
            placeholder={t("writingExam.placeholder")}
            value={essayText}
            onChange={(e) => setEssay(String(taskNum), e.target.value)}
            disabled={isGrading}
          />

          <AccentToolbar textareaRef={textareaRef} />

          {/* Word count + Grade button */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("writingExam.wordCount")}{" "}
              <span className={cn(
                "font-medium",
                wordCount > 0 && (wordCount < wordRange[0] || wordCount > wordRange[1])
                  ? "text-orange-500"
                  : wordCount >= wordRange[0] && wordCount <= wordRange[1]
                  ? "text-green-600"
                  : "",
              )}>
                {wordCount}
              </span>
              {" / "}{wordRange[0]}-{wordRange[1]}
            </span>
            <Button
              size="sm"
              onClick={() => handleGrade(currentTaskIndex)}
              disabled={isGrading || !essayText.trim() || wordCount < 10}
            >
              {isGrading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  {t("testDetail.grading")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  {t("testDetail.submitGrading")}
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback panel (below split view) */}
      {feedback && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            {/* Score header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{feedback.total_score}</span>
                <span className="text-sm text-muted-foreground"> / 20</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">NCLC {feedback.estimated_nclc}</Badge>
                <Badge variant="outline">{feedback.estimated_level}</Badge>
              </div>
            </div>

            {/* 4 criteria */}
            <div className="grid gap-3">
              {(["adequation", "coherence", "vocabulaire", "grammaire"] as const).map((key) => {
                const c = feedback[key];
                if (!c) return null;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {CRITERION_NAMES[key]}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({t(`testDetail.criteria.${key}`)})
                        </span>
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

            <Separator />
            <div>
              <p className="mb-1 text-sm font-medium">{t("testDetail.overallComment")}</p>
              <p className="text-sm text-muted-foreground">{feedback.overall_comment}</p>
            </div>

            {/* Corrections */}
            {feedback.corrections.length > 0 && (
              <>
                <Separator />
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
              </>
            )}

            {/* Vocab suggestions */}
            {feedback.vocab_suggestions.length > 0 && (
              <>
                <Separator />
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
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToTask(currentTaskIndex - 1)}
          disabled={currentTaskIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("writingExam.prevTask")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToTask(currentTaskIndex + 1)}
          disabled={currentTaskIndex >= tasks.length - 1}
        >
          {t("writingExam.nextTask")}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
