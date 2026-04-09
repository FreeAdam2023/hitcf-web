"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FlashCardView, type FlashCardWord } from "@/components/vocabulary/flash-card";
import { listExpressionWords } from "@/lib/api/vocabulary";

function ExpressionFlashcardInner() {
  const t = useTranslations();
  const searchParams = useSearchParams()!;
  const category = searchParams.get("category") || undefined;
  const cefrLevel = searchParams.get("cefr_level") || undefined;
  const tag = searchParams.get("tag") || undefined;

  const loadCards = useCallback(async (): Promise<FlashCardWord[]> => {
    const res = await listExpressionWords({ category, cefr_level: cefrLevel, tag, page: 1, page_size: 200 });
    return res.items.map((item) => ({
      word: item.expression,
      display_form: item.display_form,
      audio_url: item.audio_url,
      source_label: item.category_zh ? `${item.category_zh} (${item.category})` : item.category,
      pool_meaning_zh: item.meaning_zh,
      gender: null,
      article: null,
      part_of_speech: null,
      ipa: item.ipa,
    }));
  }, [category, cefrLevel, tag]);

  return (
    <FlashCardView
      loadCards={loadCards}
      backLink="/vocabulary/expressions"
      backLabel={t("vocabulary.expressions.title")}
      emptyMessage={t("vocabulary.flashcard.emptyTheme")}
      pool="expression"
    />
  );
}

export default function ExpressionFlashcardPage() {
  return (
    <Suspense>
      <ExpressionFlashcardInner />
    </Suspense>
  );
}
