"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
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

          {/* Direct checkout buttons */}
          <div className="grid grid-cols-3 gap-2">
            {([
              { plan: "monthly" as const, price: formatPrice(PRICING.monthly), label: t("monthly"), perMonth: null, popular: false },
              { plan: "quarterly" as const, price: formatPrice(PRICING.quarterly), label: t("quarterly"), perMonth: formatPrice(PRICING.quarterlyPerMonth), popular: false },
              { plan: "semiannual" as const, price: formatPrice(PRICING.semiannual), label: t("semiannual"), perMonth: formatPrice(PRICING.semiannualPerMonth), popular: true },
            ]).map(({ plan, price, label, perMonth, popular }) => (
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
                className={`relative rounded-xl p-3 text-center transition-all ${
                  popular
                    ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 ring-2 ring-indigo-500"
                    : "border bg-card hover:border-indigo-300 hover:shadow-sm"
                } ${loadingPlan !== null ? "opacity-60" : ""}`}
              >
                {popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-amber-900">
                    {t("bestValue")}
                  </div>
                )}
                {loadingPlan === plan ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <div className={`text-sm font-bold ${popular ? "" : "text-foreground"}`}>{label}</div>
                    <div className={`text-lg font-black tracking-tight ${popular ? "" : "text-foreground"}`}>{price}</div>
                    {perMonth && (
                      <div className={`text-[10px] ${popular ? "text-white/70" : "text-muted-foreground"}`}>
                        ≈ {perMonth}/mo
                      </div>
                    )}
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
