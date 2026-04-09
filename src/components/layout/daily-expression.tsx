"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Volume2, Star, X, ChevronRight } from "lucide-react";
import { getDailyExpression, saveWord } from "@/lib/api/vocabulary";
import type { DailyExpression as DailyExpressionType } from "@/lib/api/types";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const HIDE_PATHS = [
  "/speaking-exam",
  "/writing-exam",
  "/mock-exam",
  "/exam/",
];

const CACHE_KEY = "hitcf_daily_expression";
const DISMISS_KEY_PREFIX = "hitcf_daily_expression_dismissed_";

function getDismissKey(): string {
  const d = new Date();
  return `${DISMISS_KEY_PREFIX}${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function DailyExpression() {
  const t = useTranslations("vocabulary.dailyExpression");
  const locale = useLocale();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [expr, setExpr] = useState<DailyExpressionType | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Hide during exams
  const hidden = HIDE_PATHS.some((p) => pathname.includes(p));

  useEffect(() => {
    if (hidden) return;

    // Check if dismissed today
    if (typeof window !== "undefined" && localStorage.getItem(getDismissKey())) {
      setDismissed(true);
      return;
    }

    // Try sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        setExpr(JSON.parse(cached));
        return;
      }
    } catch {}

    getDailyExpression()
      .then((data) => {
        setExpr(data);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {}
      })
      .catch(() => {});
  }, [hidden]);

  if (hidden || dismissed || !expr) return null;

  const meaning =
    locale === "zh"
      ? expr.meaning_zh
      : locale === "ar"
        ? expr.meaning_ar
        : locale === "fr"
          ? expr.meaning_fr
          : expr.meaning_en;

  const handleSpeak = () => {
    if (speaking || typeof window === "undefined") return;
    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(expr.display_form);
    utterance.lang = "fr-FR";
    utterance.rate = 0.85;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = async () => {
    if (!session?.user || saved) return;
    try {
      await saveWord({
        word: expr.expression,
        source_type: "expression",
      });
      setSaved(true);
    } catch {}
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(getDismissKey(), "1");
    } catch {}
  };

  return (
    <div className="border-b bg-orange-50/60 dark:bg-orange-950/20">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-1.5 text-sm">
        {/* Label */}
        <span className="shrink-0 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
          {t("label")}
        </span>

        {/* Expression + meaning */}
        <span className="font-semibold text-foreground">{expr.display_form}</span>
        {expr.ipa && (
          <span className="hidden sm:inline text-[11px] text-muted-foreground font-mono">
            {expr.ipa}
          </span>
        )}
        <span className="text-muted-foreground">—</span>
        <span className="truncate text-muted-foreground">{meaning}</span>

        {/* Level badge */}
        <span className="hidden sm:inline shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          {expr.cefr_level}
        </span>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            onClick={handleSpeak}
            className={cn(
              "rounded p-1 hover:bg-orange-200/60 dark:hover:bg-orange-800/30 transition-colors",
              speaking && "text-orange-600"
            )}
            title={t("play")}
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>

          {session?.user && (
            <button
              onClick={handleSave}
              className={cn(
                "rounded p-1 hover:bg-orange-200/60 dark:hover:bg-orange-800/30 transition-colors",
                saved && "text-yellow-500"
              )}
              title={saved ? t("saved") : t("save")}
            >
              <Star className={cn("h-3.5 w-3.5", saved && "fill-current")} />
            </button>
          )}

          <Link
            href="/vocabulary/expressions"
            className="hidden sm:flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-orange-200/60 dark:hover:bg-orange-800/30 transition-colors"
          >
            {t("viewAll")}
            <ChevronRight className="h-3 w-3" />
          </Link>

          <button
            onClick={handleDismiss}
            className="rounded p-1 hover:bg-orange-200/60 dark:hover:bg-orange-800/30 transition-colors text-muted-foreground"
            title={t("dismiss")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
