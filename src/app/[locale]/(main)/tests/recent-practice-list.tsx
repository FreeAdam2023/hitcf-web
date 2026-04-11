"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Layers,
  BookOpen,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAttempts, createAttempt } from "@/lib/api/attempts";
import { startSpeedDrill } from "@/lib/api/speed-drill";
import { startSmartPractice } from "@/lib/api/smart-practice";
import type { AttemptResponse } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  type: "listening" | "reading";
  /** How many items to show initially. */
  pageSize?: number;
}

export function RecentPracticeList({ type, pageSize = 10 }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<AttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [redoing, setRedoing] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listAttempts({ type, page: 1, page_size: pageSize })
      .then((res) => {
        setItems(res.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type, pageSize, isAuthenticated]);

  const handleResume = (a: AttemptResponse) => {
    if (a.status === "completed") {
      router.push(`/results/${a.id}`);
    } else if (a.mode === "exam") {
      router.push(`/exam/${a.id}`);
    } else {
      router.push(`/practice/${a.id}`);
    }
  };

  const handleRedo = async (a: AttemptResponse) => {
    setRedoing(a.id);
    try {
      if (a.mode === "smart") {
        // Generate a fresh smart practice with same parameters
        const res = await startSmartPractice({ type, size: a.total });
        router.push(`/practice/${res.attempt_id}`);
      } else if (a.mode === "speed_drill") {
        // Start a new speed drill (without specific levels, using saved drill_type)
        const res = await startSpeedDrill({ type, count: a.total });
        if (res.attempt_id) router.push(`/practice/${res.attempt_id}`);
      } else {
        // Classic test set — create new attempt
        const mode: "practice" | "exam" = a.mode === "exam" ? "exam" : "practice";
        const res = await createAttempt({
          test_set_id: a.test_set_id,
          mode,
        }, { forceNew: true });
        router.push(`/${mode}/${res.id}`);
      }
    } catch {
      setRedoing(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="mb-4 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {t("tests.recentPractice")}
        </h3>
        <div className="rounded-xl border border-border/50 bg-card p-4 text-sm text-muted-foreground">
          {t("common.actions.loading")}
        </div>
      </div>
    );
  }

  // First-time user: onboarding nudge instead of an empty "no history" state.
  if (items.length === 0) {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
          <span className="text-foreground/80">
            {t("tests.firstTimeNudge")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {t("tests.recentPractice")}
      </h3>
      <div className="space-y-1.5">
        {items.map((a) => (
          <PracticeRow
            key={a.id}
            attempt={a}
            onResume={() => handleResume(a)}
            onRedo={() => handleRedo(a)}
            redoing={redoing === a.id}
          />
        ))}
      </div>
    </div>
  );
}

function PracticeRow({
  attempt,
  onResume,
  onRedo,
  redoing,
}: {
  attempt: AttemptResponse;
  onResume: () => void;
  onRedo: () => void;
  redoing: boolean;
}) {
  const t = useTranslations();
  const isCompleted = attempt.status === "completed";
  const isInProgress = attempt.status === "in_progress";
  const pct =
    isCompleted && attempt.score != null && attempt.total > 0
      ? Math.round((attempt.score / attempt.total) * 100)
      : null;

  // Choose icon + label
  let Icon = BookOpen;
  let labelTag = "";
  if (attempt.mode === "smart") {
    Icon = Sparkles;
    labelTag = t("common.modes.smart");
  } else if (attempt.mode === "speed_drill") {
    Icon = Layers;
    labelTag = t("common.modes.speed_drill");
  } else if (attempt.test_set_type === "listening") {
    Icon = Headphones;
  }

  // Date formatting: MM-DD HH:mm
  const date = attempt.completed_at || attempt.started_at;
  const dateStr = date
    ? new Date(date).toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card px-3 py-2.5 transition-all hover:border-border hover:shadow-sm">
      <div className="shrink-0 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">
            {attempt.test_set_name || "—"}
          </span>
          {labelTag && attempt.mode !== "practice" && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {labelTag}
            </Badge>
          )}
          {attempt.test_set_group === "extended" && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              {t("tests.extendedSets")}
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{dateStr}</span>
          <span>·</span>
          <span>
            {attempt.total} {t("common.unit.questions")}
          </span>
          {isCompleted && pct != null && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                {pct}%
              </span>
            </>
          )}
          {isInProgress && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5 text-amber-600">
                <Clock className="h-3 w-3" />
                {t("common.status.inProgress")}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onResume}
          className="h-8 px-2 text-xs"
        >
          <PlayCircle className="mr-1 h-3.5 w-3.5" />
          {isCompleted ? t("tests.view") : t("tests.resume")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={redoing}
          className="h-8 px-2 text-xs"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          {t("tests.redo")}
        </Button>
      </div>
    </div>
  );
}
