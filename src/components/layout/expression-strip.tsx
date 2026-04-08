"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Flame, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getDaysUntil } from "@/lib/countdown";
import { getExpressionByIndex } from "@/lib/french-expressions";

/** Day-of-year helper for rotating expressions. */
function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function ExpressionStrip() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Hide during exam — don't distract
  const isInExam =
    pathname.startsWith("/exam") ||
    pathname.startsWith("/writing-exam") ||
    pathname.startsWith("/writing-mock-exam") ||
    pathname.startsWith("/speaking-exam");
  if (isInExam) return null;

  // Practice: show but not clickable
  const isInPractice =
    pathname.startsWith("/practice") ||
    pathname.startsWith("/writing-practice") ||
    pathname.startsWith("/speaking-practice") ||
    pathname.startsWith("/speaking-conversation");

  // /history has its own countdown card — skip to avoid duplication
  if (isAuthenticated && pathname === "/history") return null;

  const expression = getExpressionByIndex(dayOfYear());
  const examDate = isAuthenticated && user ? user.exam_date : null;
  const days = examDate ? getDaysUntil(examDate) : null;
  const showCountdown = days !== null && days >= 0;

  const meaning =
    expression.meaning[locale as keyof typeof expression.meaning] ||
    expression.meaning.en;

  const content = (
    <>
      {/* Countdown — only for logged-in users with a future exam date */}
      {showCountdown && (
        <>
          <span className="flex shrink-0 items-center gap-1 font-semibold text-foreground">
            <Flame
              className={`h-3.5 w-3.5 ${days <= 7 ? "text-red-500" : days <= 30 ? "text-orange-500" : "text-amber-500"}`}
            />
            {days === 0
              ? t("motivation.today")
              : t("motivation.daysLeft", { days })}
          </span>
          <span className="text-muted-foreground/30">·</span>
        </>
      )}

      {/* Expression */}
      <span className="min-w-0 flex-1 truncate text-muted-foreground/80">
        <span className="font-medium text-foreground/90">{expression.fr}</span>
        <span className="ml-1.5">— {meaning}</span>
      </span>

      {/* Level badge + category + arrow (hide arrow during practice) */}
      <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground/50">
        <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium leading-none">
          {expression.level}
        </span>
        <span className="hidden text-[10px] sm:inline">
          {t(`expressions.categories.${expression.category}`)}
        </span>
        {!isInPractice && <ChevronRight className="h-3 w-3" />}
      </span>
    </>
  );

  const stripClass = "mx-auto flex h-8 max-w-6xl items-center gap-2 px-4 text-xs";

  return (
    <div className="border-b border-border/30 bg-muted/30">
      {isInPractice ? (
        <div className={stripClass}>{content}</div>
      ) : (
        <Link
          href="/expressions"
          className={`${stripClass} transition-colors hover:bg-muted/50`}
        >
          {content}
        </Link>
      )}
    </div>
  );
}
