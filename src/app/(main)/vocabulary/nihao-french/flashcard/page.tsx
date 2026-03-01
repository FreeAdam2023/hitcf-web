"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FlashCardView, type FlashCardWord } from "@/components/vocabulary/flash-card";
import { listNihaoWords } from "@/lib/api/vocabulary";

function NihaoFlashcardInner() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || undefined;
  const lesson = searchParams.get("lesson") ? Number(searchParams.get("lesson")) : undefined;

  const loadCards = useCallback(async (): Promise<FlashCardWord[]> => {
    const res = await listNihaoWords({ level, lesson, page: 1, page_size: 200 });
    return res.items.map((item) => ({
      word: item.word,
      display_form: item.display_form,
      ipa: item.ipa,
      audio_url: item.audio_url,
      cefr_level: item.cefr_level || item.level,
      meaning_zh: item.meaning_zh,
      meaning_en: item.meaning_en,
      part_of_speech: item.part_of_speech,
      source_label: `${item.level} · ${t("vocabulary.nihaoFrench.lesson", { num: item.lesson })}${item.theme ? ` · ${item.theme}` : ""}`,
      sentence: item.example_fr,
    }));
  }, [level, lesson, t]);

  return (
    <FlashCardView
      loadCards={loadCards}
      backLink="/vocabulary/nihao-french"
      backLabel={t("vocabulary.nihaoFrench.title")}
      emptyMessage={t("vocabulary.flashcard.emptyNihao")}
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
