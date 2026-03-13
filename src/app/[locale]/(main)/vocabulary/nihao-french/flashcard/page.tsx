"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FlashCardView, type FlashCardWord } from "@/components/vocabulary/flash-card";
import { listNihaoWords } from "@/lib/api/vocabulary";

function NihaoFlashcardInner() {
  const t = useTranslations();
  const searchParams = useSearchParams()!;
  const level = searchParams.get("level") || undefined;
  const lesson = searchParams.get("lesson") ? Number(searchParams.get("lesson")) : undefined;

  const loadCards = useCallback(async (): Promise<FlashCardWord[]> => {
    const res = await listNihaoWords({ level, lesson, page: 1, page_size: 200 });
    return res.items.map((item) => {
      // Extract article from display_form (e.g. "le frère" → article="le", display="frère")
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
        source_label: `${item.level} · ${t("vocabulary.nihaoFrench.lesson", { num: item.lesson })}${item.theme ? ` · ${item.theme}` : ""}`,
        pool_meaning_zh: item.meaning_zh,
        gender: item.gender,
        article,
        part_of_speech: item.part_of_speech,
        ipa: item.ipa,
      };
    });
  }, [level, lesson, t]);

  return (
    <FlashCardView
      loadCards={loadCards}
      backLink="/vocabulary/nihao-french"
      backLabel={t("vocabulary.nihaoFrench.title")}
      emptyMessage={t("vocabulary.flashcard.emptyNihao")}
      pool="nihao"
    />
  );
}

export default function NihaoFlashcardPage() {
  return (
    <Suspense>
      <NihaoFlashcardInner />
    </Suspense>
  );
}
