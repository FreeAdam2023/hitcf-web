"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, Sparkles, Check, Loader2, Gift } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { createCheckout } from "@/lib/api/subscriptions";
import { activateTrial } from "@/lib/api/trial";
import { PRICING, formatPrice } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/track";

interface QuotaExceededModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "question" | "explanation";
  used: number;
  limit: number;
}

const PLANS = [
  {
    key: "monthly" as const,
    price: formatPrice(PRICING.monthly),
    perMonth: null as string | null,
    savePercent: 0,
    trialDays: PRICING.monthlyTrialDays,
    recommended: false,
    limitedOffer: false,
  },
  {
    key: "quarterly" as const,
    price: formatPrice(PRICING.quarterly),
    perMonth: formatPrice(PRICING.quarterlyPerMonth),
    savePercent: PRICING.quarterlySavePercent,
    trialDays: PRICING.quarterlyTrialDays,
    recommended: false,
    limitedOffer: true,
  },
  {
    key: "semiannual" as const,
    price: formatPrice(PRICING.semiannual),
    perMonth: formatPrice(PRICING.semiannualPerMonth),
    savePercent: PRICING.semiannualSavePercent,
    trialDays: PRICING.semiannualTrialDays,
    recommended: true,
    limitedOffer: false,
  },
];

export function QuotaExceededModal({
  open,
  onOpenChange,
  type,
  used,
  limit,
}: QuotaExceededModalProps) {
  const t = useTranslations();
  const { isAuthenticated, user, fetchUser } = useAuthStore();
  const trialEligible = user?.trial_eligible ?? false;
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [activatingTrial, setActivatingTrial] = useState(false);

  const handleActivateTrial = async () => {
    setActivatingTrial(true);
    trackEvent("quota_modal_activate_trial");
    try {
      await activateTrial();
      await fetchUser();
      onOpenChange(false);
    } catch {
      // fallback
    } finally {
      setActivatingTrial(false);
    }
  };

  const handleSubscribe = async (plan: "monthly" | "quarterly" | "semiannual") => {
    trackEvent("quota_modal_subscribe", { plan });
    setLoadingPlan(plan);
    try {
      const { url } = await createCheckout(plan);
      window.location.href = url;
    } catch {
      window.location.href = "/payment/error";
    }
  };

  const handleRegister = (plan: "monthly" | "quarterly" | "semiannual") => {
    trackEvent("quota_modal_register", { plan });
    window.location.href = `/register?redirect=/pricing&plan=${plan}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {trialEligible ? (
              <><Gift className="h-5 w-5 text-indigo-500" />{t("quota.trial.title")}</>
            ) : (
              <><Lock className="h-5 w-5 text-amber-500" />{t("quota.exceeded.title")}</>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <span className="block">
                {type === "question"
                  ? t("quota.exceeded.questionMessage", { used, limit })
                  : t("quota.exceeded.explanationMessage", { used, limit })}
              </span>
              {trialEligible ? (
                <span className="block text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {t("quota.trial.subtitle", { days: PRICING.reverseTrialDays })}
                </span>
              ) : (
                <span className="block text-xs text-muted-foreground">
                  {t("quota.exceeded.resetHint")}
                </span>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {trialEligible ? (
          /* Trial activation CTA */
          <div className="mt-4 space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              {["trialFeature1", "trialFeature2", "trialFeature3"] .map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-500" />
                  <span>{t(`quota.trial.${key}`)}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={handleActivateTrial}
              disabled={activatingTrial}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 font-semibold hover:from-indigo-600 hover:to-violet-600"
            >
              {activatingTrial ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("quota.trial.activating")}</>
              ) : (
                t("quota.trial.activate", { days: PRICING.reverseTrialDays })
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {t("quota.trial.hint")}
            </p>
          </div>
        ) : (
        <>
        {/* Pricing cards */}
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={cn(
                "relative rounded-xl p-[1px]",
                plan.recommended
                  ? "bg-gradient-to-b from-primary via-violet-500 to-indigo-400"
                  : "bg-border",
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2">
                  <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-violet-500 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                    <Sparkles className="h-2.5 w-2.5" />
                    {t("quota.exceeded.recommended")}
                  </div>
                </div>
              )}
              <div className="flex h-full flex-col rounded-[11px] bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {t(`pricing.plans.${plan.key}.name`)}
                  </span>
                  {plan.limitedOffer && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      {t("pricing.limitedOffer")}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t(`pricing.plans.${plan.key}.unit`)}
                    </span>
                  </div>
                  {plan.perMonth && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {plan.perMonth} {t("pricing.perMonth")} · {t("pricing.save", { percent: plan.savePercent })}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {plan.key === "monthly" ? t("pricing.autoRenew") : t("pricing.noAutoRenew")}
                  </p>
                </div>

                <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 shrink-0 text-green-500" />
                    <span>
                      {t("quota.exceeded.trialDays", { days: plan.trialDays })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 shrink-0 text-green-500" />
                    <span>{t("quota.exceeded.unlimitedAccess")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 shrink-0 text-green-500" />
                    <span>{t("quota.exceeded.cancelAnytime")}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className={cn(
                    "mt-3 w-full",
                    plan.recommended
                      ? "bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
                      : "",
                  )}
                  variant={plan.recommended ? "default" : "outline"}
                  disabled={loadingPlan !== null}
                  onClick={() =>
                    isAuthenticated
                      ? handleSubscribe(plan.key)
                      : handleRegister(plan.key)
                  }
                >
                  {loadingPlan === plan.key
                    ? t("pricing.cta.redirecting")
                    : t("quota.exceeded.subscribe")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Continue free button */}
        <div className="mt-1 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            {t("quota.exceeded.continueFree")}
          </Button>
        </div>
        </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
