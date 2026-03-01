"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, RotateCcw, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFrenchSpeech } from "@/hooks/use-french-speech";

export interface FlashCardWord {
  word: string;
  display_form?: string | null;
  ipa?: string | null;
  audio_url?: string | null;
  cefr_level?: string | null;
  meaning_zh?: string | null;
  meaning_en?: string | null;
  part_of_speech?: string | null;
  source_label?: string | null;
  sentence?: string | null;
}

interface FlashCardViewProps {
  loadCards: () => Promise<FlashCardWord[]>;
  backLink: string;
  backLabel: string;
  emptyMessage?: string;
}

export function FlashCardView({ loadCards, backLink, backLabel, emptyMessage }: FlashCardViewProps) {
  const t = useTranslations();

  const [cards, setCards] = useState<FlashCardWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { speak, playing } = useFrenchSpeech();

  useEffect(() => {
    loadCards()
      .then((items) => setCards(items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadCards]);

  const handleFlip = useCallback(() => setFlipped((f) => !f), []);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setFlipped(false);
    }
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleFlip, handleNext, handlePrev]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center space-y-4">
        <p className="text-lg font-medium text-muted-foreground">
          {emptyMessage || t("vocabulary.flashcard.empty")}
        </p>
        <Link href={backLink}>
          <Button variant="outline">{t("common.actions.back")}</Button>
        </Link>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={backLink} className="text-sm text-muted-foreground hover:text-foreground">
          ← {backLabel}
        </Link>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5" />

      {/* Card */}
      <div
        onClick={handleFlip}
        className="relative flex min-h-[280px] cursor-pointer items-center justify-center rounded-xl border-2 p-8 transition-all hover:shadow-md select-none"
      >
        {!flipped ? (
          /* Front: word + IPA + audio */
          <div className="text-center space-y-4">
            <p className="text-3xl font-bold">{card.display_form || card.word}</p>
            <div className="flex items-center justify-center gap-3">
              {card.ipa && <span className="text-sm text-muted-foreground font-mono">{card.ipa}</span>}
              <button
                onClick={(e) => { e.stopPropagation(); speak(card.word, card.audio_url); }}
                className="rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <Volume2 className={`h-5 w-5 ${playing ? "text-blue-500 animate-pulse" : "text-muted-foreground"}`} />
              </button>
              {card.cefr_level && (
                <Badge variant="secondary" className="text-xs">{card.cefr_level}</Badge>
              )}
            </div>
            {card.source_label && (
              <p className="text-xs text-muted-foreground">{card.source_label}</p>
            )}
            <p className="text-xs text-muted-foreground/60">{t("vocabulary.flashcard.tapToFlip")}</p>
          </div>
        ) : (
          /* Back: meanings + sentence */
          <div className="text-center space-y-3 w-full">
            <p className="text-xl font-semibold">{card.display_form || card.word}</p>
            {card.meaning_zh && <p className="text-lg">{card.meaning_zh}</p>}
            {card.meaning_en && <p className="text-sm text-muted-foreground">{card.meaning_en}</p>}
            {card.part_of_speech && card.part_of_speech !== "OTHER" && (
              <Badge variant="outline" className="text-xs">{card.part_of_speech}</Badge>
            )}
            {card.sentence && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-sm italic">{card.sentence}</p>
              </div>
            )}
          </div>
        )}

        {/* Flip indicator */}
        <div className="absolute bottom-3 right-3">
          <RotateCcw className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("common.pagination.prev")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          {t("common.pagination.next")}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
