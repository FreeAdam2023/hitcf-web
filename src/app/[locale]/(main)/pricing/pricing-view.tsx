"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Check,
  Gift,
  Shield,
  CreditCard,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Testimonials } from "@/components/shared/testimonials";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthStore } from "@/stores/auth-store";
import { createCheckout, getCustomerPortal } from "@/lib/api/subscriptions";
import { cn } from "@/lib/utils";
import { PRICING, formatPrice, STATS_PARAMS } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics/track";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    key: "monthly" as const,
    price: formatPrice(PRICING.monthly),
    perMonth: null as string | null,
    savePercent: 0,
    recommended: false,
    limitedOffer: false,
  },
  {
    key: "quarterly" as const,
    price: formatPrice(PRICING.quarterly),
    perMonth: formatPrice(PRICING.quarterlyPerMonth),
    savePercent: PRICING.quarterlySavePercent,
    recommended: false,
    limitedOffer: true,
  },
  {
    key: "yearly" as const,
    price: formatPrice(PRICING.yearly),
    perMonth: formatPrice(PRICING.yearlyPerMonth),
    savePercent: PRICING.yearlySavePercent,
    recommended: true,
    limitedOffer: false,
  },
];

/** free column: true = check, false = X, number = index into freeValues */
const COMPARISON_FREE: (boolean | number)[] = [
  0, 0, 2, 2, false, true, 1, true, 4, true,
];

