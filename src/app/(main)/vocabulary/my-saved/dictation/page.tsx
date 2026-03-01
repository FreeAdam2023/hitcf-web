"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { DictationSession } from "@/components/vocabulary/dictation-session";
import { listSavedWords } from "@/lib/api/vocabulary";
import type { DictationWord } from "@/stores/dictation-store";

function DictationInner() {
  const t = useTranslations();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const sourceType = searchParams.get("source_type") || undefined;

  const loadWords = useCallback(async (): Promise<DictationWord[]> => {
    if (!session?.user) return [];
    const res = await listSavedWords({ source_type: sourceType, page: 1, page_size: 200 });
    return res.items.map((item) => ({
      word: item.word,
      display_form: item.display_form,
      audio_url: item.audio_url,
      meaning_zh: item.meaning_zh,
      meaning_en: item.meaning_en,
      ipa: item.ipa,
    }));
  }, [session?.user, sourceType]);

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-muted-foreground">{t("vocabulary.loginHint")}</p>
      </div>
    );
  }

  return (
    <DictationSession
      loadWords={loadWords}
      backLink="/vocabulary/my-saved"
      backLabel={t("vocabulary.mySaved.title")}
    />
  );
}

export default function SavedWordsDictationPage() {
  return (
    <Suspense>
      <DictationInner />
    </Suspense>
  );
}
