"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { listTestSets } from "@/lib/api/test-sets";
import type { TestSetItem } from "@/lib/api/types";
import { TestCard, type TestAttemptInfo } from "./test-card";

interface Props {
  type: "listening" | "reading";
  attemptMap?: Map<string, TestAttemptInfo>;
  answeredMap?: Record<string, number>;
}

const INITIAL_SHOW = 10;

export function HitcfSetGrid({ type, attemptMap, answeredMap }: Props) {
  const t = useTranslations();
  const [sets, setSets] = useState<TestSetItem[] | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setSets(null);
    listTestSets({ type, group: "hitcf", page: 1, page_size: 200 })
      .then((res) => setSets(res.items || []))
      .catch(() => setSets([]));
  }, [type]);

  if (sets === null) return null; // loading
  if (sets.length === 0) return null; // no HiTCF sets for this type

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

  // Stats
  const completed = sets.filter((s) => {
    const info = attemptMap?.get(s.id);
    return info?.bestScore != null;
  }).length;

  const visible = expanded ? sets : sets.slice(0, INITIAL_SHOW);
  const hiddenCount = sets.length - visible.length;

  return (
    <div className="mb-5">
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-semibold">HiTCF {t("tests.brandedSets")}</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {t("tests.completedOf", { done: completed, total: sets.length })}
        </span>
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
      {expanded && sets.length > INITIAL_SHOW && (
        <button
          onClick={() => { setExpanded(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="mx-auto mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
          {t("tests.showLess")}
        </button>
      )}
    </div>
  );
}
