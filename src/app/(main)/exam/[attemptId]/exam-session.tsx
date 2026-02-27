"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import { useExamStore } from "@/stores/exam-store";
import { submitAnswer, completeAttempt } from "@/lib/api/attempts";
import { QuestionDisplay } from "@/components/practice/question-display";
import { OptionList } from "@/components/practice/option-list";
import { QuestionNavigator } from "@/components/practice/question-navigator";
import { ExamTimer } from "@/components/exam/exam-timer";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export function ExamSession() {
  const t = useTranslations();
  const router = useRouter();
  const {
    attemptId,
    questions,
    currentIndex,
    answers,
    timeLimitSeconds,
    startedAt,
    testType,
    setAnswer,
    goNext,
    goPrev,
    goToQuestion,
  } = useExamStore();

  const isListening = testType === "listening";

  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Prevent accidental back navigation (no beforeunload — exam state persists via sessionStorage)
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.error(t("exam.session.exitWarning"));
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const completingRef = useRef(false);
  const handleComplete = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;
    setCompleting(true);
    try {
      await completeAttempt(attemptId!);
      router.push(`/results/${attemptId}`);
    } catch (err) {
      console.error("Failed to complete exam", err);
      completingRef.current = false;
      setCompleting(false);
    }
  }, [attemptId, router]);

  const handleTimeUp = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const question = questions[currentIndex];

  const handleSelect = useCallback(async (key: string) => {
    if (!question || !attemptId || submitting) return;
    // Listening mode: once answered, lock the question
    if (isListening && answers.has(question.id)) return;

    setSubmitting(true);
    try {
      await submitAnswer(attemptId, {
        question_id: question.id,
        question_number: question.question_number,
        selected: key,
      });
      setAnswer(question.id, {
        question_id: question.id,
        question_number: question.question_number,
        selected: key,
      });

      // Listening mode: auto-advance after 800ms (except last question)
      if (isListening && currentIndex < questions.length - 1) {
        setTimeout(() => {
          goNext();
        }, 800);
      }
    } catch (err) {
      console.error("Failed to submit answer", err);
      toast.error(t("common.errors.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }, [question, attemptId, submitting, setAnswer, isListening, answers, currentIndex, questions.length, goNext]);

  // Stable refs for keyboard handler to avoid listener churn
  const handleSelectRef = useRef(handleSelect);
  useEffect(() => { handleSelectRef.current = handleSelect; });
  const goNextRef = useRef(goNext);
  useEffect(() => { goNextRef.current = goNext; });
  const goPrevRef = useRef(goPrev);
  useEffect(() => { goPrevRef.current = goPrev; });
  const isListeningRef = useRef(isListening);
  useEffect(() => { isListeningRef.current = isListening; });

  // Keyboard shortcuts: 1-4 / A-D select, arrows navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const q = questions[currentIndex];
      if (!q) return;

      // Ignore when modifier keys are held (e.g. Ctrl+C to copy)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const keyMap: Record<string, number> = {
        "1": 0, "2": 1, "3": 2, "4": 3,
        a: 0, b: 1, c: 2, d: 3,
      };
      const optIndex = keyMap[e.key.toLowerCase()];
      if (optIndex !== undefined && q.options[optIndex]) {
        e.preventDefault();
        handleSelectRef.current(q.options[optIndex].key);
        return;
      }

      // Listening mode: disable left arrow (no going back)
      if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        e.preventDefault();
        goNextRef.current();
      } else if (e.key === "ArrowLeft" && !isListeningRef.current && currentIndex > 0) {
        e.preventDefault();
        goPrevRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [questions, currentIndex]);

  if (!question || !attemptId || !startedAt) return <LoadingSpinner />;

  const currentAnswer = answers.get(question.id);
  const isLast = currentIndex === questions.length - 1;

  // Build a compatible answers map for QuestionNavigator (reading only)
  const navigatorAnswers = new Map<string, { is_correct?: boolean | null }>();
  answers.forEach((_ans, qid) => {
    navigatorAnswers.set(qid, { is_correct: null });
  });

  // Submit dialog shared by both modes
  const submitDialog = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" disabled={completing}>
          <Send className="mr-1 h-4 w-4" />
          {completing ? t("common.actions.submitting") : t("exam.session.submitExam")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("exam.session.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("exam.session.answeredCount", { answered: answers.size, total: questions.length })}
            {answers.size < questions.length &&
              ` ${t("exam.session.unansweredCount", { count: questions.length - answers.size })}`}
            {t("exam.session.submitWarning")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("exam.session.continueExam")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleComplete}>
            {t("exam.session.confirmSubmit")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // --- Listening layout: single column, no navigator, no prev button ---
  if (isListening) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Prominent centered timer */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("exam.session.questionNumber", { current: currentIndex + 1, total: questions.length })}
          </h2>
          <ExamTimer
            timeLimitSeconds={timeLimitSeconds}
            startedAt={startedAt}
            onTimeUp={handleTimeUp}
            prominent
          />
        </div>

        <QuestionDisplay
          question={question}
          index={currentIndex}
          total={questions.length}
          audioMaxPlays={1}
          vocabDisabled
        />

        <OptionList
          options={question.options}
          answer={null}
          onSelect={handleSelect}
          disabled={submitting || answers.has(question.id)}
          mode="exam"
          examSelected={currentAnswer?.selected ?? null}
          audioOnly={question.question_number <= 10}
          vocabDisabled
        />

        <Separator />

        <div className="flex items-center justify-between">
          {/* No prev button in listening mode — spacer for layout */}
          <div />
          {submitDialog}
          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={isLast}
          >
            {t("exam.session.next")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // --- Reading layout: two-column with navigator ---
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
      <div className="space-y-4">
        {/* Header with prominent timer */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("exam.session.questionNumber", { current: currentIndex + 1, total: questions.length })}
          </h2>
          <ExamTimer
            timeLimitSeconds={timeLimitSeconds}
            startedAt={startedAt}
            onTimeUp={handleTimeUp}
            prominent
          />
        </div>

        <QuestionDisplay
          question={question}
          index={currentIndex}
          total={questions.length}
          vocabDisabled
        />

        <OptionList
          options={question.options}
          answer={null}
          onSelect={handleSelect}
          disabled={submitting}
          mode="exam"
          examSelected={currentAnswer?.selected ?? null}
          audioOnly={false}
          vocabDisabled
        />

        <Separator />

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("exam.session.prev")}
          </Button>

          {submitDialog}

          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={isLast}
          >
            {t("exam.session.next")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop sidebar navigator */}
      <div className="hidden lg:block">
        <QuestionNavigator
          total={questions.length}
          currentIndex={currentIndex}
          answers={navigatorAnswers}
          questionIds={questions.map((q) => q.id)}
          onNavigate={goToQuestion}
          mode="exam"
          flaggedQuestions={new Set()}
        />
      </div>

      {/* Mobile floating navigator */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg lg:hidden"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <div className="p-4 pb-8">
            <QuestionNavigator
              total={questions.length}
              currentIndex={currentIndex}
              answers={navigatorAnswers}
              questionIds={questions.map((q) => q.id)}
              onNavigate={goToQuestion}
              mode="exam"
              flaggedQuestions={new Set()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
