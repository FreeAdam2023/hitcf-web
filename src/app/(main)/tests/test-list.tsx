"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, ChevronUp, Shuffle, Loader2, Layers, ArrowRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listTestSets, listWritingTopics } from "@/lib/api/test-sets";
import { listAttempts, createMockListeningExam } from "@/lib/api/attempts";
import { fetchAllPages } from "@/lib/api/fetch-all-pages";
import type { TestSetItem, WritingTopicItem, AttemptResponse } from "@/lib/api/types";
import type { TestAttemptInfo } from "./test-card";
import { SkeletonGrid } from "@/components/shared/skeleton-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { TestCard } from "./test-card";
import { SpeakingTopicCard } from "./speaking-topic-card";
import { WritingTopicCard } from "./writing-topic-card";
import { WritingLevelCard } from "./writing-level-card";
import { SpeakingTache1Guide } from "./speaking-tache1-guide";
import { ContinueBanner } from "@/components/shared/continue-banner";
import { RecommendedBanner } from "@/components/shared/recommended-banner";
import { CLB7ProgressBar } from "@/components/shared/clb7-progress-bar";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { useAuthStore } from "@/stores/auth-store";
import { usePracticeStore } from "@/stores/practice-store";
import { getInProgressDrills, resumeSpeedDrill, abandonSpeedDrill, type InProgressAttempt } from "@/lib/api/speed-drill";
import { LevelPracticeDialog } from "./level-practice-dialog";

type TabType = "listening" | "reading" | "speaking" | "writing";
type BrowseMode = "level" | "set";

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

