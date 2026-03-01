"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { FlashCardView, type FlashCardWord } from "@/components/vocabulary/flash-card";
import { listSavedWords } from "@/lib/api/vocabulary";

const SOURCE_TYPES = ["listening", "reading", "speaking", "writing"] as const;
type SourceType = (typeof SOURCE_TYPES)[number];
function isSourceType(v: string | null): v is SourceType {
  return v !== null && (SOURCE_TYPES as readonly string[]).includes(v);
}

function FlashcardInner() {
  const t = useTranslations();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const sourceType = searchParams.get("source_type") || undefined;

  const loadCards = useCallback(async (): Promise<FlashCardWord[]> => {
    if (!session?.user) return [];
    const res = await listSavedWords({ source_type: sourceType, page: 1, page_size: 100 });
    return res.items.map((item) => {
      const sourceParts: string[] = [];
      if (item.source_type && isSourceType(item.source_type)) {
        sourceParts.push(t(`common.types.${item.source_type}`));
      }
      if (item.test_set_name) sourceParts.push(item.test_set_name);
      if (item.question_number != null) sourceParts.push(`Q${item.question_number}`);
      return {
        word: item.word,
        display_form: item.display_form,
        ipa: item.ipa,
        audio_url: item.audio_url,
        cefr_level: item.cefr_level,
        meaning_zh: item.meaning_zh,
        meaning_en: item.meaning_en,
        part_of_speech: item.part_of_speech,
        source_label: sourceParts.join(" · ") || null,
        sentence: item.sentence,
      };
    });
  }, [session?.user, sourceType, t]);

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-muted-foreground">{t("vocabulary.loginHint")}</p>
      </div>
    );
  }

  return (
    <FlashCardView
      loadCards={loadCards}
      backLink="/vocabulary/my-saved"
      backLabel={t("vocabulary.mySaved.title")}
    />
  );
}

export default function FlashcardPage() {
  return (
    <Suspense>
      <FlashcardInner />
    </Suspense>
  );
}
