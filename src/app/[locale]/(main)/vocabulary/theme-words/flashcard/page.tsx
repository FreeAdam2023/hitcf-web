"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FlashCardView, type FlashCardWord } from "@/components/vocabulary/flash-card";
import { listThemeWords } from "@/lib/api/vocabulary";

function ThemeFlashcardInner() {
  const t = useTranslations();
  const searchParams = useSearchParams()!;
  const tag = searchParams.get("tag") || undefined;
  const tagCategory = searchParams.get("tag_category") || undefined;

  const loadCards = useCallback(async (): Promise<FlashCardWord[]> => {
    const res = await listThemeWords({ tag, tag_category: tagCategory, page: 1, page_size: 200 });
    return res.items.map((item) => {
      let article: string | null = null;
      let displayWord = item.display_form || item.word;
      const articleMatch = displayWord.match(/^(le|la|l'|les|un|une|des)\s+/i);
      if (articleMatch) {
        article = articleMatch[1];
        displayWord = displayWord.slice(articleMatch[0].length);
      }
      return {
        word: item.word,
        display_form: displayWord,
        audio_url: item.audio_url,
        source_label: `${item.tag_zh} (${item.tag})`,
        pool_meaning_zh: item.meaning_zh,
        gender: item.gender,
        article,
        part_of_speech: item.part_of_speech,
        ipa: item.ipa,
      };
    });
  }, [tag, tagCategory]);

  return (
    <FlashCardView
      loadCards={loadCards}
      backLink="/vocabulary/theme-words"
      backLabel={t("vocabulary.themeWords.title")}
      emptyMessage={t("vocabulary.flashcard.emptyTheme")}
    />
  );
}

export default function ThemeFlashcardPage() {
  return (
    <Suspense>
      <ThemeFlashcardInner />
    </Suspense>
  );
}
