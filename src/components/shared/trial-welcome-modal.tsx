"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Headphones, BookOpen, Mic, PenTool, BookMarked, BarChart3, Sparkles, Loader2, X } from "lucide-react";
import { PRICING } from "@/lib/constants";
import { activateTrial } from "@/lib/api/trial";

const FEATURES = [
  { icon: Headphones, key: "listening" },
  { icon: BookOpen, key: "reading" },
  { icon: Mic, key: "speaking" },
  { icon: PenTool, key: "writing" },
  { icon: BookMarked, key: "vocabulary" },
  { icon: BarChart3, key: "analytics" },
] as const;

export function TrialWelcomeModal() {
  const t = useTranslations("welcome");
  const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const [show, setShow] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    if (!user.trial_eligible) return;
    const key = `trial_welcome_dismissed:${user.id}`;
    if (localStorage.getItem(key)) return;
    setShow(true);
  }, [isLoading, isAuthenticated, user]);

  if (!show) return null;

  const name = user?.name || user?.email?.split("@")[0] || "";

  const handleActivate = async () => {
    setActivating(true);
    try {
      await activateTrial();
      await fetchUser();
    } catch {
      // ignore
    } finally {
      setActivating(false);
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    if (user?.id) {
      localStorage.setItem(`trial_welcome_dismissed:${user.id}`, "1");
    }
    setShow(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-300 rounded-2xl bg-background shadow-2xl overflow-hidden">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-6 text-center text-white">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">{t("title", { name })}</h2>
          <p className="mt-1 text-sm text-white/80">
            {t("subtitleChoice", { days: PRICING.reverseTrialDays })}
          </p>
        </div>

        {/* Feature grid */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="flex items-start gap-2 rounded-lg border bg-card p-2.5"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                <div>
                  <p className="text-xs font-medium">{t(`features.${key}`)}</p>
                  <p className="text-[10px] text-muted-foreground">{t(`featuresDesc.${key}`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-5 space-y-2">
          <Button
            onClick={handleActivate}
            disabled={activating}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 font-semibold hover:from-indigo-600 hover:to-violet-600"
          >
            {activating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("activating")}</>
            ) : (
              t("cta")
            )}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            {t("hint", { days: PRICING.reverseTrialDays })}
          </p>
          <button
            onClick={handleDismiss}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("skip")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
