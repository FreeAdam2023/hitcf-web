"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
// Button removed — using custom styled buttons for checkout cards
import { Lock, X, Loader2, Check } from "lucide-react";
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

  // Feature lists removed — cards are the hero now

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg sm:max-w-2xl rounded-2xl bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-4 text-center">
          <div>
            <Lock className="mx-auto h-6 w-6 text-amber-500 mb-2" />
            <h2 className="text-xl font-bold">{t("title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitleShort")}</p>
          </div>

          {/* Pricing cards — same style as quota modal */}
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { plan: "monthly" as const, price: formatPrice(PRICING.monthly), unit: t("monthly"), perMonth: null, save: 0, recommended: false, renewal: t("autoRenew") },
              { plan: "quarterly" as const, price: formatPrice(PRICING.quarterly), unit: t("quarterly"), perMonth: formatPrice(PRICING.quarterlyPerMonth), save: PRICING.quarterlySavePercent, recommended: false, renewal: t("noRenew") },
              { plan: "semiannual" as const, price: formatPrice(PRICING.semiannual), unit: t("semiannual"), perMonth: formatPrice(PRICING.semiannualPerMonth), save: PRICING.semiannualSavePercent, recommended: true, renewal: t("noRenew") },
            ]).map(({ plan, price, unit, perMonth, save, recommended, renewal }) => (
              <div
                key={plan}
                className={`relative rounded-xl p-[1px] ${
                  recommended
                    ? "bg-gradient-to-b from-primary via-violet-500 to-indigo-400"
                    : "bg-border"
                }`}
              >
                {recommended && (
                  <div className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-violet-500 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                      {t("bestValue")}
                    </div>
                  </div>
                )}
                <div className="flex h-full flex-col rounded-[11px] bg-card p-4">
                  <span className="text-sm font-semibold">{unit}</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">{price}</span>
                  </div>
                  {perMonth ? (
                    <p className="text-xs text-muted-foreground">
                      ≈ {perMonth}/mo · {t("save", { percent: save })}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{renewal}</p>
                  )}
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {["feature1", "feature2", "feature3"].map((k) => (
                      <div key={k} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 shrink-0 text-green-500" />
                        <span>{t(k)}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className={`mt-3 w-full rounded-md py-2 text-sm font-semibold transition-colors ${
                      recommended
                        ? "bg-gradient-to-r from-primary to-violet-500 text-white hover:from-primary/90 hover:to-violet-500/90"
                        : "border hover:bg-muted"
                    }`}
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
                  >
                    {loadingPlan === plan
                      ? <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      : t("upgrade")}
                  </button>
                </div>
              </div>
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
