"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAttempts } from "@/lib/api/attempts";
import { getInProgressDrills, abandonSpeedDrill, type InProgressAttempt } from "@/lib/api/speed-drill";
import { useTranslations } from "next-intl";
import { localizeTestName } from "@/lib/test-name";
import type { AttemptResponse } from "@/lib/api/types";

type ContinueItem =
  | { kind: "attempt"; data: AttemptResponse }
  | { kind: "drill"; data: InProgressAttempt };

export function ContinueBanner() {
  const t = useTranslations();
  const [item, setItem] = useState<ContinueItem | null>(null);

  useEffect(() => {
    // Fetch both sources in parallel, show whichever is most recent
    Promise.all([
      listAttempts({ page_size: 5 }).then((res) =>
        res.items
          .filter((a) => a.status === "in_progress")
          .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()),
      ).catch(() => [] as AttemptResponse[]),
      getInProgressDrills().catch(() => [] as InProgressAttempt[]),
    ]).then(([attempts, drills]) => {
      const latestAttempt = attempts[0];
      const latestDrill = drills[0];

      if (latestAttempt && latestDrill) {
        // Compare started_at to pick the most recent
        const aTime = new Date(latestAttempt.started_at).getTime();
        const dTime = new Date(latestDrill.started_at).getTime();
        setItem(dTime > aTime ? { kind: "drill", data: latestDrill } : { kind: "attempt", data: latestAttempt });
      } else if (latestAttempt) {
        setItem({ kind: "attempt", data: latestAttempt });
      } else if (latestDrill) {
        setItem({ kind: "drill", data: latestDrill });
      }
    });
  }, []);

  if (!item) return null;

  if (item.kind === "attempt") {
    const attempt = item.data;
    const path = attempt.mode === "exam" ? "exam" : "practice";
    const modeLabel = t(`common.modes.${attempt.mode}`);

    return (
      <div className="mb-4 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium opacity-90">{t("continueBanner.title")}</p>
            <p className="mt-0.5 truncate text-base font-semibold">
              {attempt.test_set_type ? localizeTestName(t, attempt.test_set_type, attempt.test_set_name || "") : (attempt.test_set_name || t("continueBanner.name"))}
              <span className="ml-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                {modeLabel}
              </span>
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              {t("continueBanner.progress", { answered: attempt.answered_count, total: attempt.total })}
            </p>
          </div>
          <Button asChild size="sm" variant="secondary" className="shrink-0 font-semibold">
            <Link href={`/${path}/${attempt.id}`}>
              <Play className="me-1.5 h-4 w-4" />
              {t("continueBanner.continue")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Speed drill
  const drill = item.data;
  const pct = drill.total > 0 ? Math.round((drill.answered_count / drill.total) * 100) : 0;

  return (
    <div className="mb-4 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium opacity-90">{t("speedDrill.inProgress")}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium opacity-80">
              {drill.answered_count}/{drill.total}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
          onClick={() => {
            abandonSpeedDrill(drill.attempt_id).then(() => setItem(null)).catch(() => {});
          }}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button asChild size="sm" variant="secondary" className="shrink-0 font-semibold">
          <Link href={`/practice/${drill.attempt_id}`}>
            <Play className="me-1.5 h-4 w-4" />
            {t("continueBanner.continue")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
