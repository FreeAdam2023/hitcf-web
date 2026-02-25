"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CheckCircle, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePracticeStore } from "@/stores/practice-store";
import { submitAnswer, completeAttempt } from "@/lib/api/attempts";
import { getQuestionDetail } from "@/lib/api/questions";
import { QuestionDisplay } from "@/components/practice/question-display";
import { OptionList } from "@/components/practice/option-list";
import { QuestionNavigator } from "@/components/practice/question-navigator";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

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

  const [submitting, setSubmitting] = useState(false);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Warn before closing/refreshing if user has answered questions
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (answers.size > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answers.size]);

  const question = questions[currentIndex];
  const currentAnswer = question ? (answers.get(question.id) ?? null) : null;

  const handleSelect = useCallback(async (key: string) => {
    if (!question || !attemptId) return;
    if (answers.has(question.id) || submitting) return;
    setSubmitting(true);
    setSubmittingKey(key);
    try {
      const res = await submitAnswer(attemptId, {
        question_id: question.id,
        question_number: question.question_number,
        selected: key,
      });
      // The practice mode response includes correct_answer
      // Fetch full detail to get the correct_answer if not returned
      let correctAnswer = res.correct_answer;
      if (correctAnswer === undefined) {
        try {
          const detail = await getQuestionDetail(question.id);
          correctAnswer = detail.correct_answer;
        } catch {
          // ignore
        }
      }
      setAnswer(question.id, { ...res, correct_answer: correctAnswer ?? null });
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    } catch (err) {
      console.error("Failed to submit answer", err);
      toast.error("提交失败，请重试");
    } finally {
      setSubmitting(false);
      setSubmittingKey(null);
    }
  }, [question, attemptId, answers, submitting, setAnswer]);

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
  const handleNextRef = useRef(handleNext);
  useEffect(() => { handleNextRef.current = handleNext; });
  const handlePrevRef = useRef(handlePrev);
  useEffect(() => { handlePrevRef.current = handlePrev; });
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; });

  // Keyboard shortcuts: 1-4 / A-D select, arrows navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const q = questions[currentIndex];
      if (!q) return;
      const answered = answersRef.current.has(q.id);

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
        <div className="sticky top-20">
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
        <QuestionDisplay
          question={question}
          index={currentIndex}
          total={questions.length}
        />

        <OptionList
          options={question.options}
          answer={currentAnswer}
          onSelect={handleSelect}
          disabled={submitting}
          submittingKey={submittingKey}
        />

        {savedIndicator && (
          <p className="text-xs text-green-600 dark:text-green-400">&#10003; 已保存</p>
        )}

        {/* 移动端解析面板 */}
        <div className="lg:hidden">
          {currentAnswer && <ExplanationPanel explanation={null} questionId={question.id} transcript={question.transcript} />}
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

      {/* 右侧：解析面板 (桌面) */}
      <div className="hidden lg:block">
        <div className="sticky top-20">
          {currentAnswer ? (
            <ExplanationPanel explanation={null} questionId={question.id} transcript={question.transcript} />
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
        <SheetContent side="bottom" className="max-h-[50vh]">
          <div className="p-4">
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
    </div>
  );
}
