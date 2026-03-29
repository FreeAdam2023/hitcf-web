"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { ChevronDown, ChevronUp, Shuffle, Loader2, Layers, Headphones, BookOpen, Lock, Sparkles, Mic, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listTestSets, listWritingTopics } from "@/lib/api/test-sets";
import { listAttempts, createMockExam, checkMockFreeTrialEligible, getAnsweredPerTestset } from "@/lib/api/attempts";
import { fetchAllPages } from "@/lib/api/fetch-all-pages";
import { getLatestMonth, isLatestMonth } from "@/lib/utils";
import { STATS_PARAMS } from "@/lib/constants";
import type { TestSetItem, WritingTopicItem, AttemptResponse } from "@/lib/api/types";
import type { TestAttemptInfo } from "./test-card";
import { SkeletonGrid } from "@/components/shared/skeleton-card";
import { EmptyState } from "@/components/shared/empty-state";
import { TestCard } from "./test-card";
import { SpeakingTopicCard } from "./speaking-topic-card";
import { WritingLevelCard } from "./writing-level-card";
import { SpeakingTache1Guide } from "./speaking-tache1-guide";
import { ContinueBanner } from "@/components/shared/continue-banner";
import { RecommendedBanner } from "@/components/shared/recommended-banner";
import { useAuthStore } from "@/stores/auth-store";

import { LevelPracticeDialog } from "./level-practice-dialog";

type TabType = "listening" | "reading" | "speaking" | "writing";

/** Group items by source_date, returning sections sorted newest-first.
 *  `label` is the raw "YYYY-MM" key; actual display formatting happens at render time. */
function groupByMonth<T extends { source_date: string | null }>(
  items: T[],
  originalLabel: string,
): { month: string; label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  const noDate: T[] = [];

  for (const item of items) {
    if (item.source_date) {
      const existing = groups.get(item.source_date);
      if (existing) existing.push(item);
      else groups.set(item.source_date, [item]);
    } else {
      noDate.push(item);
    }
  }

  const sections = Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month]) => ({
      month,
      label: month, // raw key — formatted via t() at render
      items: groups.get(month)!,
    }));

  if (noDate.length > 0) {
    sections.push({ month: "original", label: originalLabel, items: noDate });
  }

  return sections;
}

/** Extract unique years from source_date values, sorted descending */
function extractYears(items: { source_date: string | null }[]): string[] {
  const years = new Set<string>();
  for (const item of items) {
    if (item.source_date) years.add(item.source_date.slice(0, 4));
  }
  return Array.from(years).sort((a, b) => b.localeCompare(a));
}

// ─── Pill button ───────────────────────────────────────────────
function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-foreground text-background shadow-sm"
          : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function MockExamPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-primary to-violet-500 text-white shadow-md"
          : "bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/20"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Month section header ──────────────────────────────────────
