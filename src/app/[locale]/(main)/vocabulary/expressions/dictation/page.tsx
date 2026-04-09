"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DictationSession } from "@/components/vocabulary/dictation-session";
import { listExpressionWords } from "@/lib/api/vocabulary";
import type { DictationWord } from "@/stores/dictation-store";

function ExpressionDictationInner() {
  const t = useTranslations();
  const searchParams = useSearchParams()!;
  const category = searchParams.get("category") || undefined;
  const cefrLevel = searchParams.get("cefr_level") || undefined;
  const tag = searchParams.get("tag") || undefined;

  const loadWords = useCallback(async (): Promise<DictationWord[]> => {
    const res = await listExpressionWords({ category, cefr_level: cefrLevel, tag, page: 1, page_size: 200 });
    return res.items.map((item) => ({
      word: item.expression,
      display_form: item.display_form,
      audio_url: item.audio_url,
      meaning_zh: item.meaning_zh,
      meaning_en: item.meaning_en,
      ipa: item.ipa,
    }));
  }, [category, cefrLevel, tag]);

  return (
    <DictationSession
      loadWords={loadWords}
      backLink="/vocabulary/expressions"
      backLabel={t("vocabulary.expressions.title")}
    />
  );
}

export default function ExpressionDictationPage() {
  return (
    <Suspense>
      <ExpressionDictationInner />
    </Suspense>
  );
}
