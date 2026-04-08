"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Flame, CalendarPlus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getDaysUntil, getPhaseMessage } from "@/lib/countdown";
import { MOTIVATION_QUOTES } from "@/lib/motivation-quotes";

/** Day-of-year helper for rotating quotes. */
function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function MotivationStrip() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Not logged in → hide
  if (!isAuthenticated || !user) return null;

  const examDate = user.exam_date;
  const quote = MOTIVATION_QUOTES[dayOfYear() % MOTIVATION_QUOTES.length];

  // No exam date set → gentle nudge to set one
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

  // Exam already past → hide
  if (days < 0) return null;

  const phaseKey = getPhaseMessage(days);

  return (
    <div className="border-b border-border/30 bg-muted/30">
      <div className="mx-auto flex h-8 max-w-6xl items-center gap-3 px-4 text-xs">
        {/* Days counter */}
        <span className="flex shrink-0 items-center gap-1 font-semibold text-foreground">
          <Flame className={`h-3.5 w-3.5 ${days <= 7 ? "text-red-500" : days <= 30 ? "text-orange-500" : "text-amber-500"}`} />
          {days === 0 ? t("motivation.today") : t("motivation.daysLeft", { days })}
        </span>
        <span className="hidden text-muted-foreground/60 sm:inline">·</span>
        {/* Phase hint */}
        <span className="hidden text-muted-foreground sm:inline">
          {t(`history.summary.countdown.${phaseKey}`)}
        </span>
        {/* Daily quote */}
        <span className="ml-auto hidden truncate text-muted-foreground/70 italic md:inline">
          « {quote.fr} »
        </span>
      </div>
    </div>
  );
}