const FAQ_COUNT = 7;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PricingView() {
  const t = useTranslations();
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const isSubscribed = hasActiveSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "yearly">("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const activePlan = PLANS.find((p) => p.key === selectedPlan)!;

  // Track pricing page view
  useEffect(() => {
    trackEvent("viewed_pricing");
  }, []);

  // Shared interpolation params for i18n strings containing prices
  const pp = {
    monthlyPrice: PRICING.monthly.toFixed(2),
    quarterlyPrice: PRICING.quarterly.toFixed(2),
    quarterlyPerMonth: PRICING.quarterlyPerMonth.toFixed(2),
    quarterlySavingsPercent: String(PRICING.quarterlySavePercent),
    yearlyPrice: PRICING.yearly.toFixed(2),
    yearlyPerMonth: PRICING.yearlyPerMonth.toFixed(2),
    savingsPercent: String(PRICING.yearlySavePercent),
    monthlyTrialDays: String(PRICING.monthlyTrialDays),
    quarterlyTrialDays: String(PRICING.quarterlyTrialDays),
    yearlyTrialDays: String(PRICING.yearlyTrialDays),
  };

  const handleSubscribe = async (plan: "monthly" | "quarterly" | "yearly") => {
    trackEvent("clicked_subscribe", { plan });
    setLoadingPlan(plan);
    try {
      const { url } = await createCheckout(plan);
      window.location.href = url;
    } catch {
      window.location.href = "/payment/error";
    }
  };

  const handleManage = async () => {
    setLoadingPlan("manage");
    try {
      const { url } = await getCustomerPortal();
      window.location.href = url;
    } catch {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-6 sm:py-10">
      {/* ============================================================ */}
      {/*  ABOVE THE FOLD: headline + plans + CTA + value anchor       */}
      {/* ============================================================ */}

      {/* ---- Headline ---- */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          {t("pricing.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("pricing.subtitle")}
        </p>
      </div>

      {/* ---- Plan Cards ---- */}
      <div>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            return (
              <div
                key={plan.key}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedPlan(plan.key)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedPlan(plan.key); }}
                className={cn(
                  "relative cursor-pointer rounded-xl p-[1px] transition-all",
                  plan.recommended
                    ? "bg-gradient-to-b from-primary via-violet-500 to-indigo-400"
                    : "bg-border",
                  isSelected
                    ? "shadow-lg shadow-primary/20 scale-[1.02] ring-2 ring-primary/50"
                    : "hover:bg-primary/30",
                )}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-violet-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      {t("pricing.mostPopular")}
                    </div>
                  </div>
                )}
                <Card className="flex h-full flex-col border-0 bg-card">
                  <div className="flex flex-1 flex-col gap-2 p-5 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{t(`pricing.plans.${plan.key}.name`)}</span>
                      {plan.limitedOffer && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          {t("pricing.limitedOffer")}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{t(`pricing.plans.${plan.key}.unit`)}</span>
                      </div>
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
                </Card>
              </div>
            );
          })}
        </div>

        {/* ---- Dynamic value line ---- */}
        <div className="mt-4 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {t(`pricing.plans.${activePlan.key}.valueDesc`)}
            <span className="mx-1.5 text-muted-foreground/40">·</span>
            {t(`pricing.plans.${activePlan.key}.savingsVsTutor`)}
          </p>
        </div>

        {/* ---- CTA ---- */}
        <div className="mt-5 text-center">
          {isSubscribed ? (
            <Button
              size="lg"
              variant="outline"
              className="px-10"
              onClick={handleManage}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "manage" ? t("pricing.cta.redirecting") : t("pricing.cta.manageSubscription")}
            </Button>
          ) : isAuthenticated ? (
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 px-10"
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === selectedPlan
                ? t("pricing.cta.redirecting")
                : `${t(`pricing.plans.${activePlan.key}.trialLabel`, pp)}${t("pricing.cta.trialSuffix")}`}
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 px-10"
              asChild
            >
              <Link href="/register">
                {`${t(`pricing.plans.${activePlan.key}.trialLabel`, pp)}${t("pricing.cta.trialSuffix")}`}
              </Link>
            </Button>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {t("pricing.usdNote")}
          </p>

          {/* Referral nudge */}
          {!isSubscribed && (
            <Link
              href="/referral"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Gift className="h-4 w-4" />
              {t("pricing.referralNudge")}
            </Link>
          )}
        </div>
      </div>

      {/* ---- Trust Strip ---- */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t("pricing.trust.trial", pp)}</span>
        <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> {t("pricing.trust.stripe")}</span>
        <span className="inline-flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> {t("pricing.trust.refund")}</span>
        <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {t("pricing.trust.cancel")}</span>
      </div>

      {/* ============================================================ */}
      {/*  BELOW THE FOLD: details for skeptics                        */}
      {/* ============================================================ */}

      {/* ---- Testimonials ---- */}
      <Testimonials />

      {/* ---- Free vs Pro ---- */}
      <div>
        <h2 className="mb-6 text-center text-lg font-bold tracking-tight">
          {t("pricing.comparison.title")} <span className="text-primary">{t("pricing.comparison.titlePro")}</span>
        </h2>

        {/* ---- Desktop table (hidden on mobile) ---- */}
        <Card className="hidden sm:block overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid grid-cols-[1fr_120px_80px] items-center border-b bg-muted/30 px-6 py-3.5">
              <span className="text-sm font-semibold text-muted-foreground">{t("pricing.comparison.feature")}</span>
              <span className="text-center text-sm font-semibold text-muted-foreground">{t("pricing.comparison.free")}</span>
              <span className="text-center text-sm font-semibold text-primary">{t("pricing.comparison.pro")}</span>
            </div>
            {/* Rows */}
            {COMPARISON_FREE.map((freeVal, i) => (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-[1fr_120px_80px] items-center px-6 py-3.5 transition-colors hover:bg-muted/20",
                  i < COMPARISON_FREE.length - 1 && "border-b border-border/50",
                )}
              >
                <span className="text-sm">{t(`pricing.comparison.rows.${i}`)}</span>
                <span className="flex items-center justify-center">
                  {freeVal === true ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                  ) : freeVal === false ? (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  ) : (
                    <span className="whitespace-nowrap rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {t(`pricing.comparison.freeValues.${freeVal}`, STATS_PARAMS)}
                    </span>
                  )}
                </span>
                <span className="flex items-center justify-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ---- Mobile cards (hidden on desktop) ---- */}
        <div className="space-y-2.5 sm:hidden">
          {COMPARISON_FREE.map((freeVal, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 rounded-xl border bg-card px-4 py-3.5"
            >
              <span className="flex-1 text-sm leading-snug">{t(`pricing.comparison.rows.${i}`)}</span>
              <div className="flex shrink-0 items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">{t("pricing.comparison.free")}</span>
                  {freeVal === true ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                  ) : freeVal === false ? (
                    <span className="text-sm text-muted-foreground/40">—</span>
                  ) : (
                    <span className="max-w-[5rem] text-center text-[10px] leading-tight font-medium text-muted-foreground">
                      {t(`pricing.comparison.freeValues.${freeVal}`, STATS_PARAMS)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-primary">{t("pricing.comparison.pro")}</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- FAQ ---- */}
      <div>
        <h2 className="mb-4 text-center text-lg font-bold tracking-tight">{t("pricing.faq.title")}</h2>
        <Card>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {Array.from({ length: FAQ_COUNT }, (_, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b px-5 last:border-0">
                  <AccordionTrigger className="text-left text-sm hover:no-underline">
                    {t(`pricing.faq.items.${i}.q`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {t(`pricing.faq.items.${i}.a`, pp)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* ---- Legal ---- */}
      <p className="text-center text-xs text-muted-foreground">
        {t("pricing.legal")}{" "}
        <Link href="/terms-of-service" className="underline hover:text-foreground">{t("pricing.legalTerms")}</Link>
        {t("pricing.legalComma")}
        <Link href="/privacy-policy" className="underline hover:text-foreground">{t("pricing.legalPrivacy")}</Link>
        {t("pricing.legalAnd")}
        <Link href="/refund-policy" className="underline hover:text-foreground">{t("pricing.legalRefund")}</Link>
        {t("pricing.legalPeriod")}
      </p>
    </div>
  );
}
