"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

  const question = questions[currentIndex];
  if (!question || !attemptId) return null;

  const currentAnswer = answers.get(question.id) ?? null;
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = answers.size === questions.length;

  const handleSelect = async (key: string) => {
    if (currentAnswer || submitting) return;
    setSubmitting(true);
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

        {currentAnswer && <ExplanationPanel explanation={explanation} />}

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
    </div>
  );
}
