"use client";

import { cn } from "@/lib/utils";
import type { Option, AnswerResponse } from "@/lib/api/types";

interface OptionListProps {
  options: Option[];
  answer: AnswerResponse | null;
  onSelect: (key: string) => void;
  disabled: boolean;
  mode?: "practice" | "exam";
  /** For exam mode: the currently selected key (may change) */
  examSelected?: string | null;
  /** Read-only mode: shows correct/wrong without interaction (for results/wrong answers) */
  readonly?: boolean;
  /** The correct answer key (for readonly mode) */
  correctAnswer?: string | null;
  /** The last selected key (for readonly mode) */
  lastSelected?: string | null;
}

export function OptionList({
  options,
  answer,
  onSelect,
  disabled,
  mode = "practice",
  examSelected,
  readonly = false,
  correctAnswer,
  lastSelected,
}: OptionListProps) {
  const isExam = mode === "exam";
  const locked = readonly || (!isExam && !!answer);

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        // Readonly mode logic (for wrong-answer-card / results)
        const isSelected = readonly
          ? lastSelected === opt.key
          : isExam
            ? examSelected === opt.key
            : answer?.selected === opt.key;
        const isCorrect = readonly
          ? correctAnswer === opt.key
          : !isExam && !!answer && answer?.correct_answer === opt.key;
        const isWrong = readonly
          ? opt.key === lastSelected && opt.key !== correctAnswer
          : !isExam && isSelected && answer?.is_correct === false;

        return (
          <button
            key={opt.key}
            className={cn(
              "flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition-colors",
              !locked && !disabled && "hover:bg-accent cursor-pointer",
              locked && "cursor-default",
              // Practice mode colors
              !isExam && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
              !isExam && isWrong && "border-red-500 bg-red-50 dark:bg-red-950/30",
              // Exam mode: selected = blue
              isExam && isSelected && "border-primary bg-primary/10",
              // Practice mode: selected but no correct/wrong yet
              !isExam && isSelected && !isWrong && !isCorrect && "border-primary bg-accent",
            )}
            onClick={() => !locked && !disabled && onSelect(opt.key)}
            disabled={locked || disabled}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                !isExam && isCorrect && "border-green-500 bg-green-500 text-white",
                !isExam && isWrong && "border-red-500 bg-red-500 text-white",
                isSelected && !(isCorrect || isWrong) && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {opt.key}
            </span>
            <span className="pt-0.5">{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
}
