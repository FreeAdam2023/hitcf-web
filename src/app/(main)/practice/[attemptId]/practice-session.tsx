"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import type { Explanation, QuestionBrief } from "@/lib/api/types";

/** 听力原文：逐句三语卡片（法/英/中） */
function TranscriptBlock({
  question,
  explanation,
  showEn,
  showZh,
  onToggleEn,
  onToggleZh,
}: {
  question: QuestionBrief;
  explanation: Explanation | null;
  showEn: boolean;
  showZh: boolean;
  onToggleEn: () => void;
  onToggleZh: () => void;
}) {
  const isListening = question.type === "listening";
  const hasTranscript = !!question.transcript;
  const hasAudioOptions =
    isListening &&
    question.options.length > 0 &&
    question.options.every(
      (o) => o.text && !o.text.startsWith("Proposition"),
    );

  if (!hasTranscript && !hasAudioOptions) return null;

  const sentences = explanation?.sentence_translation;
  const optTrans = explanation?.option_translations;

  return (
    <div className="rounded-lg bg-muted/50 p-3 text-sm animate-in fade-in duration-300">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 font-medium">
          <FileText className="h-4 w-4" />
          原文
        </h4>
        <div className="flex gap-1">
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
          <button
            onClick={onToggleZh}
            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
              showZh
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            ZH
          </button>
        </div>
      </div>

      {/* Sentence-by-sentence trilingual cards */}
      {sentences && sentences.length > 0 ? (
        <div className="space-y-2">
          {sentences.map((s, i) => (
            <div key={i} className="space-y-0.5">
              <p className="font-medium leading-relaxed text-foreground">
                {s.fr}
              </p>
              {showEn && s.en && (
                <p className="leading-relaxed text-blue-600 dark:text-blue-400">
                  {s.en}
                </p>
              )}
              {showZh && s.zh && (
                <p className="leading-relaxed text-emerald-600 dark:text-emerald-400">
                  {s.zh}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : hasTranscript ? (
        /* Fallback: raw transcript before explanation loads */
        <p className="whitespace-pre-wrap leading-relaxed text-foreground">
          {question.transcript}
        </p>
      ) : null}

      {/* Options: vertical with indented EN/ZH */}
      {hasAudioOptions && (
        <div className={sentences || hasTranscript ? "mt-2 border-t border-border/50 pt-2" : ""}>
          <div className="space-y-2">
            {question.options.map((opt) => {
              const t = optTrans?.[opt.key];
              return (
                <div key={opt.key}>
                  <p className="font-medium text-foreground">
                    {opt.key}. {opt.text}
                  </p>
                  {showEn && t?.en && (
                    <p className="pl-5 text-blue-600 dark:text-blue-400">{t.en}</p>
                  )}
                  {showZh && t?.zh && (
                    <p className="pl-5 text-emerald-600 dark:text-emerald-400">{t.zh}</p>
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
  const router = useRouter();
  const {
    attemptId,
    testSetName,
    questions,
    currentIndex,
    answers,
    setAnswer,
    goNext,
    goPrev,
    goToQuestion,
  } = usePracticeStore();

  const { showEn, showZh, toggleEn, toggleZh } = useTranscriptLang();

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

  // Fetch explanation — called once by parent, shared with both panels
  const fetchExplanation = useCallback((questionId: string, force?: boolean) => {
    setExplanationLoading(true);
    setExplanationError(false);
    generateExplanation(questionId, force)
      .then(setExplanation)
      .catch(() => setExplanationError(true))
      .finally(() => setExplanationLoading(false));
  }, []);

  // Clear pending selection and indicators when navigating
  useEffect(() => {
    setSelectedKey(null);
    setSavedIndicator(false);
    setWrongCollected(false);
    setExplanation(null);
    setExplanationLoading(false);
    setExplanationError(false);
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
        toast.error("练习进行中，请通过「完成练习」按钮退出");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const question = questions[currentIndex];
  const currentAnswer = question ? (answers.get(question.id) ?? null) : null;

  // Auto-fetch explanation as soon as user answers (so transcript translations appear immediately)
  useEffect(() => {
    if (question && currentAnswer && !explanation && !explanationLoading) {
      fetchExplanation(question.id);
    }
  }, [question, currentAnswer, explanation, explanationLoading, fetchExplanation]);

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
      toast.error("提交失败，请重试");
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
    <div className="grid gap-6 lg:grid-cols-[200px_1fr_320px]">
      {/* 左侧：题号导航 (桌面) */}
      <div className="hidden lg:block">
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-3 scrollbar-thin">
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
      <div className="space-y-4">
        {testSetName && (
          <h1 className="text-lg font-semibold">{testSetName}</h1>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <QuestionDisplay
              question={question}
              index={currentIndex}
              total={questions.length}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-orange-500"
            title="题目报错"
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
        />

        {/* Confirm button: visible when option selected but not yet submitted */}
        {selectedKey && !currentAnswer && (
          <div className="flex justify-center">
            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="min-w-[160px]"
            >
              {submitting ? "提交中..." : "确认答案"}
            </Button>
          </div>
        )}

        {savedIndicator && (
          <p className="text-xs text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-bottom-2 duration-300">&#10003; 回答正确</p>
        )}
        {wrongCollected && (
          <div className="wrong-answer-toast flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700 shadow-sm dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300">
            <span className="wrong-answer-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
              <BookmarkCheck className="h-4 w-4" />
            </span>
            <span className="font-medium">已收入错题本</span>
          </div>
        )}

        {/* 移动端：原文 + 解析面板 */}
        <div className="lg:hidden">
          {currentAnswer && question.type === "listening" && (
            <TranscriptBlock question={question} explanation={explanation} showEn={showEn} showZh={showZh} onToggleEn={toggleEn} onToggleZh={toggleZh} />
          )}
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

        <Separator />

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            上一题
          </Button>

          {allAnswered && (
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={completing}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              {completing ? "正在提交..." : "完成练习"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={isLast}
          >
            下一题
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 右侧：原文 + 解析面板 (桌面) */}
      <div className="hidden lg:block">
        <div className="sticky top-20 space-y-3">
          {/* 听力原文（桌面侧栏） */}
          {currentAnswer && question.type === "listening" && (
            <TranscriptBlock question={question} explanation={explanation} showEn={showEn} showZh={showZh} onToggleEn={toggleEn} onToggleZh={toggleZh} />
          )}
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
              <p>答题后查看解析</p>
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
