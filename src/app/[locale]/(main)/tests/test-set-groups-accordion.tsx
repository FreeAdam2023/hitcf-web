"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import { listTestSets } from "@/lib/api/test-sets";
import type { TestSetItem } from "@/lib/api/types";

interface Props {
  type: "listening" | "reading";
}

type Group = "classic" | "extended";

export function TestSetGroupsAccordion({ type }: Props) {
  const t = useTranslations();
  const [openGroup, setOpenGroup] = useState<Group | null>(null);
  const [classicSets, setClassicSets] = useState<TestSetItem[] | null>(null);
  const [extendedSets, setExtendedSets] = useState<TestSetItem[] | null>(null);
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

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {t("tests.browseTestSets")}
      </h3>
      <GroupRow
        label={t("tests.classicSets")}
        count={counts.classic}
        open={openGroup === "classic"}
        onToggle={() => toggleGroup("classic")}
        items={classicSets}
      />
      <GroupRow
        label={t("tests.extendedSets")}
        count={counts.extended}
        open={openGroup === "extended"}
        onToggle={() => toggleGroup("extended")}
        items={extendedSets}
      />
    </div>
  );
}

function GroupRow({
  label,
  count,
  open,
  onToggle,
  items,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  items: TestSetItem[] | null;
}) {
  const router = useRouter();
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{label}</span>
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {items.map((ts) => (
                <button
                  key={ts.id}
                  onClick={() => router.push(`/tests/${ts.id}`)}
                  className="rounded-lg border border-border/50 bg-muted/20 px-2 py-2 text-xs text-center hover:bg-muted hover:border-border transition-colors truncate"
                  title={ts.name}
                >
                  {ts.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
