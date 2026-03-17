"use client";

import { useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConsigneTranslation, type ConsigneTranslation, type SentenceTranslation } from "@/lib/api/writing";
import { toast } from "sonner";

interface ConsigneTranslationToggleProps {
  questionId: string;
}

// Module-level cache to survive re-renders
const _cache = new Map<string, ConsigneTranslation>();

function SentenceBlock({
  sentences,
  label,
  locale,
}: {
  sentences: SentenceTranslation[];
  label: string;
  locale: string;
}) {
  if (!sentences || sentences.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      {sentences.map((s, i) => (
        <div key={i} className="rounded-md bg-muted/30 px-3 py-2 space-y-0.5">
          <p className="text-sm font-medium leading-relaxed">{s.fr}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">{s.en}</p>
          {locale !== "en" && s.zh && (
            <p className="text-xs text-muted-foreground leading-relaxed">{s.zh}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function BlockTranslation({ translation, t }: { translation: ConsigneTranslation; t: (key: string) => string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{t("translationLabel")}</p>
      <div className="whitespace-pre-line text-sm">{translation.question_text}</div>
      {translation.passage && (
        <div className="mt-2 rounded-md bg-muted/50 p-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{t("passageLabel")}</p>
          <div className="whitespace-pre-line text-xs text-muted-foreground">
            {translation.passage}
          </div>
        </div>
      )}
    </div>
  );
}

export function ConsigneTranslationToggle({ questionId }: ConsigneTranslationToggleProps) {
  const t = useTranslations("consigneTranslation");
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<ConsigneTranslation | null>(
    () => _cache.get(questionId) ?? null,
  );

  const handleToggle = useCallback(async () => {
    if (visible) {
      setVisible(false);
      return;
    }

    // If cached translation has sentence arrays, show immediately;
    // otherwise re-fetch to get the new sentence-level format
    const hasCachedSentences = translation &&
      ((translation.question_sentences?.length ?? 0) > 0 ||
       (translation.passage_sentences?.length ?? 0) > 0);
    if (hasCachedSentences) {
      setVisible(true);
      return;
    }

    setLoading(true);
    try {
      const data = await getConsigneTranslation(questionId, locale);
      setTranslation(data);
      _cache.set(questionId, data);
      setVisible(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("fetchError");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [visible, translation, questionId, locale, t]);

  if (locale === "fr") return null;

  const hasSentences = translation &&
    ((translation.question_sentences?.length ?? 0) > 0 ||
     (translation.passage_sentences?.length ?? 0) > 0);

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={loading}
        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : visible ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
        {loading ? t("loading") : visible ? t("hideTranslation") : t("showTranslation")}
      </Button>

      {visible && translation && (
        <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-3 text-sm leading-relaxed space-y-3">
          {hasSentences ? (
            <>
              <SentenceBlock
                sentences={translation.question_sentences}
                label={t("translationLabel")}
                locale={locale}
              />
              <SentenceBlock
                sentences={translation.passage_sentences}
                label={t("passageLabel")}
                locale={locale}
              />
            </>
          ) : (
            <BlockTranslation translation={translation} t={t} />
          )}
        </div>
      )}
    </div>
  );
}
