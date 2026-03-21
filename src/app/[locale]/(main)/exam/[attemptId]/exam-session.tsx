"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, LayoutGrid, Headphones, Volume2 } from "lucide-react";
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

  // Listening exam flow state
  const [listeningPhase, setListeningPhase] = useState<"ready" | "playing" | "answering">("ready");

  // Skip splash if exam already in progress (e.g. page refresh mid-exam)
  useEffect(() => {
    if (isListening && listeningPhase === "ready" && (answers.size > 0 || currentIndex > 0)) {
      setListeningPhase("playing");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [answerCountdown, setAnswerCountdown] = useState(0);
  const answerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Listening exam: handle audio playback complete — start 15s answer countdown
  const handleAudioComplete = useCallback(() => {
    setListeningPhase("answering");
    setAnswerCountdown(15);
    if (answerTimerRef.current) clearInterval(answerTimerRef.current);
    answerTimerRef.current = setInterval(() => {
      setAnswerCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(answerTimerRef.current!);
          answerTimerRef.current = null;
          // Auto-advance (no answer)
          if (currentIndex < questions.length - 1) {
            goNext();
            setListeningPhase("playing");
          } else {
            handleComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentIndex, questions.length, goNext, handleComplete]);

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

      // Listening exam mode: clear countdown and auto-advance after 800ms
      if (isListening) {
        if (answerTimerRef.current) {
          clearInterval(answerTimerRef.current);
          answerTimerRef.current = null;
        }
        if (currentIndex < questions.length - 1) {
          setTimeout(() => {
            goNext();
            setListeningPhase("playing");
          }, 800);
        }
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
  const listeningPhaseRef = useRef(listeningPhase);
  useEffect(() => { listeningPhaseRef.current = listeningPhase; });

  // Reset listening phase when question changes (except initial "ready" state)
  useEffect(() => {
    if (isListening && listeningPhase !== "ready") {
      setListeningPhase("playing");
      setAnswerCountdown(0);
      if (answerTimerRef.current) {
        clearInterval(answerTimerRef.current);
        answerTimerRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (answerTimerRef.current) clearInterval(answerTimerRef.current);
    };
  }, []);

  // Keyboard shortcuts: 1-4 / A-D select, arrows navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const q = questions[currentIndex];
      if (!q) return;

      // Ignore when modifier keys are held (e.g. Ctrl+C to copy)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Listening exam: only allow answer keys during "answering" phase, block all navigation
      if (isListeningRef.current) {
        if (listeningPhaseRef.current !== "answering") return;
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          return;
        }
      }

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

      // Reading mode: arrow navigation
      if (!isListeningRef.current) {
        if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
          e.preventDefault();
          goNextRef.current();
        } else if (e.key === "ArrowLeft" && currentIndex > 0) {
          e.preventDefault();
          goPrevRef.current();
        }
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

  // --- Listening layout: system-paced, no manual navigation ---
  // Sound check: play a short beep to verify audio works + unlock browser autoplay
  const [soundChecked, setSoundChecked] = useState(false);
  const handleSoundCheck = useCallback(() => {
    setSoundChecked(true);
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      gain.gain.value = 0.2;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => ctx.close(), 1000);
    } catch { /* AudioContext unavailable */ }
    // Also unlock HTML <audio> autoplay by playing a silent data URI
    try {
      const silence = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
      silence.volume = 0.01;
      silence.play().then(() => silence.pause()).catch(() => {});
    } catch { /* ignore */ }
  }, []);

  const handleStartListening = useCallback(() => {
    // Ensure autoplay is unlocked even if user skipped sound check
    if (!soundChecked) {
      try {
        const silence = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
        silence.volume = 0.01;
        silence.play().then(() => silence.pause()).catch(() => {});
      } catch { /* ignore */ }
    }
    setListeningPhase("playing");
  }, [soundChecked]);

  if (isListening) {
    // "Ready" splash screen — sound check + unlock browser autoplay
    if (listeningPhase === "ready") {
      return (
        <div className="mx-auto max-w-lg flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Headphones className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("exam.session.listeningTitle")}</h2>
            <p className="mt-2 text-muted-foreground">{t("exam.session.listeningDesc")}</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground text-left">
            <p>• {t("exam.session.listeningRule1", { questions: questions.length, minutes: Math.ceil(timeLimitSeconds / 60) })}</p>
            <p>• {t("exam.session.listeningRule2")}</p>
            <p>• {t("exam.session.listeningRule3")}</p>
            <p>• {t("exam.session.listeningRule4")}</p>
          </div>
          <div className="flex flex-col items-center gap-3 mt-4">
            <Button variant="outline" onClick={handleSoundCheck} className="gap-2">
              <Volume2 className="h-4 w-4" />
              {soundChecked ? t("exam.session.soundCheckDone") : t("exam.session.soundCheck")}
            </Button>
            <Button size="lg" onClick={handleStartListening}>
              {t("exam.session.startListening")}
            </Button>
          </div>
        </div>
      );
    }

    // "Playing" and "Answering" phases — two-column layout like reading
    return (
      <div className="grid gap-2 lg:gap-3 lg:grid-cols-[1fr_220px] h-full overflow-hidden lg:rounded-xl lg:bg-muted/40 lg:p-2.5">
        <div className="space-y-4 overflow-y-auto scrollbar-on-hover lg:rounded-xl lg:bg-card lg:border lg:shadow-sm lg:p-5">
          {/* Header: question number + timer */}
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
            autoPlayAudio
            examMode
            onAudioPlaybackComplete={handleAudioComplete}
            vocabDisabled
          />

          {/* Answer countdown — only during answering phase */}
          {listeningPhase === "answering" && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-500 text-amber-600 tabular-nums text-sm font-bold">
                {answerCountdown}
              </div>
              <span className="text-muted-foreground">{t("exam.session.answerNow")}</span>
            </div>
          )}

          {listeningPhase === "playing" && (
            <p className="text-center text-sm text-muted-foreground">{t("exam.session.listenCarefully")}</p>
          )}

          <OptionList
            options={question.options}
            answer={null}
            onSelect={handleSelect}
            disabled={submitting || listeningPhase === "playing" || answers.has(question.id)}
            mode="exam"
            examSelected={currentAnswer?.selected ?? null}
            audioOnly={question.options.every((o) => !o.text?.trim())}
            horizontal={!!question.has_image}
            vocabDisabled
          />
        </div>

        {/* Desktop sidebar: read-only navigator + submit on last question */}
        <div className="hidden lg:flex lg:flex-col lg:gap-3 overflow-y-auto scrollbar-on-hover">
          <div className="rounded-xl bg-card border shadow-sm p-3">
            <QuestionNavigator
              total={questions.length}
              currentIndex={currentIndex}
              answers={navigatorAnswers}
              questionIds={questions.map((q) => q.id)}
              onNavigate={() => {}}
              mode="exam"
              flaggedQuestions={new Set()}
            />
          </div>
          {isLast && (
            <div className="rounded-xl bg-card border shadow-sm p-3">
              {submitDialog}
            </div>
          )}
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
                onNavigate={() => {}}
                mode="exam"
                flaggedQuestions={new Set()}
              />
              {isLast && <div className="mt-4">{submitDialog}</div>}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // --- Reading layout: two-column with navigator ---
  return (
    <div className="grid gap-2 lg:gap-3 lg:grid-cols-[1fr_220px] h-full overflow-hidden lg:rounded-xl lg:bg-muted/40 lg:p-2.5">
      <div className="space-y-4 overflow-y-auto scrollbar-on-hover lg:rounded-xl lg:bg-card lg:border lg:shadow-sm lg:p-5">
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
      <div className="hidden lg:block overflow-y-auto scrollbar-on-hover rounded-xl bg-card border shadow-sm p-3">
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
