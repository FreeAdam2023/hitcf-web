"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, LayoutGrid, Headphones, Volume2, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useExamStore } from "@/stores/exam-store";
import { submitAnswer, completeAttempt, deleteAttempt } from "@/lib/api/attempts";
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
  // Pending selection is tied to a specific question.id so navigation cannot
  // leak a stale highlight onto the next question. The derived `pendingSelection`
  // string (computed below after `question` is resolved) reads null whenever
  // the current question doesn't match.
  const [pendingRaw, setPendingRaw] = useState<{ qid: string; key: string } | null>(null);
  // Submit exam confirmation dialog
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Scroll to top and clear focus when navigating between questions.
  // Blur prevents focus-visible ring from leaking onto the next question's
  // first option (React reuses the DOM element at the same list position).
  useEffect(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo({ top: 0 });
  }, [currentIndex]);

  // On unmount: auto-submit if in progress (no "continue exam")
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; });
  const attemptIdRef = useRef(attemptId);
  useEffect(() => { attemptIdRef.current = attemptId; });
  const completingRef = useRef(false);
  useEffect(() => {
    return () => {
      const id = attemptIdRef.current;
      if (!id || completingRef.current) return;
      if (answersRef.current.size > 0) {
        completeAttempt(id).catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listening exam flow state
  const alreadyInProgress = answers.size > 0 || currentIndex > 0;
  const [listeningPhase, setListeningPhase] = useState<"ready" | "countdown" | "playing" | "answering">("ready");
  useEffect(() => {
    if (isListening && listeningPhase === "ready" && alreadyInProgress) {
      setListeningPhase("playing");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3-2-1 countdown before exam starts
  // Reading: starts immediately. Listening: starts after sound check.
  const [countdown, setCountdown] = useState(isListening || alreadyInProgress ? 0 : 3);
  useEffect(() => {
    if (countdown <= 0) {
      if (isListening && listeningPhase === "countdown") {
        setListeningPhase("playing");
      }
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, isListening, listeningPhase]);
  const [answerCountdown, setAnswerCountdown] = useState(0);
  const answerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sound check state (must be before any conditional returns)
  const [soundChecked, setSoundChecked] = useState(false);
  const handleSoundCheck = useCallback(() => {
    setSoundChecked(true);
    try {
      const audio = new Audio("/api/media/sound-check");
      audio.play().catch(() => {
        // Fallback: simple beep if media fails
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
      });
    } catch { /* ignore */ }
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
    // Trigger 3-2-1 countdown, then start playing
    setCountdown(3);
    setListeningPhase("countdown");
  }, [soundChecked]);

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

  const handleComplete = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;
    try {
      // 0 answers → discard silently, no record
      if (answersRef.current.size === 0) {
        await deleteAttempt(attemptId!).catch(() => {});
        toast.info(t("exam.session.discardedEmpty"));
        router.push("/tests");
        return;
      }
      // Safety net: batch re-submit all local answers before completing.
      // Catches any answers where the fire-and-forget POST failed silently.
      const resubmits = Array.from(answersRef.current.entries()).map(
        ([, ans]) =>
          submitAnswer(attemptId!, {
            question_id: ans.question_id,
            question_number: ans.question_number,
            selected: ans.selected,
          }).catch(() => {}),
      );
      await Promise.all(resubmits);
      await completeAttempt(attemptId!);
      router.push(`/results/${attemptId}`);
    } catch (err) {
      console.error("Failed to complete exam", err);
      completingRef.current = false;
    }
  }, [attemptId, router, t]);

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
          // Auto-confirm pending selection or advance without answer
          if (pendingSelectionRef.current) {
            handleConfirmRef.current(pendingSelectionRef.current);
          } else if (currentIndex < questions.length - 1) {
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

  // Derive the pending-selection string for the current question only.
  // If the user navigated away from the question the selection was made on,
  // this is null — preventing stale highlight leakage.
  const pendingSelection: string | null =
    pendingRaw && question && pendingRaw.qid === question.id ? pendingRaw.key : null;

  // Select: only sets pending (no API call yet)
  const handleSelect = useCallback((key: string) => {
    if (!question || submitting) return;
    if (isListening && answers.has(question.id)) return;
    setPendingRaw({ qid: question.id, key });
  }, [question, submitting, isListening, answers]);

  // Confirm: optimistic update + fire-and-forget API call.
  // Advance immediately — don't block on network.
  const handleConfirm = useCallback((overrideKey?: string) => {
    const key = overrideKey ?? pendingSelection;
    if (!question || !attemptId || !key || submitting) return;

    const payload = {
      question_id: question.id,
      question_number: question.question_number,
      selected: key,
    };

    // Optimistic: update local state immediately
    setAnswer(question.id, payload);
    setPendingRaw(null);

    // Fire-and-forget: submit to backend with retry (no await)
    (async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await submitAnswer(attemptId, payload);
          return;
        } catch (err) {
          console.error(`Submit attempt ${attempt + 1}/3 failed`, err);
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }
      // All retries failed — answer is saved locally, will be submitted on exam complete
      console.error("Failed to submit answer after 3 retries", payload);
    })();

    // Auto-advance to next question — no delay for reading
    if (isListening) {
      if (answerTimerRef.current) {
        clearInterval(answerTimerRef.current);
        answerTimerRef.current = null;
      }
      if (currentIndex < questions.length - 1) {
        setTimeout(() => {
          goNext();
          setListeningPhase("playing");
        }, 500);
      }
    } else {
      if (currentIndex < questions.length - 1) {
        goNext();
      }
    }
  }, [question, attemptId, pendingSelection, submitting, setAnswer, isListening, currentIndex, questions.length, goNext]);

  // Stable refs for callbacks to avoid listener/timer churn
  const pendingSelectionRef = useRef(pendingSelection);
  useEffect(() => { pendingSelectionRef.current = pendingSelection; });
  const handleConfirmRef = useRef(handleConfirm);
  useEffect(() => { handleConfirmRef.current = handleConfirm; });
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

      // Enter = confirm pending selection
      if (e.key === "Enter" && pendingSelectionRef.current) {
        e.preventDefault();
        handleConfirmRef.current();
        return;
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
          (document.activeElement as HTMLElement)?.blur();
          goNextRef.current();
        } else if (e.key === "ArrowLeft" && currentIndex > 0) {
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          goPrevRef.current();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [questions, currentIndex]);

  if (!question || !attemptId || !startedAt) return <LoadingSpinner />;

  // ── 3-2-1 countdown ──
  if (countdown > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center">
          <div
            key={countdown}
            className="text-8xl sm:text-9xl font-bold text-primary animate-in zoom-in-50 fade-in duration-300"
          >
            {countdown}
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            {isListening ? t("exam.session.getReadyListening") : t("exam.session.getReadyReading")}
          </p>
        </div>
      </div>
    );
  }

  const currentAnswer = answers.get(question.id);
  const isLast = currentIndex === questions.length - 1;
  // Build a compatible answers map for QuestionNavigator (reading only)
  const navigatorAnswers = new Map<string, { is_correct?: boolean | null }>();
  answers.forEach((_ans, qid) => {
    navigatorAnswers.set(qid, { is_correct: null });
  });

  // --- Listening layout: system-paced, no manual navigation ---
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
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={async () => {
                if (attemptId) {
                  await deleteAttempt(attemptId).catch(() => {});
                  attemptIdRef.current = null;
                }
                router.push("/tests");
              }}
            >
              {t("exam.session.exitExam")}
            </Button>
          </div>
        </div>
      );
    }

    // "Playing" and "Answering" phases — two-column layout like reading
    return (
      <div className="select-none grid gap-2 lg:gap-3 lg:grid-cols-[1fr_220px] lg:h-full lg:overflow-hidden lg:rounded-xl lg:bg-muted/40 lg:p-2.5">
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
            examSelected={pendingSelection ?? currentAnswer?.selected ?? null}
            audioOnly={question.options.every((o) => !o.text?.trim())}
            horizontal={!!question.has_image}
            vocabDisabled
          />

          {/* Confirm button */}
          {listeningPhase === "answering" && !answers.has(question.id) && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => handleConfirm()}
                disabled={!pendingSelection || submitting}
                className="min-w-[200px]"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {t("exam.session.confirmAnswer")}
              </Button>
            </div>
          )}
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
        </div>

        {/* Mobile floating navigator */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 h-12 w-12 rounded-full shadow-lg lg:hidden"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[70vh]">
            <div className="overflow-y-auto p-4 pb-8">
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
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // --- Reading layout: two-column with navigator ---
  return (
    <div className="select-none grid gap-2 lg:gap-3 lg:grid-cols-[1fr_220px] lg:h-full lg:overflow-hidden lg:rounded-xl lg:bg-muted/40 lg:p-2.5">
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
          examMode
        />

        <OptionList
          options={question.options}
          answer={null}
          onSelect={handleSelect}
          disabled={submitting}
          mode="exam"
          examSelected={pendingSelection ?? currentAnswer?.selected ?? null}
          audioOnly={false}
          vocabDisabled
        />

        <Separator />

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("exam.session.prev")}
          </Button>

          {/* Confirm button */}
          {!answers.has(question.id) && (
            <Button
              size="lg"
              onClick={() => handleConfirm()}
              disabled={!pendingSelection || submitting}
              className="min-w-[200px]"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {t("exam.session.confirmAnswer")}
            </Button>
          )}

          {!isLast ? (
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
            >
              {t("exam.session.next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <div className="w-[85px]" />
          )}
        </div>
      </div>

      {/* Desktop sidebar navigator */}
      <div className="hidden lg:flex lg:flex-col lg:gap-3 overflow-y-auto scrollbar-on-hover rounded-xl bg-card border shadow-sm p-3">
        <QuestionNavigator
          total={questions.length}
          currentIndex={currentIndex}
          answers={navigatorAnswers}
          questionIds={questions.map((q) => q.id)}
          onNavigate={goToQuestion}
          mode="exam"
          flaggedQuestions={new Set()}
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full text-destructive hover:bg-destructive/10"
          onClick={() => setShowSubmitDialog(true)}
          disabled={submitting}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {t("exam.session.submitExam")}
        </Button>
      </div>

      {/* Mobile floating navigator */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 h-12 w-12 rounded-full shadow-lg lg:hidden"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[70vh]">
          <div className="overflow-y-auto p-4 pb-8 space-y-3">
            <QuestionNavigator
              total={questions.length}
              currentIndex={currentIndex}
              answers={navigatorAnswers}
              questionIds={questions.map((q) => q.id)}
              onNavigate={goToQuestion}
              mode="exam"
              flaggedQuestions={new Set()}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={() => setShowSubmitDialog(true)}
              disabled={submitting}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {t("exam.session.submitExam")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Submit exam confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("exam.session.submitConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {answers.size < questions.length
                ? t("exam.session.submitConfirmDesc", { unanswered: questions.length - answers.size })
                : t("exam.session.submitConfirmAll")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("exam.session.submitCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              {t("exam.session.submitOk")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
