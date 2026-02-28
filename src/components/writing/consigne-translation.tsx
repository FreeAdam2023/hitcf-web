"use client";

import { useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConsigneTranslation, type ConsigneTranslation } from "@/lib/api/writing";
import { toast } from "sonner";

interface ConsigneTranslationToggleProps {
  questionId: string;
}

export function ConsigneTranslationToggle({ questionId }: ConsigneTranslationToggleProps) {
  const t = useTranslations("consigneTranslation");
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<ConsigneTranslation | null>(null);

  const handleToggle = useCallback(async () => {
    if (visible) {
      setVisible(false);
      return;
    }

    // If already fetched, just show
    if (translation) {
      setVisible(true);
      return;
    }

    // Fetch translation
    setLoading(true);
    try {
      const data = await getConsigneTranslation(questionId, locale);
      setTranslation(data);
      setVisible(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("fetchError");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [visible, translation, questionId, locale, t]);

  // Don't show toggle for French locale
  if (locale === "fr") return null;

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
        <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-3 text-sm leading-relaxed">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{t("translationLabel")}</p>
          <div className="whitespace-pre-line">{translation.question_text}</div>
          {translation.passage && (
            <div className="mt-2 rounded-md bg-muted/50 p-2">
              <p className="mb-1 text-xs font-medium text-muted-foreground">{t("passageLabel")}</p>
              <div className="whitespace-pre-line text-xs text-muted-foreground">
                {translation.passage}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
