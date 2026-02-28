"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CheckCircle, LayoutGrid, AlertTriangle, BookmarkCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePracticeStore } from "@/stores/practice-store";
import { useTranscriptLang } from "@/hooks/use-transcript-lang";
import { submitAnswer, completeAttempt } from "@/lib/api/attempts";
import { getQuestionDetail, generateExplanation } from "@/lib/api/questions";
import { QuestionDisplay } from "@/components/practice/question-display";
import { OptionList } from "@/components/practice/option-list";
import { QuestionNavigator } from "@/components/practice/question-navigator";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ReportDialog } from "@/components/practice/report-dialog";
import { FrenchText } from "@/components/practice/french-text";
import type { Explanation, QuestionBrief } from "@/lib/api/types";

/** Transcript block: sentence-by-sentence trilingual cards (FR / EN bridge / Native) */
function TranscriptBlock({
  question,
  explanation,
  showEn,
  showNative,
  onToggleEn,
  onToggleNative,
  transcriptLabel,
  locale,
}: {
  question: QuestionBrief;
  explanation: Explanation | null;
  showEn: boolean;
  showNative: boolean;
  onToggleEn: () => void;
  onToggleNative: () => void;
  transcriptLabel: string;
  locale: string;
}) {
  const isListening = question.type === "listening";
  const hasTranscript = !!question.transcript;
  // Show options in transcript for listening Q1-10 only when real French text exists
  const showTranscriptOptions =
    isListening &&
    question.question_number <= 10 &&
    question.options.length > 0 &&
    question.options.some(
      (o) => o.text && o.text.length > 2 && !o.text.startsWith("Proposition"),
    );

  if (!hasTranscript && !showTranscriptOptions) return null;

  const sentences = explanation?.sentence_translation;
  const optTrans = explanation?.option_translations;

  return (
    <div className="rounded-lg bg-muted/50 p-3 text-sm animate-in fade-in duration-300 max-h-[40vh] overflow-y-auto scrollbar-hidden">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 font-medium">
          <FileText className="h-4 w-4" />
          {transcriptLabel}
        </h4>
        <div className="flex gap-1">
          {/* EN bridge toggle — hidden for English-native users (bridge = native) */}
          {locale !== "en" && (
            <button
              onClick={onToggleEn}
              className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                showEn
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              EN
            </button>
          )}
          {/* Native toggle */}
          <button
            onClick={onToggleNative}
            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
              showNative
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {locale === "en" ? "EN" : locale.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Sentence-by-sentence trilingual cards */}
      {sentences && sentences.length > 0 ? (
        <div className="space-y-2">
          {sentences.map((s, i) => {
            const nativeText = s.native || s.zh;
            return (
              <div key={i} className="space-y-0.5">
                <p className="font-medium leading-relaxed text-foreground">
                  <FrenchText text={s.fr} />
                </p>
                {/* EN bridge (hidden for EN-native users since native toggle covers it) */}
                {locale !== "en" && showEn && s.en && (
                  <p className="leading-relaxed text-blue-600 dark:text-blue-400">
                    {s.en}
                  </p>
                )}
                {/* Native translation */}
                {showNative && nativeText && (
                  <p className="leading-relaxed text-emerald-600 dark:text-emerald-400">
                    {nativeText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : hasTranscript ? (
        /* Fallback: raw transcript before explanation loads */
        <p className="whitespace-pre-wrap leading-relaxed text-foreground">
          <FrenchText text={question.transcript!} />
        </p>
      ) : null}

      {/* Options: vertical with indented EN/ZH */}
      {showTranscriptOptions && (
        <div className={sentences || hasTranscript ? "mt-2 border-t border-border/50 pt-2" : ""}>
          <div className="space-y-2">
            {question.options.map((opt) => {
              const tr = optTrans?.[opt.key];
              const optNative = tr?.native || tr?.zh;
              const hasRealText = opt.text && opt.text.length > 2 && !opt.text.startsWith("Proposition");
              return (
                <div key={opt.key}>
                  <p className="font-medium text-foreground">
                    {opt.key}. {hasRealText && <FrenchText text={opt.text} />}
                  </p>
                  {locale !== "en" && showEn && tr?.en && (
                    <p className="pl-5 text-blue-600 dark:text-blue-400">{tr.en}</p>
                  )}
                  {showNative && optNative && (
                    <p className="pl-5 text-emerald-600 dark:text-emerald-400">{optNative}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function PracticeSession() {
  const t = useTranslations();
  const router = useRouter();
  const {
    attemptId,
    questions,
    currentIndex,
    answers,
    setAnswer,
    goNext,
    goPrev,
    goToQuestion,
  } = usePracticeStore();

  const locale = useLocale();
  const { showEn, showNative, toggleEn, toggleNative } = useTranscriptLang();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [wrongCollected, setWrongCollected] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  // Fetch explanation — called once by parent, shared with both panels
  const fetchingRef = useRef(false);
  const fetchExplanation = useCallback((questionId: string, force?: boolean) => {
    if (fetchingRef.current && !force) return;
    fetchingRef.current = true;
    setExplanationLoading(true);
    setExplanationError(false);
    generateExplanation(questionId, force, locale)
      .then(setExplanation)
      .catch(() => setExplanationError(true))
      .finally(() => {
        fetchingRef.current = false;
        setExplanationLoading(false);
      });
  }, [locale]);

  // Clear pending selection and indicators when navigating
  useEffect(() => {
    setSelectedKey(null);
    setSavedIndicator(false);
    setWrongCollected(false);
    setExplanation(null);
    setExplanationLoading(false);
    setExplanationError(false);
    setHasImage(false);
    fetchingRef.current = false;
  }, [currentIndex]);

  // Prevent accidental navigation (browser back/forward swipe + tab close)
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; });

  // Prevent accidental back navigation (but no beforeunload — answers are saved in real-time)
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (answersRef.current.size > 0) {
        window.history.pushState(null, "", window.location.href);
        toast.error(t("practice.session.exitWarning"));
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const question = questions[currentIndex];
  const currentAnswer = question ? (answers.get(question.id) ?? null) : null;

  // Prefetch explanation as soon as question loads (transcript translations + explanation ready before user answers)
  useEffect(() => {
    if (question && !explanation && !explanationLoading) {
      fetchExplanation(question.id);
    }
  }, [question, explanation, explanationLoading, fetchExplanation]);

  // In practice mode, clicking an option only sets the pending selection (does not submit)
  const handleSelect = useCallback((key: string) => {
    if (!question || !attemptId) return;
    if (answers.has(question.id) || submitting) return;
    setSelectedKey(key);
  }, [question, attemptId, answers, submitting]);

  // Confirm button triggers actual submission
  const handleConfirm = useCallback(async () => {
    if (!selectedKey || !question || !attemptId) return;
    if (answers.has(question.id) || submitting) return;
    setSubmitting(true);
    setSubmittingKey(selectedKey);
    try {
      const res = await submitAnswer(attemptId, {
        question_id: question.id,
        question_number: question.question_number,
        selected: selectedKey,
      });
      let correctAnswer = res.correct_answer;
      if (correctAnswer === undefined) {
        try {
          const detail = await getQuestionDetail(question.id);
          correctAnswer = detail.correct_answer;
        } catch {
          // ignore
        }
      }
      const fullAnswer = { ...res, correct_answer: correctAnswer ?? null };
      setAnswer(question.id, fullAnswer);
      setSelectedKey(null);
      if (fullAnswer.is_correct === false) {
        setWrongCollected(true);
        setTimeout(() => setWrongCollected(false), 2500);
      } else {
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      }
    } catch (err) {
      console.error("Failed to submit answer", err);
      toast.error(t("common.errors.submitFailed"));
    } finally {
      setSubmitting(false);
      setSubmittingKey(null);
    }
  }, [selectedKey, question, attemptId, answers, submitting, setAnswer]);

  const handleComplete = async () => {
    if (!attemptId) return;
    setCompleting(true);
    try {
      await completeAttempt(attemptId);
      router.push(`/results/${attemptId}`);
    } catch (err) {
      console.error("Failed to complete attempt", err);
      setCompleting(false);
    }
  };

  const handleGoToQuestion = (index: number) => {
    goToQuestion(index);
  };

  const handleNext = useCallback(() => {
    goNext();
  }, [goNext]);

  const handlePrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  // Stable refs for keyboard handler to avoid listener churn
  const handleSelectRef = useRef(handleSelect);
  useEffect(() => { handleSelectRef.current = handleSelect; });
  const handleConfirmRef = useRef(handleConfirm);
  useEffect(() => { handleConfirmRef.current = handleConfirm; });
  const handleNextRef = useRef(handleNext);
  useEffect(() => { handleNextRef.current = handleNext; });
  const handlePrevRef = useRef(handlePrev);
  useEffect(() => { handlePrevRef.current = handlePrev; });

  // Keyboard shortcuts: 1-4 / A-D select, Enter confirm, arrows navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const q = questions[currentIndex];
      if (!q) return;
      const answered = answersRef.current.has(q.id);

      // Enter = confirm pending selection
      if (e.key === "Enter" && !answered) {
        e.preventDefault();
        handleConfirmRef.current();
        return;
      }

      // Ignore when modifier keys are held (e.g. Ctrl+C to copy)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const keyMap: Record<string, number> = {
        "1": 0, "2": 1, "3": 2, "4": 3,
        a: 0, b: 1, c: 2, d: 3,
      };
      const optIndex = keyMap[e.key.toLowerCase()];
      if (optIndex !== undefined && !answered && q.options[optIndex]) {
        e.preventDefault();
        handleSelectRef.current(q.options[optIndex].key);
        return;
      }

      if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        e.preventDefault();
        handleNextRef.current();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        handlePrevRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [questions, currentIndex]);

  if (!question || !attemptId) return <LoadingSpinner />;

  const isLast = currentIndex === questions.length - 1;
  const allAnswered = answers.size === questions.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr_320px] h-full overflow-hidden">
      {/* 左侧：题号导航 (桌面) */}
      <div className="hidden lg:block overflow-y-auto scrollbar-hidden">
        <div className="py-3">
          <QuestionNavigator
            total={questions.length}
            currentIndex={currentIndex}
            answers={answers}
            questionIds={questions.map((q) => q.id)}
            onNavigate={handleGoToQuestion}
            questions={questions.map((q) => ({ type: q.type, level: q.level }))}
          />
        </div>
      </div>

      {/* 中间：主内容 */}
      <div className="space-y-4 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <QuestionDisplay
              question={question}
              index={currentIndex}
              total={questions.length}
              onImageLoaded={setHasImage}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-orange-500"
            title={t("practice.session.reportTitle")}
            onClick={() => setReportOpen(true)}
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        </div>

        <OptionList
          options={question.options}
          answer={currentAnswer}
          onSelect={handleSelect}
          disabled={submitting}
          pendingSelected={selectedKey}
          submittingKey={submittingKey}
          audioOnly={question.type === "listening" && question.question_number <= 10}
          horizontal={hasImage}
        />

        {/* Confirm button: visible when option selected but not yet submitted */}
        {selectedKey && !currentAnswer && (
          <div className="flex justify-center">
            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="min-w-[160px]"
            >
              {submitting ? t("common.actions.submitting") : t("practice.session.confirmAnswer")}
            </Button>
          </div>
        )}

        {savedIndicator && (
          <p className="text-xs text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-bottom-2 duration-300">{t("practice.session.answerCorrect")}</p>
        )}
        {wrongCollected && (
          <div className="wrong-answer-toast flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700 shadow-sm dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300">
            <span className="wrong-answer-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
              <BookmarkCheck className="h-4 w-4" />
            </span>
            <span className="font-medium">{t("practice.session.addedToWrongNote")}</span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("practice.session.prev")}
          </Button>

          {allAnswered && (
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={completing}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              {completing ? t("common.actions.submitting") : t("practice.session.completePractice")}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={isLast}
          >
            {t("practice.session.next")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* 听力原文（导航按钮下方，内容可滚动） */}
        {currentAnswer && question.type === "listening" && (
          <TranscriptBlock question={question} explanation={explanation} showEn={showEn} showNative={showNative} onToggleEn={toggleEn} onToggleNative={toggleNative} transcriptLabel={t("practice.session.tabTranscript")} locale={locale} />
        )}

        {/* 移动端：解析面板 */}
        <div className="lg:hidden">
          {currentAnswer && (
            <ExplanationPanel
              explanation={explanation}
              questionId={question.id}
              defaultOpen={currentAnswer.is_correct === false}
              loading={explanationLoading}
              error={explanationError}
              onRetry={() => fetchExplanation(question.id)}
              onForceRefresh={() => fetchExplanation(question.id, true)}
              onOpen={() => !explanation && !explanationLoading && fetchExplanation(question.id)}
            />
          )}
        </div>
      </div>

      {/* 右侧：解析面板 (桌面) */}
      <div className="hidden lg:block overflow-y-auto scrollbar-hidden">
        <div className="space-y-3">
          {currentAnswer ? (
            <ExplanationPanel
              explanation={explanation}
              questionId={question.id}
              defaultOpen={currentAnswer.is_correct === false}
              loading={explanationLoading}
              error={explanationError}
              onRetry={() => fetchExplanation(question.id)}
              onForceRefresh={() => fetchExplanation(question.id, true)}
              onOpen={() => !explanation && !explanationLoading && fetchExplanation(question.id)}
            />
          ) : (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              <p>{t("practice.session.viewAfterAnswer")}</p>
            </div>
          )}
        </div>
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
              answers={answers}
              questionIds={questions.map((q) => q.id)}
              onNavigate={handleGoToQuestion}
              questions={questions.map((q) => ({ type: q.type, level: q.level }))}
            />
          </div>
        </SheetContent>
      </Sheet>

      {question && (
        <ReportDialog
          questionId={question.id}
          open={reportOpen}
          onOpenChange={setReportOpen}
        />
      )}
    </div>
  );
}
