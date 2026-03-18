"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitCancelReason } from "@/lib/api/subscriptions";

const REASONS = [
  "too_expensive",
  "not_using",
  "found_alternative",
  "exam_done",
  "other",
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelSubscriptionDialog({ open, onOpenChange }: Props) {
  const t = useTranslations("cancelSubscription");
  const [step, setStep] = useState<"reason" | "confirm">("reason");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep("reason");
    setReason("");
    setFeedback("");
    setSubmitting(false);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleNext = () => {
    if (!reason) return;
    setStep("confirm");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitCancelReason({
        reason,
        feedback: feedback.trim() || undefined,
      });
      // Redirect to Stripe Portal for actual cancellation
      window.location.href = res.portal_url;
    } catch {
      toast.error(t("error"));
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {step === "reason" ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <RadioGroup value={reason} onValueChange={setReason}>
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value={r} />
                    <span className="text-sm">{t(`reasons.${r}`)}</span>
                  </label>
                ))}
              </RadioGroup>

              <div>
                <label className="text-sm text-muted-foreground">
                  {t("feedbackLabel")}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t("feedbackPlaceholder")}
                  maxLength={1000}
                  rows={3}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                {t("keepSubscription")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleNext}
                disabled={!reason}
              >
                {t("next")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("confirmTitle")}</DialogTitle>
              <DialogDescription>{t("confirmWarning")}</DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {t("confirmDetail")}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setStep("reason")}>
                {t("goBack")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("confirmCancel")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
