"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  Minus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ExamTimer } from "@/components/exam/exam-timer";
import { AccentToolbar } from "@/components/writing/accent-toolbar";
import { useWritingExamStore } from "@/stores/writing-exam-store";
import { saveWritingEssays, completeWritingAttempt } from "@/lib/api/writing-attempts";
import { cn } from "@/lib/utils";

const TASK_WORD_RANGES: Record<number, [number, number]> = {
  1: [60, 120],
  2: [120, 150],
  3: [120, 180],
};

const TASK_LABELS: Record<number, string> = {
  1: "Tache 1",
  2: "Tache 2",
  3: "Tache 3",
};

export function WritingExamSession() {
  const t = useTranslations();
  const router = useRouter();
  const {
    attemptId,
    tasks,
    currentTaskIndex,
    essays,
    timeLimitSeconds,
    startedAt,
    mode,
    dirty,
    setEssay,
    goToTask,
    markSaved,
    setStatus,
  } = useWritingExamStore();

  const [completing, setCompleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Prevent accidental back navigation
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.error(t("writingExam.exitWarning"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [t]);

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
      } catch {
        // Silent failure — will retry next interval
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [attemptId, markSaved]);

  // Keyboard shortcuts: Ctrl+1/2/3 to switch tasks
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

  // Focus textarea when switching tasks
  useEffect(() => {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [currentTaskIndex]);

  const completingRef = useRef(false);
  const handleComplete = useCallback(async () => {
    if (completingRef.current || !attemptId) return;
    completingRef.current = true;
    setCompleting(true);
    setStatus("grading");

    // Save latest essays before completing
    const state = useWritingExamStore.getState();
    const essaysPayload: Record<string, { text: string; word_count: number }> = {};
    for (const [key, text] of Object.entries(state.essays)) {
      essaysPayload[key] = {
        text,
        word_count: text.trim() ? text.trim().split(/\s+/).length : 0,
      };
    }

    try {
      await saveWritingEssays(attemptId, essaysPayload);
      await completeWritingAttempt(attemptId);
      router.push(`/writing-exam/${attemptId}/results`);
    } catch (err) {
      console.error("Failed to complete writing exam", err);
      toast.error(t("writingExam.completeFailed"));
      setStatus("in_progress");
      completingRef.current = false;
      setCompleting(false);
    }
  }, [attemptId, router, t, setStatus]);

  const handleTimeUp = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  if (!attemptId || !startedAt || tasks.length === 0) return null;

  const task = tasks[currentTaskIndex];
  const taskNum = currentTaskIndex + 1;
  const essayText = essays[String(taskNum)] || "";
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const wordRange = TASK_WORD_RANGES[taskNum] || [60, 300];

  // Grading overlay
  if (completing) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium">{t("writingExam.gradingInProgress")}</p>
        <p className="text-sm text-muted-foreground">{t("writingExam.gradingWait")}</p>
      </div>
    );
  }

  // Build task tab status indicators
  const taskTabs = tasks.map((_, idx) => {
    const num = idx + 1;
    const text = essays[String(num)] || "";
    const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
    const hasContent = wc > 0;
    return { num, wc, hasContent };
  });

  // Submit dialog — show per-task word count summary
  const emptyTasks = taskTabs.filter((t) => !t.hasContent);
  const outOfRangeTasks = taskTabs.filter((t) => {
    if (!t.hasContent) return false;
    const range = TASK_WORD_RANGES[t.num];
    return range && (t.wc < range[0] || t.wc > range[1]);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t("writingExam.title")}
        </h2>
        {mode === "exam" && timeLimitSeconds > 0 && (
          <ExamTimer
            timeLimitSeconds={timeLimitSeconds}
            startedAt={startedAt}
            onTimeUp={handleTimeUp}
            prominent
          />
        )}
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
            <span>{TASK_LABELS[tab.num] || `Tache ${tab.num}`}</span>
            {tab.hasContent ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-green-500" />
                {tab.wc}w
              </span>
            ) : (
              <Minus className="h-3 w-3 text-muted-foreground/50" />
            )}
          </button>
        ))}
      </div>

      {/* Split view: prompt + editor */}
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

        {/* Right: Editor */}
        <div className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            className="w-full flex-1 rounded-lg border bg-background px-4 py-3 text-sm leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[300px] resize-y"
            placeholder={t("writingExam.placeholder")}
            value={essayText}
            onChange={(e) => setEssay(String(taskNum), e.target.value)}
          />

          {/* Accent toolbar */}
          <AccentToolbar textareaRef={textareaRef} />

          {/* Word count */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("writingExam.wordCount")}{" "}
              <span
                className={cn(
                  "font-medium",
                  wordCount > 0 && (wordCount < wordRange[0] || wordCount > wordRange[1])
                    ? "text-orange-500"
                    : wordCount >= wordRange[0] && wordCount <= wordRange[1]
                    ? "text-green-600"
                    : "",
                )}
              >
                {wordCount}
              </span>
              {" / "}
              {wordRange[0]}-{wordRange[1]}
            </span>
            {dirty && (
              <span className="text-muted-foreground/50">{t("writingExam.unsaved")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation + Submit */}
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

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={completing}>
              <Send className="mr-1 h-4 w-4" />
              {t("writingExam.submitAll")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("writingExam.confirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <div className="space-y-1">
                    {taskTabs.map((tab) => {
                      const range = TASK_WORD_RANGES[tab.num];
                      const inRange = range && tab.wc >= range[0] && tab.wc <= range[1];
                      return (
                        <div key={tab.num} className="flex items-center justify-between text-sm">
                          <span>Tache {tab.num}</span>
                          <span className={cn(
                            "font-medium",
                            !tab.hasContent ? "text-red-500" :
                            !inRange ? "text-orange-500" :
                            "text-green-600",
                          )}>
                            {tab.hasContent ? `${tab.wc} ${t("writingExam.words")}` : t("writingExam.empty")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {emptyTasks.length > 0 && (
                    <p className="text-orange-600 text-xs">
                      {t("writingExam.emptyWarning", { count: emptyTasks.length })}
                    </p>
                  )}
                  {outOfRangeTasks.length > 0 && (
                    <p className="text-orange-500 text-xs">
                      {t("writingExam.wordRangeWarning")}
                    </p>
                  )}
                  <p className="text-xs">{t("writingExam.submitWarning")}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("writingExam.continueWriting")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleComplete}>
                {t("writingExam.confirmSubmit")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
