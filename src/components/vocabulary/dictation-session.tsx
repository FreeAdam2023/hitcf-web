"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DictationInput } from "./dictation-input";
import { DictationResults } from "./dictation-results";
import { useDictationStore, type DictationWord } from "@/stores/dictation-store";

interface DictationSessionProps {
  loadWords: () => Promise<DictationWord[]>;
  backLink: string;
  backLabel: string;
}

export function DictationSession({ loadWords, backLink, backLabel }: DictationSessionProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);

  const words = useDictationStore((s) => s.words);
  const currentIndex = useDictationStore((s) => s.currentIndex);
  const phase = useDictationStore((s) => s.phase);
  const strictMode = useDictationStore((s) => s.strictMode);
  const init = useDictationStore((s) => s.init);
  const nextWord = useDictationStore((s) => s.nextWord);
  const reset = useDictationStore((s) => s.reset);
  const setStrictMode = useDictationStore((s) => s.setStrictMode);

  useEffect(() => {
    loadWords()
      .then((items) => {
        // Shuffle
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        init(shuffled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadWords, init]);

  const handleComplete = useCallback(() => {
    nextWord();
  }, [nextWord]);

  const handleBack = useCallback(() => {
    window.location.href = backLink;
  }, [backLink]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center space-y-4">
        <p className="text-lg font-medium text-muted-foreground">{t("vocabulary.dictation.emptyTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("vocabulary.dictation.emptyDesc")}</p>
        <Link href={backLink}>
          <Button variant="outline">{t("common.actions.back")}</Button>
        </Link>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progress = phase === "complete"
    ? 100
    : ((currentIndex) / words.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={backLink} className="text-sm text-muted-foreground hover:text-foreground">
          ← {backLabel}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStrictMode(!strictMode)}
            className="text-xs px-2 py-1 rounded-full border transition-colors hover:bg-accent"
            title={strictMode ? t("vocabulary.dictation.strictDesc") : t("vocabulary.dictation.lenientDesc")}
          >
            {strictMode ? t("vocabulary.dictation.strict") : t("vocabulary.dictation.lenient")}
          </button>
          {phase !== "complete" && (
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {words.length}
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-1.5" />

      {/* Main content */}
      {phase === "complete" ? (
        <DictationResults onRestart={reset} onBack={handleBack} />
      ) : (
        currentWord && (
          <DictationInput word={currentWord} onComplete={handleComplete} />
        )
      )}
    </div>
  );
}
