"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Hash,
  Clock,
  Calendar,
  ALargeSmall,
  ArrowRightLeft,
  User,
  ArrowDownToDot,
  Users,
  Play,
  History,
  FastForward,
  Sparkles,
  MessageCircleQuestion,
  Scale,
  GraduationCap,
  Search,
  Loader2,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listReferences } from "@/lib/api/reference";
import type { GrammarReferenceItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, typeof Hash> = {
  hash: Hash,
  clock: Clock,
  calendar: Calendar,
  "a-large-small": ALargeSmall,
  "arrow-right-left": ArrowRightLeft,
  user: User,
  "arrow-down-to-dot": ArrowDownToDot,
  users: Users,
  play: Play,
  history: History,
  "fast-forward": FastForward,
  sparkles: Sparkles,
  "message-circle-question": MessageCircleQuestion,
  scale: Scale,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
};

const CATEGORY_ORDER = [
  "basics",
  "determiners",
  "pronouns",
  "verbs",
  "structures",
  "exam",
];

const CATEGORY_COLOR: Record<string, string> = {
  basics: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
  determiners:
    "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
  pronouns:
    "text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400",
  verbs: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
  structures:
    "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
  exam: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
};

const CATEGORY_BORDER: Record<string, string> = {
  basics: "border-blue-200 dark:border-blue-800/50",
  determiners: "border-emerald-200 dark:border-emerald-800/50",
  pronouns: "border-violet-200 dark:border-violet-800/50",
  verbs: "border-amber-200 dark:border-amber-800/50",
  structures: "border-rose-200 dark:border-rose-800/50",
  exam: "border-indigo-200 dark:border-indigo-800/50",
};

const LEVEL_COLOR: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  A2: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  B2: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  C1: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  C2: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
};

export function ReferenceView() {
  const t = useTranslations("reference");
  const locale = useLocale();
  const [items, setItems] = useState<GrammarReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listReferences(locale)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [items, search]);

  const grouped = useMemo(() => {
    const map: Record<string, GrammarReferenceItem[]> = {};
    for (const cat of CATEGORY_ORDER) {
      const catItems = filtered.filter((i) => i.category === cat);
      if (catItems.length > 0) map[cat] = catItems;
    }
    return map;
  }, [filtered]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("hero.title")}
          </span>
        </h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("search.placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-16">
          {t("noResults")}
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <section key={cat}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t(`cat.${cat}`)}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {catItems.map((item) => {
                  const Icon = ICON_MAP[item.icon] || BookOpen;
                  return (
                    <Link
                      key={item.slug}
                      href={`/reference/${item.slug}`}
                      className={cn(
                        "group relative flex flex-col rounded-xl border p-4 transition-all",
                        "hover:shadow-md hover:-translate-y-0.5",
                        "bg-card",
                        CATEGORY_BORDER[cat] || "border-border",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            CATEGORY_COLOR[cat],
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm leading-tight truncate">
                              {item.title}
                            </h3>
                            {item.level && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 shrink-0",
                                  LEVEL_COLOR[item.level] ?? "",
                                )}
                              >
                                {item.level}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
