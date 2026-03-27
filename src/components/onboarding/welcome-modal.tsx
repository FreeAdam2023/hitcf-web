"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Headphones, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { getAttemptProgress } from "@/lib/api/attempts";
import { createAttempt } from "@/lib/api/attempts";
import { listTestSets } from "@/lib/api/test-sets";

/**
 * Shows a welcome modal for first-time users (0 attempts).
 * One CTA: start first listening question immediately.
 * Persists dismissal in localStorage.
 */
export function WelcomeModal() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  const [show, setShow] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    // Already dismissed
    const key = `onboarding_dismissed:${user.id}`;
    if (localStorage.getItem(key)) return;

    // Check if user has done any practice
    getAttemptProgress()
      .then((p) => {
        const total = p.listening.done + p.reading.done + p.speaking.done + p.writing.done;
        if (total === 0) setShow(true);
      })
      .catch(() => {});
  }, [isLoading, isAuthenticated, user]);

  const handleDismiss = () => {
    if (user) localStorage.setItem(`onboarding_dismissed:${user.id}`, "1");
    setShow(false);
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      // Find first listening test set (order=0, 听力补充测试1)
      const res = await listTestSets({ type: "listening", page: 1, page_size: 1 });
      const firstTest = res.items?.[0];
      if (!firstTest) {
        handleDismiss();
        router.push("/tests");
        return;
      }

      // Create practice attempt
      const attempt = await createAttempt({
        test_set_id: firstTest.id,
        mode: "practice",
      });

      handleDismiss();
      router.push(`/practice/${attempt.id}`);
    } catch {
      // Fallback: just go to tests page
      handleDismiss();
      router.push("/tests");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300 rounded-2xl bg-background shadow-2xl overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-6 py-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <p className="mt-2 text-sm text-white/80">{t("subtitle")}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t("description")}
          </p>

          <Button
            onClick={handleStart}
            disabled={starting}
            className="w-full h-12 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-base font-semibold"
          >
            <Headphones className="h-5 w-5" />
            {starting ? t("starting") : t("cta")}
          </Button>

          <button
            onClick={handleDismiss}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            {t("skip")} <ArrowRight className="inline h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
