"use client";

import { Loader2 } from "lucide-react";
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
  /** Practice mode: pre-selected key (chosen but not yet submitted) */
  pendingSelected?: string | null;
  /** Read-only mode: shows correct/wrong without interaction (for results/wrong answers) */
  readonly?: boolean;
  /** The correct answer key (for readonly mode) */
  correctAnswer?: string | null;
  /** The last selected key (for readonly mode) */
  lastSelected?: string | null;
  /** Key currently being submitted (shows spinner) */
  submittingKey?: string | null;
  /** Audio-only options: show only A/B/C/D buttons without text (TCF listening A1/A2) */
  audioOnly?: boolean;
}

export function OptionList({
  options,
  answer,
  onSelect,
  disabled,
  mode = "practice",
  examSelected,
  pendingSelected,
  readonly = false,
  correctAnswer,
  lastSelected,
  submittingKey,
  audioOnly = false,
}: OptionListProps) {
  const isExam = mode === "exam";
  const locked = readonly || (!isExam && !!answer);

  function getOptionState(opt: Option) {
    const isPending = !isExam && !readonly && !answer && pendingSelected === opt.key;
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
    return { isPending, isSelected, isCorrect, isWrong };
  }

  // Audio-only: compact horizontal A/B/C/D buttons
  if (audioOnly) {
    return (
      <div className="flex gap-3 justify-center" role="radiogroup" aria-label="答案选项">
        {options.map((opt) => {
          const { isPending, isSelected, isCorrect, isWrong } = getOptionState(opt);
          return (
            <button
              key={opt.key}
              role="radio"
              aria-checked={isSelected || isPending}
              aria-label={`选项 ${opt.key}`}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border-2 text-base font-semibold transition-colors",
                !locked && !disabled && "hover:bg-accent cursor-pointer",
                locked && "cursor-default",
                !isExam && isCorrect && "border-green-500 bg-green-500 text-white",
                !isExam && isWrong && "border-red-500 bg-red-500 text-white",
                isExam && isSelected && "border-primary bg-primary text-primary-foreground",
                isPending && "border-primary bg-primary text-primary-foreground",
                !isExam && isSelected && !isWrong && !isCorrect && "border-primary bg-primary text-primary-foreground",
                !(isSelected || isPending || isCorrect || isWrong) && "border-muted-foreground/30",
              )}
              onClick={() => !locked && !disabled && onSelect(opt.key)}
              disabled={locked || disabled}
            >
              {submittingKey === opt.key ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                opt.key
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2" role="radiogroup" aria-label="答案选项">
      {options.map((opt) => {
        const { isPending, isSelected, isCorrect, isWrong } = getOptionState(opt);

        return (
          <button
            key={opt.key}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${opt.key}: ${opt.text || ""}`}
            className={cn(
              "flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition-colors",
              !locked && !disabled && "hover:bg-accent cursor-pointer",
              locked && "cursor-default",
              // Practice mode colors
              !isExam && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
              !isExam && isWrong && "border-red-500 bg-red-50 dark:bg-red-950/30",
              // Exam mode: selected = blue
              isExam && isSelected && "border-primary bg-primary/10",
              // Practice mode: pending selection (chosen but not submitted)
              isPending && "border-primary bg-primary/10",
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
                (isSelected || isPending) && !(isCorrect || isWrong) && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {submittingKey === opt.key ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                opt.key
              )}
            </span>
            <span className="pt-0.5">{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
}
