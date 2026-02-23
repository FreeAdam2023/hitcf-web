"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle, LogOut, LayoutGrid } from "lucide-react";
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
import { usePracticeStore } from "@/stores/practice-store";
import { submitAnswer, completeAttempt } from "@/lib/api/attempts";
import { getQuestionDetail } from "@/lib/api/questions";
import { QuestionDisplay } from "@/components/practice/question-display";
import { OptionList } from "@/components/practice/option-list";
import { QuestionNavigator } from "@/components/practice/question-navigator";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import type { Explanation } from "@/lib/api/types";

export function PracticeSession() {
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

  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [submitError, setSubmitError] = useState(false);

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
  if (!question || !attemptId) return null;

  const currentAnswer = answers.get(question.id) ?? null;
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = answers.size === questions.length;

  const handleSelect = async (key: string) => {
    if (currentAnswer || submitting) return;
    setSubmitting(true);
    setSubmitError(false);
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
          setExplanation(detail.explanation);
        } catch {
          // ignore — explanation is optional
        }
      }
      setAnswer(question.id, { ...res, correct_answer: correctAnswer ?? null });
    } catch (err) {
      console.error("Failed to submit answer", err);
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
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
    setExplanation(null);
    goToQuestion(index);
  };

  const handleNext = () => {
    setExplanation(null);
    goNext();
  };

  const handlePrev = () => {
    setExplanation(null);
    goPrev();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
      <div className="space-y-4">
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
        />

        {submitError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            提交失败，请重试
          </div>
        )}

        {currentAnswer && <ExplanationPanel explanation={explanation} questionId={question.id} />}

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

          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <LogOut className="mr-1 h-4 w-4" />
                  退出练习
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认退出练习？</AlertDialogTitle>
                  <AlertDialogDescription>
                    已答 {answers.size} / {questions.length} 题。
                    {answers.size > 0 && " 退出后当前练习进度将保留。"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>继续练习</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push("/tests")}>
                    确认退出
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
          </div>

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

      <div className="hidden lg:block">
        <QuestionNavigator
          total={questions.length}
          currentIndex={currentIndex}
          answers={answers}
          questionIds={questions.map((q) => q.id)}
          onNavigate={handleGoToQuestion}
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
        <SheetContent side="bottom" className="max-h-[50vh]">
          <div className="p-4">
            <QuestionNavigator
              total={questions.length}
              currentIndex={currentIndex}
              answers={answers}
              questionIds={questions.map((q) => q.id)}
              onNavigate={handleGoToQuestion}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