// ─── Month section header ──────────────────────────────────────
function MonthHeader({ label, countLabel, collapsible, open, onToggle }: {
  label: string;
  countLabel: string;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  const Wrapper = collapsible ? "button" : "div";
  return (
    <Wrapper
      className="flex w-full items-center gap-3 pb-3 pt-1"
      {...(collapsible ? { onClick: onToggle, type: "button" as const } : {})}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {countLabel}
      </span>
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
    const existing = map.get(a.test_set_id);
    if (!existing) {
      map.set(a.test_set_id, {
        bestScore: a.status === "completed" ? a.score : null,
        bestTotal: a.total,
        hasInProgress: a.status === "in_progress",
        inProgressAnswered: a.status === "in_progress" ? a.answered_count : undefined,
        inProgressTotal: a.status === "in_progress" ? a.total : undefined,
        attemptCount: 1,
      });
    } else {
      existing.attemptCount++;
      if (a.status === "completed" && a.score !== null) {
        if (existing.bestScore === null || a.score > existing.bestScore) {
          existing.bestScore = a.score;
          existing.bestTotal = a.total;
        }
      }
      if (a.status === "in_progress") {
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
  const initPractice = usePracticeStore((s) => s.init);
  const [mockLoading, setMockLoading] = useState(false);
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [drillInProgress, setDrillInProgress] = useState<InProgressAttempt[]>([]);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const canAccessPaid = useAuthStore((s) => {
    if (s.isLoading) return true;
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const [tab, setTab] = useState<TabType>("listening");
  const [expanded, setExpanded] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [attemptMap, setAttemptMap] = useState<Map<string, TestAttemptInfo>>(new Map());

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
  }, [isAuthenticated]);

  // Restore tab from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get("tab");
    if (param && VALID_TABS.includes(param as TabType)) {
      setTab(param as TabType);
    }
  }, []);

  // Load in-progress level practice attempts
  useEffect(() => {
    if (!isAuthenticated) return;
    getInProgressDrills().then(setDrillInProgress).catch(() => {});
  }, [isAuthenticated]);

  const handleResumeDrill = async (attemptId: string) => {
    setResumingId(attemptId);
    try {
      const result = await resumeSpeedDrill(attemptId);
      initPractice(result.attempt_id, result.questions);
      router.push(`/practice/${result.attempt_id}`);
    } catch {
      setResumingId(null);
    }
  };

  const handleAbandonDrill = async (attemptId: string) => {
    try {
      await abandonSpeedDrill(attemptId);
      setDrillInProgress((prev) => prev.filter((a) => a.attempt_id !== attemptId));
    } catch {
      // ignore
    }
  };

  const [tests, setTests] = useState<TestSetItem[]>([]);
  const [writingTopics, setWritingTopics] = useState<WritingTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Exam type filter
  type ExamTypeFilter = "all" | "tcf_canada" | "tcf_tp" | "tcf_irn" | "tcf_quebec";
  const [examTypeFilter] = useState<ExamTypeFilter>("tcf_canada");

  // Speaking/Writing specific state
  const [browseMode, setBrowseMode] = useState<BrowseMode>("level");
  const [speakingTache, setSpeakingTache] = useState<1 | 2 | 3>(1);
  const [writingTache, setWritingTache] = useState<1 | 2 | 3>(3);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Status filter for listening/reading tabs
  type StatusFilter = "all" | "inProgress" | "completed" | "notStarted";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Reset filters on tab change
  useEffect(() => {
    setSearch("");
    setSelectedYear(null);
    setBrowseMode("level");
    setStatusFilter("all");
  }, [tab]);

  // ─── Data fetching ────────────────────────────────────────
  const fetchTestSets = useCallback(async () => {
    setLoading(true);
    const etParam = examTypeFilter === "all" ? undefined : examTypeFilter;
    try {
      if (tab === "speaking" && browseMode === "level" && speakingTache === 1) {
        setTests([]);
      } else if (tab === "speaking" && browseMode === "level") {
        const items = await fetchAllPages(
          (p) => listTestSets({ type: "speaking", exam_type: etParam, task_number: speakingTache, ...p }), 500,
        );
        setTests(items);
      } else if (tab === "writing" && browseMode === "level") {
        const items = await fetchAllPages(
          (p) => listWritingTopics({ task_number: writingTache, ...p }), 500,
        );
        setWritingTopics(items);
        setTests([]);
      } else {
        const size = (tab === "speaking" || tab === "writing") ? 500 : 100;
        const items = await fetchAllPages(
          (p) => listTestSets({ type: tab, exam_type: etParam, ...p }), size,
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
  }, [tab, browseMode, speakingTache, writingTache, examTypeFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTestSets();
    return () => controller.abort();
  }, [fetchTestSets]);

  // ─── Derived: available years ─────────────────────────────
  const availableYears = useMemo(() => {
    if (tab === "writing" && browseMode === "level") {
      return extractYears(writingTopics);
    }
    return extractYears(tests);
  }, [tab, browseMode, tests, writingTopics]);

  // ─── Status helpers for listening/reading ────────────────
  const getTestStatus = useCallback(
    (testId: string): "completed" | "inProgress" | "notStarted" => {
      const info = attemptMap.get(testId);
      if (!info) return "notStarted";
      if (info.bestScore !== null && info.bestScore !== undefined) return "completed";
      if (info.hasInProgress) return "inProgress";
      return "notStarted";
    },
    [attemptMap],
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
      return filtered.sort((a, b) => {
        // 1. Free tests first
        const aFree = a.code.includes("gratuit") ? 0 : 1;
        const bFree = b.code.includes("gratuit") ? 0 : 1;
        if (aFree !== bFree) return aFree - bFree;
        // 2. inProgress → notStarted → completed
        const statusOrder = { inProgress: 0, notStarted: 1, completed: 2 };
        const aStatus = statusOrder[getTestStatus(a.id)];
        const bStatus = statusOrder[getTestStatus(b.id)];
        if (aStatus !== bStatus) return aStatus - bStatus;
        // 3. By number ascending
        const aNum = parseInt(a.code.match(/\d+/)?.[0] || "999", 10);
        const bNum = parseInt(b.code.match(/\d+/)?.[0] || "999", 10);
        return aNum - bNum;
      });
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

  // ─── Is speaking/writing tab? ─────────────────────────────
  const isSpeakingWriting = tab === "speaking" || tab === "writing";

  // ─── Render: Listening / Reading (flat grid with upgrade banner) ────
  const INITIAL_SHOW = 6;

  const renderFlatGrid = () => {
    if (loading) return <SkeletonGrid />;
    if (filteredTests.length === 0) return <EmptyState title={t("tests.emptyTitle")} description={t("tests.emptyDescription")} />;

    const isSearching = search.trim().length > 0;
    const showAll = expanded || isSearching;

    // Insert upgrade banner between free and locked tests
    if (!canAccessPaid) {
      const freeTests = filteredTests.filter((t) => t.is_free);
      const paidTests = filteredTests.filter((t) => !t.is_free);
      const visiblePaid = showAll ? paidTests : paidTests.slice(0, Math.max(0, INITIAL_SHOW - freeTests.length));
      const hiddenCount = paidTests.length - visiblePaid.length;

      if (freeTests.length > 0 && paidTests.length > 0) {
        return (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
              {freeTests.map((t) => (
                <TestCard key={t.id} test={t} attemptInfo={attemptMap.get(t.id)} />
              ))}
            </div>
            <UpgradeBanner
              className="my-6"
              title={t("tests.unlockAll")}
              description={t("tests.unlockDescription", { count: paidTests.length })}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
              {visiblePaid.map((t) => (
                <TestCard key={t.id} test={t} attemptInfo={attemptMap.get(t.id)} />
              ))}
            </div>
            {hiddenCount > 0 && (
              <ShowMoreButton count={hiddenCount} onClick={() => setExpanded(true)} />
            )}
          </>
        );
      }
    }

    const visible = showAll ? filteredTests : filteredTests.slice(0, INITIAL_SHOW);
    const hiddenCount = filteredTests.length - visible.length;

    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
          {visible.map((t) => (
            <TestCard key={t.id} test={t} attemptInfo={attemptMap.get(t.id)} />
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

  // ─── Render: Month-grouped test set cards (by-set) ────────
  const renderGroupedTestSets = () => {
    if (loading) return <SkeletonGrid />;
    if (testSections.length === 0) return <EmptyState title={t("tests.emptyTitle")} description={t("tests.emptyDescription")} />;
    return (
      <div className="space-y-4">
        {testSections.map((section, i) => {
          const open = isMonthOpen(section.month, i);
          return (
            <div key={section.month}>
              <MonthHeader
                label={formatMonthLabel(section.month)}
                countLabel={t("tests.setsCount", { count: section.items.length })}
                collapsible
                open={open}
                onToggle={() => toggleMonth(section.month)}
              />
              {open && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
                  {section.items.map((t) =>
                    tab === "speaking" ? (
                      <SpeakingTopicCard key={t.id} test={t} />
                    ) : (
                      <WritingTopicCard key={t.id} test={t} />
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render: Speaking by-level (month-grouped) ──────────────
  const renderSpeakingByLevel = () => {
    if (loading) return <SkeletonGrid />;
    if (testSections.length === 0) return <EmptyState title={t("tests.emptyTopicTitle")} description={t("tests.emptyTopicDesc")} />;
    return (
      <div className="space-y-4">
        {testSections.map((section, i) => {
          const open = isMonthOpen(section.month, i);
          return (
            <div key={section.month}>
              <MonthHeader
                label={formatMonthLabel(section.month)}
                countLabel={t("tests.setsCount", { count: section.items.length })}
                collapsible
                open={open}
                onToggle={() => toggleMonth(section.month)}
              />
              {open && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
                  {section.items.map((t) => (
                    <SpeakingTopicCard key={t.id} test={t} />
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
          return (
            <div key={section.month}>
              <MonthHeader
                label={formatMonthLabel(section.month)}
                countLabel={t("tests.setsCount", { count: section.items.length })}
                collapsible
                open={open}
                onToggle={() => toggleMonth(section.month)}
              />
              {open && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
                  {section.items.map((t) => (
                    <WritingLevelCard key={t.question_id} topic={t} tache={writingTache} />
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
        <p className="mt-2 text-sm text-muted-foreground">
          {t("tests.pageSubtitle")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-400">
            {t("tests.statsListening")}
          </span>
          <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
            {t("tests.statsReading")}
          </span>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            {t("tests.statsSpeaking")}
          </span>
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-400">
            {t("tests.statsWriting")}
          </span>
        </div>
      </div>
      <ContinueBanner />
      <CLB7ProgressBar />
      <Tabs value={tab} onValueChange={(v) => {
        const t = v as TabType;
        setTab(t);
        setExpanded(false);
        setExpandedMonths(new Set());
        const url = new URL(window.location.href);
        url.searchParams.set("tab", t);
        window.history.replaceState({}, "", url.pathname + url.search);
      }}>
        {/* Exam type selector hidden — only TCF Canada data for now */}
        {/* Search */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("tests.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
        </div>

        <TabsList className="mb-1">
          <TabsTrigger value="listening">{t("common.types.listening")}</TabsTrigger>
          <TabsTrigger value="reading">{t("common.types.reading")}</TabsTrigger>
          <TabsTrigger value="speaking">{t("common.types.speaking")}</TabsTrigger>
          <TabsTrigger value="writing">{t("common.types.writing")}</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
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

          {/* In-progress level practice */}
          {(tab === "listening" || tab === "reading") && drillInProgress.length > 0 && (
            <div className="mb-4 space-y-2">
              {drillInProgress.map((a) => {
                const pct = a.total > 0 ? Math.round((a.answered_count / a.total) * 100) : 0;
                return (
                  <div
                    key={a.attempt_id}
                    className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t("speedDrill.inProgress")}</p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <div className="h-1.5 flex-1 rounded-full bg-primary/20">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {a.answered_count}/{a.total}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => handleAbandonDrill(a.attempt_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResumeDrill(a.attempt_id)}
                      disabled={resumingId === a.attempt_id}
                    >
                      <ArrowRight className="mr-1 h-3.5 w-3.5" />
                      {t("speedDrill.resume")}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action buttons: level practice + mock exam */}
          {(tab === "listening" || tab === "reading") && isAuthenticated && (
            <div className="mb-4 flex flex-wrap gap-3">
              <button
                onClick={() => setLevelDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-violet-500/20 bg-violet-500/5 px-5 py-2.5 text-sm font-semibold text-violet-600 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 dark:text-violet-400"
              >
                <Layers className="h-4 w-4" />
                {t("speedDrill.title")}
              </button>
              {tab === "listening" && (
                <button
                  onClick={async () => {
                    setMockLoading(true);
                    try {
                      const result = await createMockListeningExam();
                      router.push(`/exam/${result.id}`);
                    } catch {
                      setMockLoading(false);
                    }
                  }}
                  disabled={mockLoading}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:border-primary/40 hover:bg-primary/10 disabled:opacity-50"
                >
                  {mockLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shuffle className="h-4 w-4" />
                  )}
                  {t("tests.mockExam")}
                </button>
              )}
            </div>
          )}

          {/* Level practice dialog */}
          <LevelPracticeDialog
            open={levelDialogOpen}
            onOpenChange={setLevelDialogOpen}
            type={tab as "listening" | "reading"}
          />

          <RecommendedBanner type={tab} />

          {/* ── Speaking/Writing controls ── */}
          {isSpeakingWriting && (
            <div className="mb-5 space-y-3">
              {/* Mode toggle */}
              <div className="flex gap-2">
                <Pill active={browseMode === "level"} onClick={() => setBrowseMode("level")}>
                  {t("tests.byLevel")}
                </Pill>
                <Pill active={browseMode === "set"} onClick={() => setBrowseMode("set")}>
                  {t("tests.bySet")}
                </Pill>
              </div>

              {/* Tâche pills (by-level mode only) */}
              {browseMode === "level" && tab === "speaking" && (
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
                </div>
              )}
              {browseMode === "level" && tab === "writing" && (
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
                </div>
              )}

              {/* Year pills */}
              {availableYears.length > 1 && (
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
          ) : browseMode === "level" && tab === "speaking" && speakingTache === 1 ? (
            <SpeakingTache1Guide />
          ) : browseMode === "level" && tab === "speaking" ? (
            renderSpeakingByLevel()
          ) : browseMode === "level" && tab === "writing" ? (
            renderWritingByLevel()
          ) : (
            renderGroupedTestSets()
          )}
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
