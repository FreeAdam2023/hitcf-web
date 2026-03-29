"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sparkles, Clock, Gift, X, Loader2 } from "lucide-react";
import { PRICING } from "@/lib/constants";
import { activateTrial } from "@/lib/api/trial";
import { toast } from "sonner";

export function TrialBanner() {
  const t = useTranslations("trialBanner");
  const { user, fetchUser } = useAuthStore();
  const sub = user?.subscription;
  const trialEligible = user?.trial_eligible ?? false;
  const [dismissed, setDismissed] = useState(false);
  const [activating, setActivating] = useState(false);

  // Mode 1: Pending activation (eligible but not activated)
  if (trialEligible && !dismissed) {
    const handleActivate = async () => {
      setActivating(true);
      try {
        await activateTrial();
        await fetchUser();
        toast.success(t("activatedToast"), { duration: 4000 });
      } catch {
        // ignore
      } finally {
        setActivating(false);
      }
    };

    const handleDismiss = () => {
      setDismissed(true);
    };

    return (
      <div className="flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200 animate-in slide-in-from-top duration-500">
        <Gift className="h-3.5 w-3.5" />
        <span>{t("pending", { days: PRICING.reverseTrialDays })}</span>
        <button
          onClick={handleActivate}
          disabled={activating}
          className="ml-1 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {activating ? <Loader2 className="h-3 w-3 animate-spin" /> : t("activateBtn")}
        </button>
        <button
          onClick={handleDismiss}
          className="ml-1 rounded-full p-0.5 text-violet-400 hover:text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // Mode 2: Active trial countdown
  if (!sub || sub.plan !== "reverse_trial" || sub.status !== "active") return null;
  if (!sub.current_period_end) return null;

  const endDate = new Date(sub.current_period_end);
  const now = new Date();
  if (endDate <= now) return null;

  const totalDays = PRICING.reverseTrialDays;
  const msLeft = endDate.getTime() - now.getTime();
  const daysLeft = Math.min(totalDays, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const currentDay = Math.max(1, totalDays - daysLeft + 1);
  const urgent = daysLeft <= 2;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors animate-in slide-in-from-top duration-500 ${
        urgent
          ? "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
          : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200"
      }`}
    >
      {urgent ? (
        <>
          <Clock className="h-3.5 w-3.5" />
          <span>{t("urgent", { daysLeft })}</span>
          <Link
            href="/pricing"
            className="ml-1 underline underline-offset-2 text-amber-900 hover:text-amber-700 dark:text-amber-100"
          >
            {t("upgrade")}
          </Link>
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("normal", { currentDay, totalDays })}</span>
        </>
      )}
    </div>
  );
}
