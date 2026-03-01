"use client";

import { Check, X, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDictationStore } from "@/stores/dictation-store";

interface DictationResultsProps {
  onRestart: () => void;
  onBack: () => void;
}

export function DictationResults({ onRestart, onBack }: DictationResultsProps) {
  const t = useTranslations();
  const results = useDictationStore((s) => s.results);
  const correctCount = useDictationStore((s) => s.correctCount());

  const total = results.length;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const errors = results.filter((r) => !r.isCorrect);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">{t("vocabulary.dictation.resultsTitle")}</h2>
        <div className="text-4xl font-bold">{accuracy}%</div>
        <p className="text-sm text-muted-foreground">
          {t("vocabulary.dictation.correctCount", { correct: correctCount, total })}
        </p>
        <Progress value={accuracy} className="h-2 mx-auto max-w-xs" />
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">{t("vocabulary.dictation.errorList")}</h3>
          <div className="space-y-1.5">
            {errors.map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
                <X className="h-4 w-4 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{r.display_form || r.word}</span>
                  <span className="ml-2 text-muted-foreground">
                    {t("vocabulary.dictation.yourAnswer")}: <span className="text-red-500">{r.userInput || "—"}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correct list summary */}
      {correctCount > 0 && errors.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Check className="h-3.5 w-3.5 text-green-500" />
          {correctCount} {t("vocabulary.dictation.correct").toLowerCase()}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onBack}>
          {t("vocabulary.dictation.back")}
        </Button>
        <Button onClick={onRestart}>
          <RotateCcw className="mr-1.5 h-4 w-4" />
          {t("vocabulary.dictation.restart")}
        </Button>
      </div>
    </div>
  );
}
