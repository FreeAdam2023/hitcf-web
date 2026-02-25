"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listTestSets, listWritingTopics } from "@/lib/api/test-sets";
import type { TestSetItem, WritingTopicItem } from "@/lib/api/types";
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

type TabType = "listening" | "reading" | "speaking" | "writing";
type BrowseMode = "level" | "set";

const MONTH_NAMES: Record<string, string> = {
  "01": "1月", "02": "2月", "03": "3月", "04": "4月",
  "05": "5月", "06": "6月", "07": "7月", "08": "8月",
  "09": "9月", "10": "10月", "11": "11月", "12": "12月",
};

function formatMonthHeader(sourceDate: string): string {
  const [year, month] = sourceDate.split("-");
  return `${year}年${MONTH_NAMES[month] || month}`;
}

/** Group items by source_date, returning sections sorted newest-first */
function groupByMonth<T extends { source_date: string | null }>(
  items: T[],
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
    .map(([month, items]) => ({
      month,
      label: formatMonthHeader(month),
      items,
    }));

  if (noDate.length > 0) {
    sections.push({ month: "original", label: "原始题库", items: noDate });
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
function MonthHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 pb-3 pt-1">
      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {count} 套
      </span>
      <div className="flex-1 border-t border-border/50" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
const VALID_TABS: TabType[] = ["listening", "reading", "speaking", "writing"];

export function TestList() {
  const canAccessPaid = useAuthStore((s) => {
    if (s.isLoading) return true;
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const [tab, setTab] = useState<TabType>("listening");

  // Restore tab from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get("tab");
    if (param && VALID_TABS.includes(param as TabType)) {
      setTab(param as TabType);
    }
  }, []);
  const [tests, setTests] = useState<TestSetItem[]>([]);
  const [writingTopics, setWritingTopics] = useState<WritingTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Speaking/Writing specific state
  const [browseMode, setBrowseMode] = useState<BrowseMode>("level");
  const [speakingTache, setSpeakingTache] = useState<1 | 2 | 3>(1);
  const [writingTache, setWritingTache] = useState<1 | 2 | 3>(3);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Reset filters on tab change
  useEffect(() => {
    setSearch("");
    setSelectedYear(null);
    setBrowseMode("level");
  }, [tab]);

  // ─── Data fetching ────────────────────────────────────────
  const fetchTestSets = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "speaking" && browseMode === "level" && speakingTache === 1) {
        setTests([]);
      } else if (tab === "speaking" && browseMode === "level") {
        const res = await listTestSets({ type: "speaking", task_number: speakingTache, page_size: 500 });
        setTests(res.items);
      } else if (tab === "writing" && browseMode === "level") {
        const res = await listWritingTopics({
          task_number: writingTache,
          year: selectedYear || undefined,
          page_size: 100,
        });
        setWritingTopics(res.items);
        setTests([]);
      } else {
        const size = (tab === "speaking" || tab === "writing") ? 500 : 100;
        const res = await listTestSets({ type: tab, page_size: size });
        setTests(res.items);
      }
    } catch (err) {
      console.error("Failed to load", err);
      setTests([]);
      setWritingTopics([]);
    } finally {
      setLoading(false);
    }
  }, [tab, browseMode, speakingTache, writingTache, selectedYear]);

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

  // ─── Filtered + sorted items (listening/reading + 按套题) ─
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
      return true;
    });

    if (tab === "listening" || tab === "reading") {
      return filtered.sort((a, b) => {
        const aFree = a.code.includes("gratuit") ? 0 : 1;
        const bFree = b.code.includes("gratuit") ? 0 : 1;
        if (aFree !== bFree) return aFree - bFree;
        const aNum = parseInt(a.code.match(/\d+/)?.[0] || "999", 10);
        const bNum = parseInt(b.code.match(/\d+/)?.[0] || "999", 10);
        return aNum - bNum;
      });
    }

    return filtered;
  }, [tests, search, tab, selectedYear]);

  // ─── Filtered writing topics (按等级 mode) ───────────────
  const filteredWritingTopics = useMemo(() => {
    if (!search) return writingTopics;
    const searchLower = search.toLowerCase();
    return writingTopics.filter(
      (t) => t.question_text?.toLowerCase().includes(searchLower) || t.test_set_name?.toLowerCase().includes(searchLower),
    );
  }, [writingTopics, search]);

  // ─── Grouped sections ────────────────────────────────────
  const testSections = useMemo(
    () => groupByMonth(filteredTests),
    [filteredTests],
  );

  const writingTopicSections = useMemo(
    () => groupByMonth(filteredWritingTopics),
    [filteredWritingTopics],
  );

  // ─── Is speaking/writing tab? ─────────────────────────────
  const isSpeakingWriting = tab === "speaking" || tab === "writing";

  // ─── Render: Listening / Reading (flat grid with upgrade banner) ────
  const renderFlatGrid = () => {
    if (loading) return <SkeletonGrid />;
    if (filteredTests.length === 0) return <EmptyState title="暂无题套" description="该分类下还没有题套" />;

    // Insert upgrade banner between free and locked tests
    if (!canAccessPaid) {
      const freeTests = filteredTests.filter((t) => t.is_free);
      const paidTests = filteredTests.filter((t) => !t.is_free);

      if (freeTests.length > 0 && paidTests.length > 0) {
        return (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
              {freeTests.map((t) => (
                <TestCard key={t.id} test={t} />
              ))}
            </div>
            <UpgradeBanner
              className="my-6"
              title="解锁全部题库"
              description={`还有 ${paidTests.length} 套题等你挑战，升级 Pro 获取完整备考体验`}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
              {paidTests.map((t) => (
                <TestCard key={t.id} test={t} />
              ))}
            </div>
          </>
        );
      }
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
        {filteredTests.map((t) => (
          <TestCard key={t.id} test={t} />
        ))}
      </div>
    );
  };

  // ─── Render: Month-grouped test set cards (按套题) ────────
  const renderGroupedTestSets = () => {
    if (loading) return <SkeletonGrid />;
    if (testSections.length === 0) return <EmptyState title="暂无题套" description="该分类下还没有题套" />;
    return (
      <div className="space-y-6">
        {testSections.map((section) => (
          <div key={section.month}>
            <MonthHeader label={section.label} count={section.items.length} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
              {section.items.map((t) =>
                tab === "speaking" ? (
                  <SpeakingTopicCard key={t.id} test={t} />
                ) : (
                  <WritingTopicCard key={t.id} test={t} />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Render: Speaking 按等级 (month-grouped) ──────────────
  const renderSpeakingByLevel = () => {
    if (loading) return <SkeletonGrid />;
    if (testSections.length === 0) return <EmptyState title="暂无话题" description="该等级下还没有话题" />;
    return (
      <div className="space-y-6">
        {testSections.map((section) => (
          <div key={section.month}>
            <MonthHeader label={section.label} count={section.items.length} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
              {section.items.map((t) => (
                <SpeakingTopicCard key={t.id} test={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Render: Writing 按等级 (month-grouped topics) ────────
  const renderWritingByLevel = () => {
    if (loading) return <SkeletonGrid />;
    if (writingTopicSections.length === 0) return <EmptyState title="暂无题目" description="该等级下还没有题目" />;
    return (
      <div className="space-y-6">
        {writingTopicSections.map((section) => (
          <div key={section.month}>
            <MonthHeader label={section.label} count={section.items.length} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-card-grid">
              {section.items.map((t) => (
                <WritingLevelCard key={t.question_id} topic={t} tache={writingTache} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Main render ──────────────────────────────────────────
  return (
    <div>
      <ContinueBanner />
      <CLB7ProgressBar />
      <Tabs value={tab} onValueChange={(v) => {
        const t = v as TabType;
        setTab(t);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", t);
        window.history.replaceState({}, "", url.pathname + url.search);
      }}>
        {/* Search with icon */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索题套名称或代号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsList className="mb-1">
          <TabsTrigger value="listening">听力</TabsTrigger>
          <TabsTrigger value="reading">阅读</TabsTrigger>
          <TabsTrigger value="speaking">口语</TabsTrigger>
          <TabsTrigger value="writing">写作</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <RecommendedBanner type={tab} />

          {/* ── Speaking/Writing controls ── */}
          {isSpeakingWriting && (
            <div className="mb-5 space-y-3">
              {/* Mode toggle: 按等级 / 按套题 */}
              <div className="flex gap-2">
                <Pill active={browseMode === "level"} onClick={() => setBrowseMode("level")}>
                  按等级
                </Pill>
                <Pill active={browseMode === "set"} onClick={() => setBrowseMode("set")}>
                  按套题
                </Pill>
              </div>

              {/* Tâche pills (按等级 mode only) */}
              {browseMode === "level" && tab === "speaking" && (
                <div className="flex flex-wrap gap-2">
                  <Pill active={speakingTache === 1} onClick={() => setSpeakingTache(1)}>
                    Tâche 1 · 自我介绍
                  </Pill>
                  <Pill active={speakingTache === 2} onClick={() => setSpeakingTache(2)}>
                    Tâche 2 · 情景对话
                  </Pill>
                  <Pill active={speakingTache === 3} onClick={() => setSpeakingTache(3)}>
                    Tâche 3 · 观点论述
                  </Pill>
                </div>
              )}
              {browseMode === "level" && tab === "writing" && (
                <div className="flex flex-wrap gap-2">
                  <Pill active={writingTache === 1} onClick={() => setWritingTache(1)}>
                    Tâche 1 · 基础
                  </Pill>
                  <Pill active={writingTache === 2} onClick={() => setWritingTache(2)}>
                    Tâche 2 · 进阶
                  </Pill>
                  <Pill active={writingTache === 3} onClick={() => setWritingTache(3)}>
                    Tâche 3 · 高阶
                  </Pill>
                </div>
              )}

              {/* Year pills */}
              {availableYears.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <Pill active={selectedYear === null} onClick={() => setSelectedYear(null)}>
                    全部
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
