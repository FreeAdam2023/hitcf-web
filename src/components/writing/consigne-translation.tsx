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

type TranslationMode = "full" | "sentence";

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

function FullTranslation({ translation, locale, t }: { translation: ConsigneTranslation; locale: string; t: (key: string) => string }) {
  // Build a combined full-text view from sentence data or fallback to block text
  const questionEn = translation.question_sentences?.map(s => s.en).join(" ") || "";
  const questionZh = translation.question_sentences?.map(s => s.zh).filter(Boolean).join("") || "";
  const passageEn = translation.passage_sentences?.map(s => s.en).join(" ") || "";
  const passageZh = translation.passage_sentences?.map(s => s.zh).filter(Boolean).join("") || "";

  // Fallback to block text if no sentence data
  const hasFullText = questionEn || questionZh || translation.question_text;

  if (!hasFullText) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("translationLabel")}</p>
        {questionEn && (
          <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">{questionEn}</p>
        )}
        {locale !== "en" && questionZh && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">{questionZh}</p>
        )}
        {!questionEn && !questionZh && translation.question_text && (
          <div className="whitespace-pre-line text-sm">{translation.question_text}</div>
        )}
      </div>
      {(passageEn || passageZh || translation.passage) && (
        <div className="rounded-md bg-muted/50 p-2.5">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{t("passageLabel")}</p>
          {passageEn && (
            <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">{passageEn}</p>
          )}
          {locale !== "en" && passageZh && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{passageZh}</p>
          )}
          {!passageEn && !passageZh && translation.passage && (
            <div className="whitespace-pre-line text-xs text-muted-foreground">{translation.passage}</div>
          )}
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
  const [mode, setMode] = useState<TranslationMode>("full");
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
          {/* Mode toggle */}
          {hasSentences && (
            <div className="flex gap-1 rounded-md bg-muted/50 p-0.5">
              <button
                onClick={() => setMode("full")}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  mode === "full"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("modeFull")}
              </button>
              <button
                onClick={() => setMode("sentence")}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  mode === "sentence"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("modeSentence")}
              </button>
            </div>
          )}

          {/* Translation content */}
          {hasSentences && mode === "sentence" ? (
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
            <FullTranslation translation={translation} locale={locale} t={t} />
          )}
        </div>
      )}
    </div>
  );
}
