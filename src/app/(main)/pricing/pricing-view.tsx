"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Check,
  X,
  Shield,
  CreditCard,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    key: "monthly" as const,
    price: "US$19.90",
    recommended: false,
  },
  {
    key: "yearly" as const,
    price: "US$99.90",
    recommended: true,
  },
];

/** free column: true = check, false = X, number = index into freeValues */
const COMPARISON_FREE: (boolean | number)[] = [
  0, 0, false, false, 1, true, true, true, true, true,
];

const FAQ_COUNT = 7;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PricingView() {
  const t = useTranslations();
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const isSubscribed = hasActiveSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const activePlan = PLANS.find((p) => p.key === selectedPlan)!;

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
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
        <div className="mx-auto grid max-w-xl gap-4 sm:grid-cols-2">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            const equiv = plan.key !== "monthly" ? t(`pricing.plans.${plan.key}.equiv`) : null;
            const badge = plan.key !== "monthly" ? t(`pricing.plans.${plan.key}.badge`) : null;
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
                  <div className="flex flex-1 flex-col gap-1 p-5 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{t(`pricing.plans.${plan.key}.name`)}</span>
                      {badge && !plan.recommended && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {badge}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                      <span className="ml-1 text-sm text-muted-foreground">{t(`pricing.plans.${plan.key}.unit`)}</span>
                    </div>
                    {equiv && (
                      <p className="text-xs text-muted-foreground">{equiv}</p>
                    )}
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
                : `${t(`pricing.plans.${activePlan.key}.trialLabel`)}${t("pricing.cta.trialSuffix")}`}
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 px-10"
              asChild
            >
              <Link href="/register">
                {`${t(`pricing.plans.${activePlan.key}.trialLabel`)}${t("pricing.cta.trialSuffix")}`}
              </Link>
            </Button>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {t("pricing.usdNote")}
          </p>
        </div>
      </div>

      {/* ---- Trust Strip ---- */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t("pricing.trust.trial")}</span>
        <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> {t("pricing.trust.stripe")}</span>
        <span className="inline-flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> {t("pricing.trust.refund")}</span>
        <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {t("pricing.trust.cancel")}</span>
      </div>

      {/* ============================================================ */}
      {/*  BELOW THE FOLD: details for skeptics                        */}
      {/* ============================================================ */}

      {/* ---- Free vs Pro ---- */}
      <div>
        <h2 className="mb-4 text-center text-lg font-bold tracking-tight">
          {t("pricing.comparison.title")} <span className="text-primary">{t("pricing.comparison.titlePro")}</span>
        </h2>
        <Card>
          <CardContent className="divide-y p-0">
            <div className="flex items-center gap-3 px-5 py-3">
              <span className="flex-1 text-sm font-medium text-muted-foreground">{t("pricing.comparison.feature")}</span>
              <span className="w-16 text-center text-xs font-semibold text-muted-foreground">{t("pricing.comparison.free")}</span>
              <span className="w-16 text-center text-xs font-semibold text-primary">{t("pricing.comparison.pro")}</span>
            </div>
            {COMPARISON_FREE.map((freeVal, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/30">
                <span className="flex-1 text-sm">{t(`pricing.comparison.rows.${i}`)}</span>
                <span className="flex w-16 items-center justify-center">
                  {freeVal === true ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                      <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                  ) : freeVal === false ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                      <X className="h-3 w-3 text-muted-foreground/40" />
                    </div>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {t(`pricing.comparison.freeValues.${freeVal}`)}
                    </span>
                  )}
                </span>
                <span className="flex w-16 items-center justify-center">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
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
                    {t(`pricing.faq.items.${i}.a`)}
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