function MonthHeader({ label, countLabel, collapsible, open, onToggle, locked, isFreeMonth }: {
  label: string;
  countLabel: string;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
  locked?: boolean;
  isFreeMonth?: boolean;
}) {
  const t = useTranslations();
  const Wrapper = collapsible ? "button" : "div";
  return (
    <Wrapper
      className="flex w-full items-center gap-3 pb-3 pt-1"
      {...(collapsible ? { onClick: onToggle, type: "button" as const } : {})}
    >
      <div className={`h-1.5 w-1.5 rounded-full ${isFreeMonth ? "bg-emerald-500" : "bg-primary"}`} />
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {countLabel}
      </span>
      {isFreeMonth && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          <Sparkles className="h-3 w-3" />
          {t("tests.freeThisMonth")}
        </span>
      )}
      {locked && (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Lock className="h-3 w-3" />
          PRO
        </span>
      )}
      <div className="flex-1 border-t border-border/50" />
      {collapsible && (
        open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </Wrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
const VALID_TABS: TabType[] = ["listening", "reading", "speaking", "writing"];

function buildAttemptMap(attempts: AttemptResponse[]): Map<string, TestAttemptInfo> {
  const map = new Map<string, TestAttemptInfo>();
  for (const a of attempts) {
    // Skip speed_drill attempts — they cross test sets and shouldn't affect per-set status
    if (a.mode === "speed_drill") continue;
    const isTrackable = a.mode === "practice" || a.mode === "exam";
    const existing = map.get(a.test_set_id);
    if (!existing) {
      map.set(a.test_set_id, {
        bestScore: isTrackable && a.status === "completed" ? a.score : null,
        bestTotal: a.total,
        hasInProgress: isTrackable && a.status === "in_progress",
        inProgressAnswered: isTrackable && a.status === "in_progress" ? a.answered_count : undefined,
        inProgressTotal: isTrackable && a.status === "in_progress" ? a.total : undefined,
        attemptCount: 1,
      });
    } else {
      existing.attemptCount++;
      if (isTrackable && a.status === "completed" && a.score !== null) {
        if (existing.bestScore === null || a.score > existing.bestScore) {
          existing.bestScore = a.score;
          existing.bestTotal = a.total;
        }
      }
      if (isTrackable && a.status === "in_progress") {
        existing.hasInProgress = true;
        existing.inProgressAnswered = a.answered_count;
        existing.inProgressTotal = a.total;
      }
    }
  }
  return map;
}

export function TestList() {
  const t = useTranslations();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const canAccessPaid = useAuthStore((s) => {
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const [mockLoading, setMockLoading] = useState(false);
  const [mockDialogOpen, setMockDialogOpen] = useState(false);
  const [mockTypes, setMockTypes] = useState<Set<string>>(new Set(["listening", "reading"]));
  const [mockError, setMockError] = useState<string | null>(null);
  const [mockFreeTrialEligible, setMockFreeTrialEligible] = useState(false);
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [hasContinueBanner, setHasContinueBanner] = useState(false);
  const [tab, setTab] = useState<TabType | null>(null);

  // Hydration-safe: restore tab from URL param or localStorage after mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get("tab");
    if (urlTab && VALID_TABS.includes(urlTab as TabType)) {
      setTab(urlTab as TabType);
      return;
    }
    const stored = localStorage.getItem("hitcf_tests_tab");
    if (stored && VALID_TABS.includes(stored as TabType)) {
      setTab(stored as TabType);
    } else {
      setTab("listening");
    }
  }, []);
  const [expanded, setExpanded] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [attemptMap, setAttemptMap] = useState<Map<string, TestAttemptInfo>>(new Map());
  const [answeredMap, setAnsweredMap] = useState<Record<string, number>>({});

  // Helper: format "YYYY-MM" into localized month header
  const formatMonthLabel = useCallback(
    (rawMonth: string) => {
      if (rawMonth === "original") return t("tests.originalSets");
      const [year, monthStr] = rawMonth.split("-");
      const monthIdx = parseInt(monthStr, 10) - 1;
      const months = [
        t("tests.months.0"), t("tests.months.1"), t("tests.months.2"),
        t("tests.months.3"), t("tests.months.4"), t("tests.months.5"),
        t("tests.months.6"), t("tests.months.7"), t("tests.months.8"),
        t("tests.months.9"), t("tests.months.10"), t("tests.months.11"),
      ];
      const monthName = months[monthIdx] || monthStr;
      return t("tests.yearMonth", { year, month: monthName });
    },
    [t],
  );

  // Fetch all user attempts once to build progress map
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAllPages((p) => listAttempts({ ...p }), 100)
      .then((items) => setAttemptMap(buildAttemptMap(items)))
      .catch(() => {});
    getAnsweredPerTestset()
      .then((data) => setAnsweredMap(data))
      .catch(() => {});
    // Check mock exam free trial eligibility
    if (!canAccessPaid) {
      checkMockFreeTrialEligible().then((r) => setMockFreeTrialEligible(r.eligible)).catch(() => {});
    }
  }, [isAuthenticated, canAccessPaid]);

  // Persist tab to localStorage whenever it changes
  useEffect(() => {
    if (tab) localStorage.setItem("hitcf_tests_tab", tab);
  }, [tab]);


  const [tests, setTests] = useState<TestSetItem[]>([]);
  const [writingTopics, setWritingTopics] = useState<WritingTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const search = "";

  // Exam type filter
  type ExamTypeFilter = "all" | "tcf_canada" | "tcf_tp" | "tcf_irn" | "tcf_quebec";
  const [examTypeFilter] = useState<ExamTypeFilter>("tcf_canada");

  // Speaking/Writing specific state (0 = mock exam)
  const [speakingTache, setSpeakingTache] = useState<0 | 1 | 2 | 3>(1);
  const [writingTache, setWritingTache] = useState<0 | 1 | 2 | 3>(3);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Status filter for listening/reading tabs
  type StatusFilter = "all" | "inProgress" | "completed" | "notStarted";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Reset filters on tab change
  useEffect(() => {
    setSelectedYear(null);
    setStatusFilter("all");
  }, [tab]);

  // ─── Data fetching ────────────────────────────────────────
  const fetchTestSets = useCallback(async () => {
    if (!tab) return; // Wait for tab to be restored from localStorage
    setLoading(true);
    const etParam = examTypeFilter === "all" ? undefined : examTypeFilter;
    try {
      if (tab === "speaking" && speakingTache === 0) {
        // Mock exam — no data fetch needed
        setTests([]);
      } else if (tab === "writing" && writingTache === 0) {
        setTests([]);
      } else if (tab === "speaking" && speakingTache === 1) {
        setTests([]);
      } else if (tab === "speaking") {
        const items = await fetchAllPages(
          (p) => listTestSets({ type: "speaking", exam_type: etParam, task_number: speakingTache, ...p }), 500,
        );
        setTests(items);
      } else if (tab === "writing") {
        const items = await fetchAllPages(
          (p) => listWritingTopics({ task_number: writingTache, ...p }), 500,
        );
        setWritingTopics(items);
        setTests([]);
      } else {
        const items = await fetchAllPages(
          (p) => listTestSets({ type: tab, exam_type: etParam, ...p }), 100,
        );
        setTests(items);
      }
    } catch (err) {
      console.error("Failed to load", err);
      setTests([]);
      setWritingTopics([]);
    } finally {
      setLoading(false);
    }
  }, [tab, speakingTache, writingTache, examTypeFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTestSets();
    return () => controller.abort();
  }, [fetchTestSets]);

  // ─── Derived: available years ─────────────────────────────
  const availableYears = useMemo(() => {
    if (tab === "writing" && writingTache > 0) {
      return extractYears(writingTopics);
    }
    return extractYears(tests);
  }, [tab, writingTache, tests, writingTopics]);

  // Build merged attempt info: combine attemptMap (practice/exam) with answeredMap (all modes incl. speed drill)
  const getMergedAttemptInfo = useCallback(
    (test: TestSetItem): TestAttemptInfo | undefined => {
      const info = attemptMap.get(test.id);
      const answered = answeredMap[test.id];
      if (!info && !answered) return undefined;
      if (info) {
        // Supplement with drill answered count if higher
        return { ...info, drillAnswered: answered };
      }
      // No formal attempt but has answered questions (from speed drill)
      return {
        bestScore: null,
        bestTotal: test.question_count,
        hasInProgress: false,
        attemptCount: 0,
        drillAnswered: answered,
      };
    },
    [attemptMap, answeredMap],
  );

  // ─── Status helpers for listening/reading ────────────────
  const getTestStatus = useCallback(
    (testId: string): "completed" | "inProgress" | "notStarted" => {
      const info = attemptMap.get(testId);
      if (!info) {
        // Check if answered via speed drill
        if (answeredMap[testId]) return "inProgress";
        return "notStarted";
      }
      if (info.bestScore !== null && info.bestScore !== undefined) return "completed";
      if (info.hasInProgress) return "inProgress";
      if (answeredMap[testId]) return "inProgress";
      return "notStarted";
    },
    [attemptMap, answeredMap],
  );

  // ─── Status counts for filter chips ─────────────────────
  const statusCounts = useMemo(() => {
    if (tab !== "listening" && tab !== "reading") return null;
    const searchLower = search.toLowerCase();
    const searchFiltered = tests.filter((t) => {
      if (search && !t.name.toLowerCase().includes(searchLower) && !t.code.toLowerCase().includes(searchLower)) {
        return false;
      }
      return true;
    });
    let all = 0, inProgress = 0, completed = 0, notStarted = 0;
    for (const t of searchFiltered) {
      all++;
      const s = getTestStatus(t.id);
      if (s === "completed") completed++;
      else if (s === "inProgress") inProgress++;
      else notStarted++;
    }
    return { all, inProgress, completed, notStarted };
  }, [tests, search, tab, getTestStatus]);

  // ─── Filtered + sorted items (listening/reading + by-set) ─
  const filteredTests = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = tests.filter((t) => {
      if (search && !t.name.toLowerCase().includes(searchLower) && !t.code.toLowerCase().includes(searchLower)) {
        return false;
      }
      if (selectedYear && (tab === "speaking" || tab === "writing")) {
        if (t.source_date && !t.source_date.startsWith(selectedYear)) return false;
        if (!t.source_date && selectedYear !== "original") return false;
      }
      // Status filter for listening/reading
      if ((tab === "listening" || tab === "reading") && statusFilter !== "all") {
        const status = getTestStatus(t.id);
        if (status !== statusFilter) return false;
      }
      return true;
    });

    if (tab === "listening" || tab === "reading") {
      return filtered.sort((a, b) => a.order - b.order);
    }

    return filtered;
  }, [tests, search, tab, selectedYear, statusFilter, getTestStatus]);

  // ─── Filtered writing topics (by-level mode) ───────────────
  const filteredWritingTopics = useMemo(() => {
    const searchLower = search.toLowerCase();
    return writingTopics.filter((t) => {
      if (search && !t.question_text?.toLowerCase().includes(searchLower) && !t.test_set_name?.toLowerCase().includes(searchLower)) {
        return false;
      }
      if (selectedYear) {
        if (t.source_date && !t.source_date.startsWith(selectedYear)) return false;
        if (!t.source_date && selectedYear !== "original") return false;
      }
      return true;
    });
  }, [writingTopics, search, selectedYear]);

  // ─── Grouped sections ────────────────────────────────────
  const originalLabel = t("tests.originalSets");
  const testSections = useMemo(
    () => groupByMonth(filteredTests, originalLabel),
    [filteredTests, originalLabel],
  );

  const writingTopicSections = useMemo(
    () => groupByMonth(filteredWritingTopics, originalLabel),
    [filteredWritingTopics, originalLabel],
  );

  // ─── Latest month for freemium gating ─────────────────────
  const latestMonth = useMemo(() => {
    if (tab === "writing" && writingTache > 0) {
      return getLatestMonth(writingTopics);
    }
    if (tab === "speaking" || tab === "writing") {
      return getLatestMonth(tests);
    }
    return null;
  }, [tab, writingTache, tests, writingTopics]);

  // ─── Is speaking/writing tab? ─────────────────────────────
  const isSpeakingWriting = tab === "speaking" || tab === "writing";

  // ─── Render: Listening / Reading (flat grid with upgrade banner) ────
  const INITIAL_SHOW = 6;

  const renderFlatGrid = () => {
    if (loading) return <SkeletonGrid />;
    if (filteredTests.length === 0) return <EmptyState title={t("tests.emptyTitle")} description={t("tests.emptyDescription")} />;

    const isSearching = search.trim().length > 0;
    const showAll = expanded || isSearching || statusFilter !== "all";

    const visible = showAll ? filteredTests : filteredTests.slice(0, INITIAL_SHOW);
    const hiddenCount = filteredTests.length - visible.length;

    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
          {visible.map((t) => (
            <TestCard key={t.id} test={t} attemptInfo={getMergedAttemptInfo(t)} />
          ))}
        </div>
        {hiddenCount > 0 && (
          <ShowMoreButton count={hiddenCount} onClick={() => setExpanded(true)} />
        )}
        {showAll && filteredTests.length > INITIAL_SHOW && (
          <button
            onClick={() => { setExpanded(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="mx-auto mt-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
            {t("tests.showLess")}
          </button>
        )}
      </>
    );
  };

  // ─── Collapsible month helper ─────────────────────────────
  const toggleMonth = useCallback((month: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  }, []);

  const isMonthOpen = useCallback(
    (month: string, index: number) => {
      // If user explicitly toggled, respect that; otherwise auto-expand first 2
      if (expandedMonths.has(month)) return true;
      if (expandedMonths.size === 0 && index < 2) return true;
      return false;
    },
    [expandedMonths],
  );


  // ─── Render: Speaking by-level (month-grouped) ──────────────
  const renderSpeakingByLevel = () => {
    if (loading) return <SkeletonGrid />;
    if (testSections.length === 0) return <EmptyState title={t("tests.emptyTopicTitle")} description={t("tests.emptyTopicDesc")} />;
    return (
      <div className="space-y-4">
        {testSections.map((section, i) => {
          const open = isMonthOpen(section.month, i);
          const isFreeMonth = isLatestMonth(section.month, latestMonth);
          const sectionLocked = !isFreeMonth && !canAccessPaid;
          return (
            <div key={section.month}>
              <MonthHeader
                label={formatMonthLabel(section.month)}
                countLabel={t("tests.setsCount", { count: section.items.length })}
                collapsible
                open={open}
                onToggle={() => toggleMonth(section.month)}
                locked={sectionLocked}
                isFreeMonth={isFreeMonth && !canAccessPaid}
              />
              {open && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
                  {section.items.map((t) => (
                    <SpeakingTopicCard key={t.id} test={t} latestMonth={latestMonth} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render: Writing by-level (month-grouped topics) ────────
  const renderWritingByLevel = () => {
    if (loading) return <SkeletonGrid />;
    if (writingTopicSections.length === 0) return <EmptyState title={t("tests.emptyQuestionTitle")} description={t("tests.emptyQuestionDesc")} />;
    return (
      <div className="space-y-4">
        {writingTopicSections.map((section, i) => {
          const open = isMonthOpen(section.month, i);
          const isFreeMonth = isLatestMonth(section.month, latestMonth);
          const sectionLocked = !isFreeMonth && !canAccessPaid;
          return (
            <div key={section.month}>
              <MonthHeader
                label={formatMonthLabel(section.month)}
                countLabel={t("tests.setsCount", { count: section.items.length })}
                collapsible
                open={open}
                onToggle={() => toggleMonth(section.month)}
                locked={sectionLocked}
                isFreeMonth={isFreeMonth && !canAccessPaid}
              />
              {open && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
                  {section.items.map((t) => (
                    <WritingLevelCard key={t.question_id} topic={t} tache={writingTache} latestMonth={latestMonth} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Main render ──────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("tests.pageTitle")}
          </span>
        </h1>
        <p className="mt-2 text-sm lg:text-base text-muted-foreground">
          {t("tests.pageSubtitle")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-400">
            {t("tests.statsListening", STATS_PARAMS)}
          </span>
          <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
            {t("tests.statsReading", STATS_PARAMS)}
          </span>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            {t("tests.statsSpeaking", STATS_PARAMS)}
          </span>
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-400">
            {t("tests.statsWriting", STATS_PARAMS)}
          </span>
        </div>

      </div>
      <ContinueBanner onVisibleChange={setHasContinueBanner} />
      {!tab ? <div className="flex justify-center py-8"><span className="text-sm text-muted-foreground">Loading...</span></div> : null}
      <Tabs value={tab ?? "listening"} onValueChange={(v) => {
        const t = v as TabType;
        setTab(t);
        setExpanded(false);
        setExpandedMonths(new Set());
        const url = new URL(window.location.href);
        url.searchParams.set("tab", t);
        window.history.replaceState({}, "", url.pathname + url.search);
      }}>
        {/* Mock exam button */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {isAuthenticated && (
            <Dialog open={mockDialogOpen} onOpenChange={(open) => { setMockDialogOpen(open); if (!open) setMockError(null); }}>
              <DialogTrigger asChild>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-all hover:border-primary/40 hover:bg-primary/10"
                >
                  <Shuffle className="h-4 w-4" />
                  {t("tests.mockExam")}
                  {!canAccessPaid && !mockFreeTrialEligible && <Lock className="h-3.5 w-3.5 text-amber-500" />}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("tests.mockExam")}</DialogTitle>
                  <DialogDescription>{t("tests.mockExamDialogDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <Checkbox
                      checked={mockTypes.has("listening")}
                      onCheckedChange={(checked) => {
                        setMockTypes((prev) => {
                          const next = new Set(prev);
                          if (checked) next.add("listening"); else next.delete("listening");
                          return next;
                        });
                      }}
                    />
                    <Headphones className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">{t("common.types.listening")}</div>
                      <div className="text-xs text-muted-foreground">{t("tests.mockListeningInfo")}</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <Checkbox
                      checked={mockTypes.has("reading")}
                      onCheckedChange={(checked) => {
                        setMockTypes((prev) => {
                          const next = new Set(prev);
                          if (checked) next.add("reading"); else next.delete("reading");
                          return next;
                        });
                      }}
                    />
                    <BookOpen className="h-4 w-4 text-emerald-500" />
                    <div>
                      <div className="text-sm font-medium">{t("common.types.reading")}</div>
                      <div className="text-xs text-muted-foreground">{t("tests.mockReadingInfo")}</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <Checkbox
                      checked={mockTypes.has("speaking")}
                      onCheckedChange={(checked) => {
                        setMockTypes((prev) => {
                          const next = new Set(prev);
                          if (checked) next.add("speaking"); else next.delete("speaking");
                          return next;
                        });
                      }}
                    />
                    <Mic className="h-4 w-4 text-amber-500" />
                    <div>
                      <div className="text-sm font-medium">{t("common.types.speaking")}</div>
                      <div className="text-xs text-muted-foreground">{t("tests.mockSpeakingExamDesc")}</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <Checkbox
                      checked={mockTypes.has("writing")}
                      onCheckedChange={(checked) => {
                        setMockTypes((prev) => {
                          const next = new Set(prev);
                          if (checked) next.add("writing"); else next.delete("writing");
                          return next;
                        });
                      }}
                    />
                    <PenLine className="h-4 w-4 text-violet-500" />
                    <div>
                      <div className="text-sm font-medium">{t("common.types.writing")}</div>
                      <div className="text-xs text-muted-foreground">{t("tests.mockWritingExamDesc")}</div>
                    </div>
                  </label>
                </div>
                {mockError && (
                  <p className="text-sm text-destructive">{mockError}</p>
                )}
                <DialogFooter>
                  {canAccessPaid || mockFreeTrialEligible ? (
                    <Button
                      disabled={mockTypes.size === 0 || mockLoading}
                      onClick={async () => {
                        setMockLoading(true);
                        setMockError(null);
                        try {
                          const lrTypes = ["listening", "reading"].filter((t) => mockTypes.has(t));
                          if (lrTypes.length > 0) {
                            const result = await createMockExam(lrTypes);
                            setMockDialogOpen(false);
                            router.push(`/exam/${result.id}`);
                          } else if (mockTypes.has("speaking")) {
                            setMockDialogOpen(false);
                            router.push("/speaking-exam");
                          } else if (mockTypes.has("writing")) {
                            setMockDialogOpen(false);
                            router.push("/writing-mock-exam");
                          }
                        } catch {
                          setMockError(t("tests.mockExamError"));
                        } finally {
                          setMockLoading(false);
                        }
                      }}
                    >
                      {mockLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Shuffle className="mr-2 h-4 w-4" />
                      )}
                      {t("tests.mockExamStart")}
                    </Button>
                  ) : (
                    <Button onClick={() => { setMockDialogOpen(false); router.push("/pricing"); }}>
                      <Lock className="mr-2 h-4 w-4" />
                      {t("quota.mockExamProRequired")}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsList className="mb-1">
          <TabsTrigger value="listening">{t("common.types.listening")}</TabsTrigger>
          <TabsTrigger value="reading">{t("common.types.reading")}</TabsTrigger>
          <TabsTrigger value="speaking">{t("common.types.speaking")}</TabsTrigger>
          <TabsTrigger value="writing">{t("common.types.writing")}</TabsTrigger>
        </TabsList>

        <TabsContent value={tab ?? "listening"} className="mt-4">
          {/* ── Status filter chips (listening/reading only) ── */}
          {(tab === "listening" || tab === "reading") && statusCounts && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Pill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                {t("tests.filterAll")}({statusCounts.all})
              </Pill>
              <Pill active={statusFilter === "inProgress"} onClick={() => setStatusFilter("inProgress")}>
                {t("tests.filterInProgress")}({statusCounts.inProgress})
              </Pill>
              <Pill active={statusFilter === "completed"} onClick={() => setStatusFilter("completed")}>
                {t("tests.filterCompleted")}({statusCounts.completed})
              </Pill>
              <Pill active={statusFilter === "notStarted"} onClick={() => setStatusFilter("notStarted")}>
                {t("tests.filterNotStarted")}({statusCounts.notStarted})
              </Pill>
            </div>
          )}

          {/* Speed drill button (listening/reading only) */}
          {(tab === "listening" || tab === "reading") && isAuthenticated && (
            <div className="mb-4">
              <button
                onClick={() => setLevelDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-violet-500/20 bg-violet-500/5 px-5 py-2.5 text-sm font-semibold text-violet-600 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 dark:text-violet-400"
              >
                <Layers className="h-4 w-4" />
                {t("speedDrill.title")}
              </button>
            </div>
          )}

          {/* Level practice dialog */}
          <LevelPracticeDialog
            open={levelDialogOpen}
            onOpenChange={setLevelDialogOpen}
            type={tab as "listening" | "reading"}
          />

          {tab && !hasContinueBanner && <RecommendedBanner type={tab} />}

          {/* ── Speaking/Writing controls ── */}
          {isSpeakingWriting && (
            <div className="mb-5 space-y-3">
              {/* Tâche pills + mock exam pill */}
              {tab === "speaking" && (
                <div className="flex flex-wrap gap-2">
                  <Pill active={speakingTache === 1} onClick={() => setSpeakingTache(1)}>
                    {t("tests.writingTache1")}
                  </Pill>
                  <Pill active={speakingTache === 2} onClick={() => setSpeakingTache(2)}>
                    {t("tests.writingTache2")}
                  </Pill>
                  <Pill active={speakingTache === 3} onClick={() => setSpeakingTache(3)}>
                    {t("tests.writingTache3")}
                  </Pill>
                  <MockExamPill active={false} onClick={() => router.push("/speaking-exam")}>
                    {t("tests.mockSpeakingExam")}
                  </MockExamPill>
                </div>
              )}
              {tab === "writing" && (
                <div className="flex flex-wrap gap-2">
                  <Pill active={writingTache === 1} onClick={() => setWritingTache(1)}>
                    {t("tests.speakingTache1")}
                  </Pill>
                  <Pill active={writingTache === 2} onClick={() => setWritingTache(2)}>
                    {t("tests.speakingTache2")}
                  </Pill>
                  <Pill active={writingTache === 3} onClick={() => setWritingTache(3)}>
                    {t("tests.speakingTache3")}
                  </Pill>
                  <MockExamPill active={false} onClick={() => router.push("/writing-mock-exam")}>
                    {t("tests.mockWritingExam")}
                  </MockExamPill>
                </div>
              )}

              {/* Year pills (topic practice mode, not mock exam) */}
              {(tab === "speaking" ? speakingTache > 0 : writingTache > 0) && availableYears.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <Pill active={selectedYear === null} onClick={() => setSelectedYear(null)}>
                    {t("tests.all")}
                  </Pill>
                  {availableYears.map((year) => (
                    <Pill
                      key={year}
                      active={selectedYear === year}
                      onClick={() => setSelectedYear(year)}
                    >
                      {year}
                    </Pill>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Content ── */}
          {tab === "listening" || tab === "reading" ? (
            renderFlatGrid()
          ) : tab === "speaking" && speakingTache === 1 ? (
            <SpeakingTache1Guide />
          ) : tab === "speaking" ? (
            renderSpeakingByLevel()
          ) : tab === "writing" ? (
            renderWritingByLevel()
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ShowMoreButton({ count, onClick }: { count: number; onClick: () => void }) {
  const t = useTranslations();
  return (
    <button
      onClick={onClick}
      className="mx-auto mt-6 flex items-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:text-foreground hover:shadow-md"
    >
      <ChevronDown className="h-4 w-4" />
      {t("tests.showMore", { count })}
    </button>
  );
}
