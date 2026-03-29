"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
// Button removed — using custom styled buttons for checkout cards
import { Lock, Check, X, Loader2 } from "lucide-react";
import { PRICING, formatPrice } from "@/lib/constants";
import { createCheckout } from "@/lib/api/subscriptions";

/** Show once when reverse_trial has expired. Dismissible. */
export function TrialExpiredModal() {
  const t = useTranslations("trialExpired");
  const user = useAuthStore((s) => s.user);
  const sub = user?.subscription;
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [shown, setShown] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!sub || sub.plan !== "reverse_trial") return;
    if (sub.status === "active") return;
    // Don't show on pricing page (redundant)
    if (pathname.includes("/pricing")) return;
    const key = `trial_expired_dismissed_${user?.id}`;
    if (localStorage.getItem(key)) return;
    setShown(true);
  }, [sub, user?.id, pathname]);

  if (!shown || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (user?.id) {
      localStorage.setItem(`trial_expired_dismissed_${user.id}`, "1");
    }
  };

  const FREE_FEATURES = ["freeListening", "freeReading", "freeVocab"] as const;
  const LOCKED_FEATURES = ["lockedSpeaking", "lockedWriting", "lockedExam", "lockedWrongBook", "lockedSpeedDrill"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Lock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>

          <div>
            <h2 className="text-xl font-bold">{t("title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          {/* What you keep vs what's locked */}
          <div className="grid grid-cols-2 gap-3 text-left text-sm">
            <div className="space-y-2">
              <p className="font-medium text-green-600 dark:text-green-400">{t("keepTitle")}</p>
              {FREE_FEATURES.map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-muted-foreground">{t(key)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-medium text-red-500 dark:text-red-400">{t("lockedTitle")}</p>
              {LOCKED_FEATURES.map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-muted-foreground">{t(key)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Single recommended plan — clean and focused */}
          <div className="rounded-xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-white p-4 dark:border-indigo-900 dark:from-indigo-950/30 dark:to-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t("semiannual")}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tracking-tight">{formatPrice(PRICING.semiannual)}</span>
                  <span className="text-xs text-muted-foreground">/ 6 mo</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ≈ {formatPrice(PRICING.semiannualPerMonth)}/mo · {t("save", { percent: PRICING.semiannualSavePercent })}
                </div>
              </div>
              <button
                disabled={loadingPlan !== null}
                onClick={async () => {
                  setLoadingPlan("semiannual");
                  try {
                    const { url } = await createCheckout("semiannual");
                    window.location.href = url;
                  } catch {
                    window.location.href = "/pricing";
                  }
                }}
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:from-indigo-600 hover:to-violet-600 transition-all disabled:opacity-60"
              >
                {loadingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : t("upgrade")}
              </button>
            </div>
          </div>
          <div className="text-center">
            <a href="/pricing" onClick={() => handleDismiss()} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
              {t("viewAllPlans")}
            </a>
          </div>

          {/* Dismiss */}
          <div className="space-y-2">
            <button
              onClick={handleDismiss}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("continueFree")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
