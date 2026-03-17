"use client";

import { useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { translateConversationText } from "@/lib/api/speaking-conversation";

// Module-level cache: key = `${text}:${locale}`, value = translation
const _translationCache = new Map<string, string>();

export function ExaminerMessageTranslation({ frenchText }: { frenchText: string }) {
  const t = useTranslations("speakingConversation");
  const locale = useLocale();
  const cacheKey = `${frenchText}:${locale}`;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<string | null>(
    () => _translationCache.get(cacheKey) ?? null,
  );

  if (locale === "fr") return null;

  const handleToggle = useCallback(async () => {
    if (visible) { setVisible(false); return; }
    if (translation) { setVisible(true); return; }
    setLoading(true);
    try {
      const data = await translateConversationText(frenchText, locale);
      setTranslation(data.translation);
      _translationCache.set(cacheKey, data.translation);
      setVisible(true);
    } catch {
      // silent — translation is optional
    } finally {
      setLoading(false);
    }
  }, [visible, translation, frenchText, locale, cacheKey]);

  return (
    <div className="mt-1.5 border-t border-border/30 pt-1">
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {loading ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : visible ? (
          <EyeOff className="h-2.5 w-2.5" />
        ) : (
          <Eye className="h-2.5 w-2.5" />
        )}
        {loading ? t("translating") : visible ? t("hideTranslation") : t("showTranslation")}
      </button>
      {visible && translation && (
        <p className="mt-0.5 text-xs leading-relaxed text-blue-600 dark:text-blue-400">
          {translation}
        </p>
      )}
    </div>
  );
}
