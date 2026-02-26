"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Flag, Send, LayoutGrid, AlertTriangle } from "lucide-react";
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
import { submitAnswer, flagQuestion, completeAttempt } from "@/lib/api/attempts";
import { QuestionDisplay } from "@/components/practice/question-display";
import { OptionList } from "@/components/practice/option-list";
import { QuestionNavigator } from "@/components/practice/question-navigator";
import { ExamTimer } from "@/components/exam/exam-timer";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/practice/report-dialog";

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
  const [reportOpen, setReportOpen] = useState(false);

  // Prevent accidental back navigation (no beforeunload — exam state persists via sessionStorage)
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.error("考试进行中，请通过「提交考试」按钮退出");
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
      toast.error("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }, [question, attemptId, submitting, setAnswer]);

  // Stable refs for keyboard handler to avoid listener churn
  const handleSelectRef = useRef(handleSelect);
  useEffect(() => { handleSelectRef.current = handleSelect; });
  const goNextRef = useRef(goNext);
  useEffect(() => { goNextRef.current = goNext; });
  const goPrevRef = useRef(goPrev);
  useEffect(() => { goPrevRef.current = goPrev; });

  // Keyboard shortcuts: 1-4 / A-D select, arrows navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const q = questions[currentIndex];
      if (!q) return;

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

      if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        e.preventDefault();
        goNextRef.current();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
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
  const isFlagged = flaggedQuestions.has(question.question_number);

  const handleFlag = async () => {
    try {
      await flagQuestion(attemptId, question.question_number);
      toggleFlag(question.question_number);
      toast.success(isFlagged ? "已取消标记" : "已标记该题");
    } catch (err) {
      console.error("Failed to flag question", err);
      toast.error("操作失败，请重试");
    }
  };

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
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-orange-500"
              title="题目报错"
              onClick={() => setReportOpen(true)}
            >
              <AlertTriangle className="mr-1 h-4 w-4" />
              报错
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
          audioOnly={question.type === "listening" && question.question_number <= 10}
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
              flaggedQuestions={flaggedQuestions}
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
