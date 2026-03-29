"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Crown,
  Loader2,
  AlertTriangle,
  X as XIcon,
  Headphones,
  Mic,
  PenTool,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "@/i18n/navigation";
import {
  getCustomerPortal,
  createCheckout,
  submitCancelReason,
  getUsageSummary,
  type UsageSummary,
} from "@/lib/api/subscriptions";
import { PRICING, formatPrice } from "@/lib/constants";

type Step = "manage" | "cancel1" | "cancel2" | "cancel3";

type CancelReason =
  | "too_expensive"
  | "not_using"
  | "found_alternative"
  | "exam_done"
  | "other";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStep?: "manage" | "cancel";
}

function formatDate(dateStr: string | null | undefined, locale = "zh"): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const loc = locale === "zh" ? "zh-CN" : "en-US";
  return d.toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function SubscriptionManageModal({
  open,
  onOpenChange,
  initialStep = "manage",
}: Props) {
  const t = useTranslations("subscriptionManage");
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const router = useRouter();
  const locale = (user?.ui_language || "zh") as string;

  const sub = user?.subscription;
  const plan = sub?.plan;
  const periodEnd = sub?.current_period_end;

  const [step, setStep] = useState<Step>(
    initialStep === "cancel" ? "cancel1" : "manage",
  );
  const [loading, setLoading] = useState(false);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [reason, setReason] = useState<CancelReason | "">("");
  const [details, setDetails] = useState("");

  // Reset state when modal opens/closes or initialStep changes
  useEffect(() => {
    if (open) {
      setStep(initialStep === "cancel" ? "cancel1" : "manage");
      setReason("");
      setDetails("");
      setLoading(false);
    }
  }, [open, initialStep]);

  // Fetch usage summary when entering cancel1
  const loadUsage = useCallback(() => {
    setUsageLoading(true);
    getUsageSummary()
      .then(setUsageSummary)
      .catch(() => setUsageSummary(null))
      .finally(() => setUsageLoading(false));
  }, []);

  useEffect(() => {
    if (step === "cancel1" && open) {
      loadUsage();
    }
  }, [step, open, loadUsage]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleManagePortal = async () => {
    setLoading(true);
    try {
      const { url } = await getCustomerPortal();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  const handleChangePlan = () => {
    handleClose();
    router.push("/pricing");
  };

  const handleSwitchSemiannual = async () => {
    setLoading(true);
    try {
      const { url } = await createCheckout("semiannual");
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await submitCancelReason({
        reason: reason + (details.trim() ? ` | ${details.trim()}` : ""),
      });
      await fetchUser();
      handleClose();
      toast.success(t("cancel.success"));
    } catch {
      toast.error("Failed to cancel. Please try again.");
      setLoading(false);
    }
  };

  // Should skip step2 if already on semiannual/yearly
  const shouldSkipStep2 =
    plan === "semiannual" || plan === "yearly";

  const goToNextCancelStep = () => {
    if (step === "cancel1") {
      if (shouldSkipStep2) {
        setStep("cancel3");
      } else {
        setStep("cancel2");
      }
    } else if (step === "cancel2") {
      setStep("cancel3");
    }
  };

  const planLabel =
    plan === "monthly"
      ? `${formatPrice(PRICING.monthly)} / ${t("planLabels.monthly")}`
      : plan === "quarterly"
        ? `${formatPrice(PRICING.quarterly)} / ${t("planLabels.quarterly")}`
        : plan === "semiannual"
          ? `${formatPrice(PRICING.semiannual)} / ${t("planLabels.semiannual")}`
          : plan || "";

  const LOSS_ITEMS = [
    { key: "loseUnlimited", icon: Headphones },
    { key: "loseSpeaking", icon: Mic },
    { key: "loseWriting", icon: PenTool },
    { key: "loseExam", icon: ClipboardList },
    { key: "loseVocab", icon: BookOpen },
  ] as const;

  const REASONS: CancelReason[] = [
    "too_expensive",
    "not_using",
    "found_alternative",
    "exam_done",
    "other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* ── Step: Manage ── */}
        {step === "manage" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                {t("title")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Current plan card */}
              <div className="rounded-xl border bg-gradient-to-br from-indigo-50/50 to-violet-50/50 p-4 dark:from-indigo-950/20 dark:to-violet-950/20">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("currentPlan")}
                </p>
                <p className="mt-1 text-lg font-bold">{planLabel}</p>
                {periodEnd && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {sub?.cancel_at_period_end
                      ? t("cancelsOn", { date: formatDate(periodEnd, locale) })
                      : `${t("nextBilling")}: ${formatDate(periodEnd, locale)}`}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleChangePlan}>
                  {t("changePlan")}
                </Button>
                {plan === "monthly" && (
                  <Button
                    variant="outline"
                    onClick={handleManagePortal}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t("updatePayment")}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setStep("cancel1")}
                >
                  {t("cancelSubscription")}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── Step: Cancel 1 — usage stats + loss list ── */}
        {step === "cancel1" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t("cancel.step1.title")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Usage stats */}
              {usageLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : usageSummary && usageSummary.total_questions > 0 ? (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  {t("cancel.step1.usageStats", {
                    questions: usageSummary.total_questions,
                    accuracy: Math.round(usageSummary.accuracy),
                  })}
                </div>
              ) : null}

              {/* Loss list */}
              <div>
                <p className="mb-2 text-sm font-medium">
                  {t("cancel.step1.loseTitle")}
                </p>
                <div className="space-y-2">
                  {LOSS_ITEMS.map(({ key, icon: Icon }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
                        <XIcon className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                      <span>{t(`cancel.step1.${key}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access until */}
              {periodEnd && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  {t("cancel.step1.accessUntil", {
                    date: formatDate(periodEnd, locale),
                  })}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                  onClick={handleClose}
                >
                  {t("cancel.step1.keep")}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-muted-foreground"
                  onClick={goToNextCancelStep}
                >
                  {t("cancel.step1.continue")}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── Step: Cancel 2 — downgrade offer ── */}
        {step === "cancel2" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("cancel.step2.title")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Semiannual offer card */}
              <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 dark:border-indigo-800 dark:from-indigo-950/30 dark:to-violet-950/30">
                <p className="text-center text-lg font-bold">
                  {t("cancel.step2.offer")}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                  onClick={handleSwitchSemiannual}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("cancel.step2.switch")}
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => setStep("cancel3")}
                >
                  {t("cancel.step2.noThanks")}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── Step: Cancel 3 — final confirmation ── */}
        {step === "cancel3" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("cancel.step3.title")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Reason selection */}
              <div>
                <p className="mb-2 text-sm font-medium">
                  {t("cancel.step3.reasonLabel")}
                </p>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <input
                        type="radio"
                        name="cancel-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm">
                        {t(`cancel.step3.reasons.${r}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional details */}
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t("cancel.step3.detailPlaceholder")}
                maxLength={500}
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />

              {/* Warning */}
              {periodEnd && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {t("cancel.step3.warning", {
                    date: formatDate(periodEnd, locale),
                  })}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                  onClick={handleClose}
                >
                  {t("cancel.step3.keep")}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleConfirmCancel}
                  disabled={loading || !reason}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("cancel.step3.confirm")}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
