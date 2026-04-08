"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Flame, CalendarPlus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getDaysUntil } from "@/lib/countdown";
import { MOTIVATION_QUOTES } from "@/lib/motivation-quotes";

/** Day-of-year helper for rotating quotes. */
function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function MotivationStrip() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Not logged in → hide
  if (!isAuthenticated || !user) return null;

  // /history already has a full countdown card — skip strip to avoid duplication
  if (pathname === "/history") return null;

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

  return (
    <div className="border-b border-border/30 bg-muted/30">
      <div className="mx-auto flex h-8 max-w-6xl items-center gap-3 px-4 text-xs">
        {/* Days counter */}
        <span className="flex shrink-0 items-center gap-1 font-semibold text-foreground">
          <Flame className={`h-3.5 w-3.5 ${days <= 7 ? "text-red-500" : days <= 30 ? "text-orange-500" : "text-amber-500"}`} />
          {days === 0 ? t("motivation.today") : t("motivation.daysLeft", { days })}
        </span>
        <span className="text-muted-foreground/50 sm:hidden">·</span>
        {/* Daily quote — French + user language */}
        <span className="truncate text-muted-foreground/80">
          <span className="italic">« {quote.fr} »</span>
          {locale !== "fr" && (
            <span className="ml-1.5 text-foreground/60">{quote[locale as keyof typeof quote] || quote.en}</span>
          )}
          <span className="ml-1.5 text-muted-foreground/50">— {quote.author}</span>
        </span>
      </div>
    </div>
  );
}
