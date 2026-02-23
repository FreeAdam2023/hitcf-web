"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAttempts } from "@/lib/api/attempts";
import { MODE_LABELS } from "@/lib/constants";
import type { AttemptResponse } from "@/lib/api/types";

export function ContinueBanner() {
  const [attempt, setAttempt] = useState<AttemptResponse | null>(null);

  useEffect(() => {
    listAttempts({ page_size: 5 })
      .then((res) => {
        const inProgress = res.items
          .filter((a) => a.status === "in_progress")
          .sort(
            (a, b) =>
              new Date(b.started_at).getTime() -
              new Date(a.started_at).getTime(),
          );
        if (inProgress.length > 0) {
          setAttempt(inProgress[0]);
        }
      })
      .catch((err) => {
        console.error("ContinueBanner: failed to load attempts", err);
      });
  }, []);

  if (!attempt) return null;

  const path = attempt.mode === "exam" ? "exam" : "practice";
  const modeLabel = MODE_LABELS[attempt.mode] || attempt.mode;

  return (
    <div className="mb-4 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium opacity-90">你有一套未完成的练习</p>
          <p className="mt-0.5 truncate text-base font-semibold">
            {attempt.test_set_name || "练习"}
            <span className="ml-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              {modeLabel}
            </span>
          </p>
          <p className="mt-0.5 text-xs opacity-80">
            进度: {attempt.answered_count} / {attempt.total} 题
          </p>
        </div>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="shrink-0 font-semibold"
        >
          <Link href={`/${path}/${attempt.id}`}>
            <Play className="mr-1.5 h-4 w-4" />
            继续答题
          </Link>
        </Button>
      </div>
    </div>
  );
}
