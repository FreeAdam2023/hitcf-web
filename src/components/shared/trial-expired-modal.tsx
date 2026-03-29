"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Lock, Check, X } from "lucide-react";
import { PRICING, formatPrice } from "@/lib/constants";

/** Show once when reverse_trial has expired. Dismissible. */
export function TrialExpiredModal() {
  const t = useTranslations("trialExpired");
  const user = useAuthStore((s) => s.user);
  const sub = user?.subscription;
  const [dismissed, setDismissed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!sub || sub.plan !== "reverse_trial") return;
    if (sub.status === "active") return; // still active, don't show
    // Trial expired — check if already dismissed this session
    const key = `trial_expired_dismissed_${user?.id}`;
    if (sessionStorage.getItem(key)) return;
    setShown(true);
  }, [sub, user?.id]);

  if (!shown || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (user?.id) {
      sessionStorage.setItem(`trial_expired_dismissed_${user.id}`, "1");
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

          {/* Pricing quick view */}
          <div className="flex justify-center gap-2 text-xs text-muted-foreground">
            <span>{formatPrice(PRICING.monthly)}/mo</span>
            <span>|</span>
            <span>{formatPrice(PRICING.quarterly)}/3mo</span>
            <span>|</span>
            <span>{formatPrice(PRICING.semiannual)}/6mo</span>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <Link href="/pricing" onClick={handleDismiss}>
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 font-semibold hover:from-indigo-600 hover:to-violet-600">
                {t("upgrade")}
              </Button>
            </Link>
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
