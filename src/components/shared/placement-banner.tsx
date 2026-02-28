"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAttempts } from "@/lib/api/attempts";
import { listTestSets } from "@/lib/api/test-sets";
import { createAttempt } from "@/lib/api/attempts";
import { useTranslations } from "next-intl";

const DISMISS_KEY = "placement-banner-dismissed";

export function PlacementBanner() {
  const t = useTranslations();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [firstFreeId, setFirstFreeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Only show if user has zero completed attempts
    Promise.all([
      listAttempts({ page_size: 1 }),
      listTestSets({ type: "listening", page_size: 10 }),
    ])
      .then(([attemptsRes, testsRes]) => {
        const hasCompleted = attemptsRes.items.some(
          (a) => a.status === "completed",
        );
        if (!hasCompleted) {
          const sorted = [...testsRes.items].sort((a, b) => a.order - b.order);
          const free = sorted.find((t) => t.is_free);
          if (free) {
            setFirstFreeId(free.id);
            setShow(true);
          }
        }
      })
      .catch((err) => {
        console.error("PlacementBanner: failed to load data", err);
      });
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  if (!show || !firstFreeId) return null;

  async function handleStart() {
    if (!firstFreeId) return;
    setLoading(true);
    try {
      const res = await createAttempt({
        test_set_id: firstFreeId,
        mode: "practice",
      });
      router.push(`/practice/${res.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 text-center">
      <button
        onClick={handleDismiss}
        aria-label={t('common.actions.close')}
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Zap className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-3 text-lg font-bold">
        {t('placementBanner.title')}
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {t('placementBanner.description')}
      </p>
      <Button
        className="mt-4"
        onClick={handleStart}
        disabled={loading}
      >
        {loading ? t('placementBanner.preparing') : t('placementBanner.startTest')}
      </Button>
    </div>
  );
}
