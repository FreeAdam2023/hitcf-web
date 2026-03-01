"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Volume2 } from "lucide-react";
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

      {/* Card — 3D flip */}
      <div
        onClick={handleFlip}
        className="cursor-pointer select-none"
        style={{ perspective: "800px" }}
      >
        <div
          className="relative min-h-[280px] transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front — only the word + speaker, nothing else */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl border-2 p-8 bg-background shadow-sm hover:shadow-md transition-shadow"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-center space-y-4">
              <p className="text-3xl font-semibold tracking-tight">{card.display_form || card.word}</p>
              <button
                onClick={(e) => { e.stopPropagation(); speak(card.word, card.audio_url); }}
                className="rounded-full p-2 hover:bg-muted transition-colors mx-auto"
              >
                <Volume2 className={`h-5 w-5 ${playing ? "text-blue-500 animate-pulse" : "text-muted-foreground"}`} />
              </button>
            </div>
          </div>

          {/* Back — full reveal, WordCard style */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl border-2 p-8 bg-background shadow-sm hover:shadow-md transition-shadow"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-center space-y-3 w-full max-w-sm">
              <p className="text-lg font-semibold">{card.display_form || card.word}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground">
                {card.ipa && <span className="text-sm font-mono">{card.ipa}</span>}
                {card.part_of_speech && card.part_of_speech !== "OTHER" && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0">{card.part_of_speech}</Badge>
                )}
                {card.cefr_level && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{card.cefr_level}</Badge>
                )}
              </div>
              <div className="space-y-0.5">
                {card.meaning_zh && <p className="text-base font-medium">{card.meaning_zh}</p>}
                {card.meaning_en && <p className="text-xs text-muted-foreground">{card.meaning_en}</p>}
              </div>
              {card.sentence && (
                <div className="rounded bg-muted/30 px-3 py-2 text-sm">
                  <p className="italic text-foreground">{card.sentence}</p>
                </div>
              )}
              {card.source_label && (
                <p className="text-xs text-muted-foreground">{card.source_label}</p>
              )}
            </div>
          </div>
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
