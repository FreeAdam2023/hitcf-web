"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Layers, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { listTestSets } from "@/lib/api/test-sets";
import { startSmartPractice } from "@/lib/api/smart-practice";
import type { TestSetItem } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";
import { TestCard, type TestAttemptInfo } from "./test-card";
import { LevelPracticeDialog } from "./level-practice-dialog";

interface Props {
  type: "listening" | "reading";
  attemptMap?: Map<string, TestAttemptInfo>;
  answeredMap?: Record<string, number>;
}

const INITIAL_SHOW = 12; // 4 rows × 3 columns, no orphan

type StatusFilter = "all" | "inProgress" | "completed" | "notStarted";

export function HitcfSetGrid({ type, attemptMap, answeredMap }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [sets, setSets] = useState<TestSetItem[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleStartReview = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setReviewLoading(true);
    try {
      const res = await startSmartPractice({ type, size: 39, review: true });
      router.push(`/practice/${res.attempt_id}`);
    } catch {
      toast.error(t("tests.noReviewQuestions"));
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    setSets(null);
    setFilter("all");
    setExpanded(false);
    listTestSets({ type, group: "hitcf", page: 1, page_size: 200 })
      .then((res) => setSets(res.items || []))
      .catch(() => setSets([]));
  }, [type]);

  if (sets === null) return null;
  if (sets.length === 0) return null;

  const getAttemptInfo = (test: TestSetItem): TestAttemptInfo | undefined => {
    const info = attemptMap?.get(test.id);
    const answered = answeredMap?.[test.id];
    if (!info && !answered) return undefined;
    if (info) return { ...info, drillAnswered: answered };
    return {
      bestScore: null,
      bestTotal: test.question_count,
      hasInProgress: false,
      attemptCount: 0,
      drillAnswered: answered,
    };
  };

  const getStatus = (ts: TestSetItem): "completed" | "inProgress" | "notStarted" => {
    const info = attemptMap?.get(ts.id);
    if (info?.bestScore != null) return "completed";
    if (info?.hasInProgress) return "inProgress";
    if (answeredMap?.[ts.id]) return "inProgress";
    return "notStarted";
  };

  // Counts
  const counts = useMemo(() => {
    if (!sets) return { all: 0, inProgress: 0, completed: 0, notStarted: 0 };
    let inProgress = 0, completed = 0, notStarted = 0;
    for (const s of sets) {
      const st = getStatus(s);
      if (st === "completed") completed++;
      else if (st === "inProgress") inProgress++;
      else notStarted++;
    }
    return { all: sets.length, inProgress, completed, notStarted };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sets, attemptMap, answeredMap]);

  // Filtered sets
  const filtered = filter === "all" ? sets : sets.filter((s) => getStatus(s) === filter);
  const visible = expanded || filter !== "all" ? filtered : filtered.slice(0, INITIAL_SHOW);
  const hiddenCount = filtered.length - visible.length;

  const pills: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: t("tests.filterAll"), count: counts.all },
    { key: "inProgress", label: t("common.status.inProgress"), count: counts.inProgress },
    { key: "completed", label: t("common.status.completed"), count: counts.completed },
    { key: "notStarted", label: t("common.status.notStarted"), count: counts.notStarted },
  ];

  return (
    <div className="mb-5">
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-semibold">HiTCF {t("tests.brandedSets")}</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {t("tests.completedOf", { done: counts.completed, total: counts.all })}
        </span>
      </div>

      {/* Filter pills + level practice button */}
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {pills.map((p) => (
            <button
              key={p.key}
              onClick={() => { setFilter(p.key); setExpanded(false); }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === p.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}({p.count})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLevelDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-500/10 dark:text-violet-300 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            {t("speedDrill.title")}
          </button>
          <button
            onClick={handleStartReview}
            disabled={reviewLoading}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-500/10 dark:text-amber-300 transition-colors disabled:opacity-50"
          >
            {reviewLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            {t("tests.randomReview")}
          </button>
        </div>
      </div>

      {/* Grid of TestCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((ts) => (
          <TestCard
            key={ts.id}
            test={ts}
            attemptInfo={getAttemptInfo(ts)}
          />
        ))}
      </div>

      {/* Empty state for filtered view */}
      {visible.length === 0 && filter !== "all" && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {t("tests.emptyTitle")}
        </div>
      )}

      {/* Show more / less */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="mx-auto mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
          {t("tests.showMore", { count: hiddenCount })}
        </button>
      )}
      {expanded && filtered.length > INITIAL_SHOW && (
        <button
          onClick={() => { setExpanded(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="mx-auto mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
          {t("tests.showLess")}
        </button>
      )}

      <LevelPracticeDialog
        open={levelDialogOpen}
        onOpenChange={setLevelDialogOpen}
        type={type}
      />
    </div>
  );
}
