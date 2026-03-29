"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
// Button removed — using custom styled buttons for checkout cards
import { Lock, Check, X, Loader2, Sparkles } from "lucide-react";
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

          {/* Direct checkout cards — mirrors quota modal style */}
          <div className="grid grid-cols-3 gap-2">
            {([
              { plan: "monthly" as const, price: formatPrice(PRICING.monthly), unit: "/" + t("monthly"), label: t("monthly"), perMonth: null, save: null, popular: false },
              { plan: "quarterly" as const, price: formatPrice(PRICING.quarterly), unit: "/" + t("quarterly"), label: t("quarterly"), perMonth: formatPrice(PRICING.quarterlyPerMonth), save: `${PRICING.quarterlySavePercent}%`, popular: false },
              { plan: "semiannual" as const, price: formatPrice(PRICING.semiannual), unit: "/6mo", label: t("semiannual"), perMonth: formatPrice(PRICING.semiannualPerMonth), save: `${PRICING.semiannualSavePercent}%`, popular: true },
            ]).map(({ plan, price, unit, label, perMonth, save, popular }) => (
              <button
                key={plan}
                disabled={loadingPlan !== null}
                onClick={async () => {
                  setLoadingPlan(plan);
                  try {
                    const { url } = await createCheckout(plan);
                    window.location.href = url;
                  } catch {
                    window.location.href = "/pricing";
                  }
                }}
                className={`relative rounded-xl p-3 text-left transition-all ${
                  popular
                    ? "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm"
                    : "border bg-card hover:border-indigo-200 hover:shadow-sm"
                } ${loadingPlan !== null ? "opacity-60" : ""}`}
              >
                {popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    <Sparkles className="h-2.5 w-2.5" />
                    {t("bestValue")}
                  </div>
                )}
                {loadingPlan === plan ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <div className="text-xs font-semibold text-foreground">{label}</div>
                    <div className="mt-1 flex items-baseline gap-0.5">
                      <span className="text-xl font-black tracking-tight text-foreground">{price}</span>
                      <span className="text-[10px] text-muted-foreground">{unit}</span>
                    </div>
                    {perMonth && (
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        ≈ {perMonth}/mo{save && ` · ${save}`}
                      </div>
                    )}
                    <div className={`mt-2 w-full rounded-md py-1.5 text-center text-xs font-semibold ${
                      popular
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                        : "border text-foreground"
                    }`}>
                      {t("upgrade")}
                    </div>
                  </>
                )}
              </button>
            ))}
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
