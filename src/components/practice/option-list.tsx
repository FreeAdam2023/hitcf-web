"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Option, AnswerResponse, OptionTranslation } from "@/lib/api/types";
import { FrenchText, type WordSaveContext } from "./french-text";

function stripKeyPrefix(text: string, key: string): string {
  const lower = key.toLowerCase();
  const upper = key.toUpperCase();
  for (const prefix of [`${upper}. `, `${lower}. `, `${upper} `, `${lower} `]) {
    if (text.startsWith(prefix)) return text.slice(prefix.length);
  }
  return text;
}

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
  /** Display options in a horizontal row (for image-based questions) */
  horizontal?: boolean;
  /** Disable vocabulary cards (e.g., exam mode) */
  vocabDisabled?: boolean;
  /** Context for saving vocabulary words */
  saveContext?: WordSaveContext;
  /** Option translations (EN/ZH) from explanation */
  optionTranslations?: Record<string, OptionTranslation> | null;
  /** Show English translation */
  showEn?: boolean;
  /** Show native (ZH) translation */
  showNative?: boolean;
  /** Current locale */
  locale?: string;
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
  horizontal = false,
  vocabDisabled,
  saveContext,
  optionTranslations,
  showEn = false,
  showNative = false,
  locale = "en",
}: OptionListProps) {
  const t = useTranslations();
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

  const isHorizontal = audioOnly && horizontal;

  return (
    <div className={cn(isHorizontal ? "flex gap-2" : "space-y-2")} role="radiogroup" aria-label={t("practice.optionList.ariaLabel")}>
      {options.map((opt) => {
        const { isPending, isSelected, isCorrect, isWrong } = getOptionState(opt);

        return (
          <button
            key={opt.key}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${opt.key}${opt.text ? `: ${opt.text}` : ""}`}
            className={cn(
              "rounded-md border text-sm lg:text-base transition-colors min-h-[44px]",
              isHorizontal
                ? "flex flex-1 items-center justify-center p-3"
                : "flex w-full items-start gap-3 px-3 py-3.5 text-left",
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
            disabled={disabled}
            aria-disabled={locked || disabled}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                isHorizontal ? "h-8 w-8" : "h-6 w-6",
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
            {!audioOnly && opt.text && (
              <div className="pt-0.5 min-w-0">
                <FrenchText text={opt.text} disabled={vocabDisabled} saveContext={saveContext} />
                {(() => {
                  const tr = optionTranslations?.[opt.key];
                  if (!tr) return null;
                  const optNative = tr.native || tr.zh;
                  return (
                    <>
                      {locale === "zh" && showEn && tr.en && (
                        <p className="text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                          {stripKeyPrefix(tr.en, opt.key)}
                        </p>
                      )}
                      {locale !== "fr" && showNative && optNative && (
                        <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                          {stripKeyPrefix(optNative, opt.key)}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
