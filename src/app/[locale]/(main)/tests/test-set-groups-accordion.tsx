"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import { listTestSets, fetchTestSetsProgress } from "@/lib/api/test-sets";
import type { TestSetItem } from "@/lib/api/types";
import { TestCard, type TestAttemptInfo } from "./test-card";

interface Props {
  type: "listening" | "reading";
  /** If true and the user hasn't explicitly chosen, default the outer accordion open. */
  autoOpen?: boolean;
  /** Per-test-set attempt info built by the parent (test-list). Drives the
   *  completion bar inside each TestCard. */
  attemptMap?: Map<string, TestAttemptInfo>;
  /** Unique answered counts per test set from speed-drill, for the "drill only"
   *  in-progress state. */
  answeredMap?: Record<string, number>;
}

type Group = "classic" | "extended";

export function TestSetGroupsAccordion({
  type,
  autoOpen = false,
  attemptMap,
  answeredMap,
}: Props) {
  const t = useTranslations();
  // Default open/closed state is driven entirely by autoOpen. No
  // localStorage persistence: returning users always land with the
  // outer open + classic expanded; new users always land collapsed.
  // A session-level toggle still works via React state but does not
  // survive a reload — the rule is stable.
  const [outerOpen, setOuterOpen] = useState<boolean>(autoOpen);
  const [openGroup, setOpenGroup] = useState<Group | null>(
    autoOpen ? "classic" : null,
  );
  // Re-apply the rule when the tab changes or autoOpen flips after mount
  // (attemptMap loads asynchronously — returning users take a render to
  // become "returning").
  useEffect(() => {
    setOuterOpen(autoOpen);
    setOpenGroup(autoOpen ? "classic" : null);
  }, [autoOpen, type]);
  const [classicSets, setClassicSets] = useState<TestSetItem[] | null>(null);
  const [extendedSets, setExtendedSets] = useState<TestSetItem[] | null>(null);
  const [progressMap, setProgressMap] = useState<
    Record<string, { total: number; dup: number }>
  >({});
  const [counts, setCounts] = useState<{ classic: number; extended: number }>({
    classic: 0,
    extended: 0,
  });

  // When the tab switches (type change), blow away any cached data for the
  // previous type so the next fetch sees fresh state. Otherwise a user who
  // browsed reading's classic sets and then flips to listening would see the
  // reading cards leak through (loadGroup early-returns when classicSets !== null).
  useEffect(() => {
    setClassicSets(null);
    setExtendedSets(null);
    setProgressMap({});
    setCounts({ classic: 0, extended: 0 });
  }, [type]);

  // Fetch counts on mount / type change (fast, one page each)
  useEffect(() => {
    Promise.all([
      listTestSets({ type, group: "classic", page: 1, page_size: 1 }),
      listTestSets({ type, group: "extended", page: 1, page_size: 1 }),
    ])
      .then(([classic, extended]) => {
        setCounts({
          classic: classic.total || 0,
          extended: extended.total || 0,
        });
      })
      .catch(() => {});
  }, [type]);

  // Fetch dup-ratio map on first expand (once per type)
  useEffect(() => {
    if (!outerOpen) return;
    if (Object.keys(progressMap).length > 0) return;
    fetchTestSetsProgress({ type })
      .then(setProgressMap)
      .catch(() => {});
  }, [outerOpen, type, progressMap]);

  const loadGroup = (group: Group) => {
    if (group === "classic" && classicSets !== null) return;
    if (group === "extended" && extendedSets !== null) return;
    listTestSets({ type, group, page: 1, page_size: 200 })
      .then((res) => {
        if (group === "classic") setClassicSets(res.items || []);
        else setExtendedSets(res.items || []);
      })
      .catch(() => {});
  };

  // Auto-load sets for whatever group is currently open — needed so that
  // a returning user landing with openGroup="classic" sees the grid populated
  // without having to toggle manually.
  useEffect(() => {
    if (!outerOpen || !openGroup) return;
    loadGroup(openGroup);
    // loadGroup is stable and reads current refs; linting for exhaustive deps
    // would force unnecessary re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outerOpen, openGroup, type]);

  const toggleGroup = (group: Group) => {
    if (openGroup === group) {
      setOpenGroup(null);
    } else {
      setOpenGroup(group);
      loadGroup(group);
    }
  };

  const totalCount = counts.classic + counts.extended;

  // Build TestAttemptInfo for a given test set from the raw maps passed down
  // from test-list. Matches the old getMergedAttemptInfo logic so TestCard
  // lights up the right progress bar state (completed / in-progress / drill-only).
  const getAttemptInfo = (test: TestSetItem): TestAttemptInfo | undefined => {
    const info = attemptMap?.get(test.id);
    const answered = answeredMap?.[test.id];
    if (!info && !answered) return undefined;
    if (info) {
      return { ...info, drillAnswered: answered };
    }
    return {
      bestScore: null,
      bestTotal: test.question_count,
      hasInProgress: false,
      attemptCount: 0,
      drillAnswered: answered,
    };
  };

  return (
    <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden">
      {/* Outer level — secondary visual */}
      <button
        onClick={() => setOuterOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {outerOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>{t("tests.browseTestSets")}</span>
          <span className="text-xs">({totalCount})</span>
        </div>
      </button>

      {outerOpen && (
        <div className="border-t border-border/40 bg-background/40 p-3 space-y-2">
          {/* Inner accordion — classic + extended */}
          <GroupRow
            label={t("tests.classicSets")}
            count={counts.classic}
            open={openGroup === "classic"}
            onToggle={() => toggleGroup("classic")}
            items={classicSets}
            progressMap={progressMap}
            getAttemptInfo={getAttemptInfo}
          />
          <GroupRow
            label={t("tests.extendedSets")}
            count={counts.extended}
            open={openGroup === "extended"}
            onToggle={() => toggleGroup("extended")}
            items={extendedSets}
            progressMap={progressMap}
            getAttemptInfo={getAttemptInfo}
          />
        </div>
      )}
    </div>
  );
}

function GroupRow({
  label,
  count,
  open,
  onToggle,
  items,
  progressMap,
  getAttemptInfo,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  items: TestSetItem[] | null;
  progressMap: Record<string, { total: number; dup: number }>;
  getAttemptInfo: (ts: TestSetItem) => TestAttemptInfo | undefined;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">({count})</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-border/50 p-3">
          {items === null ? (
            <div className="text-xs text-muted-foreground">...</div>
          ) : items.length === 0 ? (
            <div className="text-xs text-muted-foreground">—</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((ts) => {
                const progress = progressMap[ts.id];
                const total = progress?.total ?? ts.question_count;
                const dup = progress?.dup ?? 0;
                const dupPct = total > 0 ? Math.round((dup / total) * 100) : 0;
                return (
                  <TestCard
                    key={ts.id}
                    test={ts}
                    attemptInfo={getAttemptInfo(ts)}
                    dupPct={dupPct}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
