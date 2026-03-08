"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DictationSession } from "@/components/vocabulary/dictation-session";
import { listThemeWords } from "@/lib/api/vocabulary";
import type { DictationWord } from "@/stores/dictation-store";

function ThemeDictationInner() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") || undefined;
  const tagCategory = searchParams.get("tag_category") || undefined;

  const loadWords = useCallback(async (): Promise<DictationWord[]> => {
    const res = await listThemeWords({ tag, tag_category: tagCategory, page: 1, page_size: 200 });
    return res.items.map((item) => ({
      word: item.word,
      display_form: item.display_form,
      audio_url: item.audio_url,
      meaning_zh: item.meaning_zh,
      meaning_en: item.meaning_en,
      ipa: item.ipa,
    }));
  }, [tag, tagCategory]);

  return (
    <DictationSession
      loadWords={loadWords}
      backLink="/vocabulary/theme-words"
      backLabel={t("vocabulary.themeWords.title")}
    />
  );
}

export default function ThemeDictationPage() {
  return (
    <Suspense>
      <ThemeDictationInner />
    </Suspense>
  );
}
