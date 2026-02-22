"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { submitAnswer, flagQuestion, completeAttempt } from "@/lib/api/attempts";
import { QuestionDisplay } from "@/components/practice/question-display";
import { OptionList } from "@/components/practice/option-list";
import { QuestionNavigator } from "@/components/practice/question-navigator";
import { ExamTimer } from "@/components/exam/exam-timer";
import { cn } from "@/lib/utils";

export function ExamSession() {
  const router = useRouter();
  const {
    attemptId,
    questions,
    currentIndex,
    answers,
    flaggedQuestions,
    timeLimitSeconds,
    startedAt,
    setAnswer,
    toggleFlag,
    goNext,
    goPrev,
    goToQuestion,
  } = useExamStore();

  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const question = questions[currentIndex];
  if (!question || !attemptId || !startedAt) return null;

  const currentAnswer = answers.get(question.id);
  const isLast = currentIndex === questions.length - 1;
  const isFlagged = flaggedQuestions.has(question.question_number);

  const handleSelect = async (key: string) => {
    if (submitting) return;
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
    } catch (err) {
      console.error("Failed to submit answer", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlag = async () => {
    try {
      await flagQuestion(attemptId, question.question_number);
      toggleFlag(question.question_number);
    } catch (err) {
      console.error("Failed to flag question", err);
    }
  };

  const handleComplete = useCallback(async () => {
    if (completing) return;
    setCompleting(true);
    try {
      await completeAttempt(attemptId!);
      router.push(`/results/${attemptId}`);
    } catch (err) {
      console.error("Failed to complete exam", err);
      setCompleting(false);
    }
  }, [attemptId, completing, router]);

  const handleTimeUp = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Build a compatible answers map for QuestionNavigator
  const navigatorAnswers = new Map<string, { is_correct?: boolean | null }>();
  answers.forEach((ans, qid) => {
    navigatorAnswers.set(qid, { is_correct: null });
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
      <div className="space-y-4">
        {/* Header with timer and flag */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            第 {currentIndex + 1} / {questions.length} 题
          </h2>
          <div className="flex items-center gap-3">
            <ExamTimer
              timeLimitSeconds={timeLimitSeconds}
              startedAt={startedAt}
              onTimeUp={handleTimeUp}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlag}
              className={cn(isFlagged && "text-orange-500")}
            >
              <Flag className="mr-1 h-4 w-4" />
              {isFlagged ? "已标记" : "标记"}
            </Button>
          </div>
        </div>

        <QuestionDisplay
          question={question}
          index={currentIndex}
          total={questions.length}
        />

        <OptionList
          options={question.options}
          answer={null}
          onSelect={handleSelect}
          disabled={submitting}
          mode="exam"
          examSelected={currentAnswer?.selected ?? null}
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
            上一题
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={completing}>
                <Send className="mr-1 h-4 w-4" />
                {completing ? "正在提交..." : "提交考试"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认提交考试？</AlertDialogTitle>
                <AlertDialogDescription>
                  已答 {answers.size} / {questions.length} 题。
                  {answers.size < questions.length &&
                    ` 还有 ${questions.length - answers.size} 题未作答。`}
                  提交后不可修改。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>继续答题</AlertDialogCancel>
                <AlertDialogAction onClick={handleComplete}>
                  确认提交
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
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
          answers={navigatorAnswers}
          questionIds={questions.map((q) => q.id)}
          onNavigate={goToQuestion}
          mode="exam"
          flaggedQuestions={flaggedQuestions}
        />
      </div>
    </div>
  );
}
