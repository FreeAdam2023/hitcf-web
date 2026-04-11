"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { listTestSets, fetchTestSetsProgress } from "@/lib/api/test-sets";
import type { TestSetItem } from "@/lib/api/types";

interface Props {
  type: "listening" | "reading";
}

type Group = "classic" | "extended";

export function TestSetGroupsAccordion({ type }: Props) {
  const t = useTranslations();
  const [outerOpen, setOuterOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<Group | null>(null);
  const [classicSets, setClassicSets] = useState<TestSetItem[] | null>(null);
  const [extendedSets, setExtendedSets] = useState<TestSetItem[] | null>(null);
  const [progressMap, setProgressMap] = useState<
    Record<string, { total: number; dup: number }>
  >({});
  const [counts, setCounts] = useState<{ classic: number; extended: number }>({
    classic: 0,
    extended: 0,
  });

  // Fetch counts on mount (fast, one page each)
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

  const toggleGroup = (group: Group) => {
    if (openGroup === group) {
      setOpenGroup(null);
    } else {
      setOpenGroup(group);
      loadGroup(group);
    }
  };

  const totalCount = counts.classic + counts.extended;

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
          {/* Recommendation hint */}
          <div className="flex items-start gap-2 rounded-lg bg-violet-500/5 border border-violet-500/20 px-3 py-2 text-xs text-violet-700 dark:text-violet-300">
            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{t("tests.browseHint")}</span>
          </div>

          {/* Inner accordion — classic + extended */}
          <GroupRow
            label={t("tests.classicSets")}
            count={counts.classic}
            open={openGroup === "classic"}
            onToggle={() => toggleGroup("classic")}
            items={classicSets}
            progressMap={progressMap}
          />
          <GroupRow
            label={t("tests.extendedSets")}
            count={counts.extended}
            open={openGroup === "extended"}
            onToggle={() => toggleGroup("extended")}
            items={extendedSets}
            progressMap={progressMap}
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
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  items: TestSetItem[] | null;
  progressMap: Record<string, { total: number; dup: number }>;
}) {
  const router = useRouter();
  const t = useTranslations();
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {items.map((ts) => {
                const progress = progressMap[ts.id];
                const total = progress?.total ?? ts.question_count;
                const dup = progress?.dup ?? 0;
                const dupPct = total > 0 ? Math.round((dup / total) * 100) : 0;
                const isHighDup = dupPct >= 70;
                const isMidDup = dupPct >= 30 && dupPct < 70;
                return (
                  <button
                    key={ts.id}
                    onClick={() => router.push(`/tests/${ts.id}`)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      isHighDup
                        ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                        : "border-border/50 bg-card hover:bg-muted/40 hover:border-border"
                    }`}
                    title={ts.name}
                  >
                    <div className="text-xs font-medium truncate">{ts.name}</div>
                    {progress && progress.total > 0 && (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono ${
                            isHighDup
                              ? "text-amber-700 dark:text-amber-400"
                              : isMidDup
                                ? "text-muted-foreground"
                                : "text-muted-foreground/70"
                          }`}
                          title={t("tests.duplicateRatioTooltip", {
                            dup,
                            total,
                          })}
                        >
                          {t("tests.duplicateRatio", { pct: dupPct })}
                        </span>
                        <div className="flex-1 h-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full transition-all ${
                              isHighDup
                                ? "bg-amber-500/70"
                                : isMidDup
                                  ? "bg-muted-foreground/50"
                                  : "bg-emerald-500/50"
                            }`}
                            style={{ width: `${dupPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
