"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Flame, CalendarPlus, Volume2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getDaysUntil } from "@/lib/countdown";
import { getRandomExpression } from "@/lib/api/vocabulary";
import type { RandomExpression } from "@/lib/api/types";

/**
 * PhraseTicker — the thin strip at the top of every logged-in page.
 *
 * Combines two signals into a single one-line strip:
 *
 *   🔥 80j · « D'une part… d'autre part » 一方面……另一方面
 *
 * - Left: exam-day countdown (same as the old MotivationStrip). If the
 *   user hasn't set an exam date yet, shows a gentle nudge link to
 *   /history where they can set one.
 * - Right: a uniformly random French expression + its meaning in the
 *   user's locale. Fetched from /api/vocab/expression/random on every
 *   mount — explicitly NOT daily, NOT cached, re-rolls on every page
 *   load so the user sees variety while navigating.
 *
 * Replaces the previous MotivationStrip (hardcoded Mandela-style quotes)
 * + DailyExpression (fat orange banner, once-per-day, hidden in exam).
 * Shown on every page except /history (which already has its own
 * countdown card).
 */
export function PhraseTicker() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [expr, setExpr] = useState<RandomExpression | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Re-fetch on every mount (page navigation) so the phrase rotates.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getRandomExpression()
      .then((data) => {
        if (!cancelled) setExpr(data);
      })
      .catch(() => {
        // Silent fail — strip still shows countdown even if phrase fetch fails
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, pathname]);

  const handleSpeak = (e: React.MouseEvent) => {
    // Don't let the click bubble up to the wrapping <Link> and trigger
    // a navigation.
    e.preventDefault();
    e.stopPropagation();
    if (!expr || speaking || typeof window === "undefined") return;

    // Prefer Azure TTS (neural voice cached on the document) over the
    // browser's mechanical SpeechSynthesis.
    if (expr.audio_url) {
      setSpeaking(true);
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = expr.audio_url;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      audio.play().catch(() => setSpeaking(false));
      return;
    }

    // Fallback: SpeechSynthesis
    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(expr.display_form);
    utterance.lang = "fr-FR";
    utterance.rate = 0.85;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  if (!isAuthenticated || !user) return null;

  // /history already has a full countdown card — skip the strip there
  // to avoid duplication.
  if (pathname === "/history") return null;

  const examDate = user.exam_date;

  // No exam date yet — show a one-line nudge to set one, instead of the
  // full strip. No phrase (it would make the nudge feel cluttered).
  if (!examDate) {
    return (
      <div className="border-b border-border/30 bg-muted/30">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-center gap-2 px-4 text-xs text-muted-foreground">
          <CalendarPlus className="h-3.5 w-3.5" />
          <Link href="/history" className="hover:text-foreground transition-colors">
            {t("motivation.setExamDate")}
          </Link>
        </div>
      </div>
    );
  }

  const days = getDaysUntil(examDate);
  if (days < 0) return null; // exam passed

  const meaning = expr
    ? locale === "zh"
      ? expr.meaning_zh
      : locale === "ar"
        ? expr.meaning_ar
        : locale === "fr"
          ? expr.meaning_fr
          : expr.meaning_en
    : null;

  return (
    <div className="border-b border-border/30 bg-muted/30">
      <div className="mx-auto flex h-8 max-w-6xl items-center gap-3 px-4 text-xs">
        {/* Days counter */}
        <span className="flex shrink-0 items-center gap-1 font-semibold text-foreground">
          <Flame
            className={`h-3.5 w-3.5 ${
              days <= 7
                ? "text-red-500"
                : days <= 30
                  ? "text-orange-500"
                  : "text-amber-500"
            }`}
          />
          {days === 0
            ? t("motivation.today")
            : t("motivation.daysLeft", { days })}
        </span>
        {expr && (
          <>
            <span className="text-muted-foreground/50">·</span>
            {/* Audio button — plays Azure TTS, stops click from navigating */}
            <button
              type="button"
              onClick={handleSpeak}
              className={`shrink-0 rounded p-0.5 transition-colors ${
                speaking
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-muted-foreground/70 hover:text-foreground"
              }`}
              aria-label={expr.display_form}
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
            {/* Clicking the phrase itself takes the user to the expression
                pool page where they can browse / save / drill the full set. */}
            <Link
              href="/vocabulary/expressions"
              className="min-w-0 flex-1 truncate text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              <span className="italic text-foreground/80">
                « {expr.display_form} »
              </span>
              {meaning && (
                <span className="ms-1.5 text-foreground/60">{meaning}</span>
              )}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
