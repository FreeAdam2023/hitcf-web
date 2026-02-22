"use client";

import { cn } from "@/lib/utils";
import type { AnswerResponse } from "@/lib/api/types";

interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  answers: Map<string, AnswerResponse> | Map<string, unknown>;
  questionIds: string[];
  onNavigate: (index: number) => void;
  mode?: "practice" | "exam";
  flaggedQuestions?: Set<number>;
}

export function QuestionNavigator({
  total,
  currentIndex,
  answers,
  questionIds,
  onNavigate,
  mode = "practice",
  flaggedQuestions,
}: QuestionNavigatorProps) {
  const isExam = mode === "exam";

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">题号导航</h3>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const qid = questionIds[i];
          const answer = qid ? answers.get(qid) : undefined;
          const isCurrent = i === currentIndex;
          const isAnswered = !!answer;
          const questionNum = i + 1;
          const isFlagged = isExam && flaggedQuestions?.has(questionNum);

          // Practice mode: show correct/wrong colors
          const typedAnswer = answer as AnswerResponse | undefined;
          const isCorrect = !isExam && !!typedAnswer && typedAnswer.is_correct === true;
          const isWrong = !isExam && !!typedAnswer && typedAnswer.is_correct === false;

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors",
                isCurrent && "ring-2 ring-primary ring-offset-1",
                // Practice mode colors
                !isExam && isCorrect && "bg-green-500 text-white",
                !isExam && isWrong && "bg-red-500 text-white",
                // Exam mode: answered = primary color (no correct/wrong)
                isExam && isAnswered && "bg-primary text-primary-foreground",
                // General answered (practice, no correct/wrong info)
                !isExam && isAnswered && !isCorrect && !isWrong && "bg-primary text-primary-foreground",
                // Not answered
                !isAnswered && !isCurrent && "bg-muted hover:bg-accent",
                !isAnswered && isCurrent && "bg-primary/20",
              )}
            >
              {questionNum}
              {isFlagged && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500" />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        已答 {answers.size} / {total}
      </p>
    </div>
  );
}
