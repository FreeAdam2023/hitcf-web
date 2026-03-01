"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DictationSession } from "@/components/vocabulary/dictation-session";
import { listNihaoWords } from "@/lib/api/vocabulary";
import type { DictationWord } from "@/stores/dictation-store";

function NihaoDictationInner() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || undefined;
  const lesson = searchParams.get("lesson") ? Number(searchParams.get("lesson")) : undefined;

  const loadWords = useCallback(async (): Promise<DictationWord[]> => {
    const res = await listNihaoWords({ level, lesson, page: 1, page_size: 200 });
    return res.items.map((item) => ({
      word: item.word,
      display_form: item.display_form,
      audio_url: item.audio_url,
      meaning_zh: item.meaning_zh,
      meaning_en: item.meaning_en,
      ipa: item.ipa,
    }));
  }, [level, lesson]);

  return (
    <DictationSession
      loadWords={loadWords}
      backLink="/vocabulary/nihao-french"
      backLabel={t("vocabulary.nihaoFrench.title")}
    />
  );
}

export default function NihaoDictationPage() {
  return (
    <Suspense>
      <NihaoDictationInner />
    </Suspense>
  );
}
