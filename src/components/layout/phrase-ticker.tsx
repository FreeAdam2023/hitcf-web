"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Flame, CalendarPlus } from "lucide-react";
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
            <span className="truncate text-muted-foreground/80">
              <span className="italic text-foreground/80">
                « {expr.display_form} »
              </span>
              {meaning && (
                <span className="ms-1.5 text-foreground/60">{meaning}</span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
