"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAttempts } from "@/lib/api/attempts";
import { listTestSets } from "@/lib/api/test-sets";
import { fetchAllPages } from "@/lib/api/fetch-all-pages";
import { useTranslations } from "next-intl";
import type { TestSetItem } from "@/lib/api/types";

interface RecommendedBannerProps {
  type: "listening" | "reading" | "speaking" | "writing";
}

export function RecommendedBanner({ type }: RecommendedBannerProps) {
  const t = useTranslations();
  const [recommended, setRecommended] = useState<TestSetItem | null>(null);

  useEffect(() => {
    // Skip for speaking/writing (no practice flow)
    if (type === "speaking" || type === "writing") {
      setRecommended(null);
      return;
    }

    Promise.all([
      fetchAllPages((p) => listTestSets({ type, ...p }), 100),
      fetchAllPages((p) => listAttempts({ ...p }), 100),
    ])
      .then(([tests, attempts]) => {
        const sorted = [...tests].sort((a, b) => a.order - b.order);
        // Find test sets that have a completed attempt
        const completedTestIds = new Set(
          attempts
            .filter((a) => a.status === "completed")
            .map((a) => a.test_set_id),
        );
        // First test set without a completed attempt
        const next = sorted.find((t) => !completedTestIds.has(t.id));
        setRecommended(next ?? null);
      })
      .catch((err) => {
        console.error("RecommendedBanner: failed to load data", err);
      });
  }, [type]);

  if (!recommended) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">
            {t('recommendedBanner.title')}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {recommended.name}
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href={`/tests/${recommended.id}`}>{t('recommendedBanner.start')}</Link>
      </Button>
    </div>
  );
}
