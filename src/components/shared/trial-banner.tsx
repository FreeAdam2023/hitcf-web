"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sparkles, Clock } from "lucide-react";
import { PRICING } from "@/lib/constants";

export function TrialBanner() {
  const t = useTranslations("trialBanner");
  const user = useAuthStore((s) => s.user);
  const sub = user?.subscription;

  if (!sub || sub.plan !== "reverse_trial" || sub.status !== "active") return null;
  if (!sub.current_period_end) return null;

  const endDate = new Date(sub.current_period_end);
  const now = new Date();
  if (endDate <= now) return null;

  const totalDays = PRICING.reverseTrialDays;
  const msLeft = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const currentDay = totalDays - daysLeft + 1;
  const urgent = daysLeft <= 2;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors ${
        urgent
          ? "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
          : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200"
      }`}
    >
      {urgent ? (
        <>
          <Clock className="h-3.5 w-3.5" />
          <span>{t("urgent", { daysLeft })}</span>
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("normal", { currentDay, totalDays })}</span>
        </>
      )}
      <Link
        href="/pricing"
        className={`ml-1 underline underline-offset-2 ${
          urgent
            ? "text-amber-900 hover:text-amber-700 dark:text-amber-100"
            : "text-indigo-800 hover:text-indigo-600 dark:text-indigo-100"
        }`}
      >
        {urgent ? t("upgrade") : t("learnMore")}
      </Link>
    </div>
  );
}
