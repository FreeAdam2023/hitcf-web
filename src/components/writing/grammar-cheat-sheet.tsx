"use client";

import { useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { BookOpen, ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getGrammarCards } from "@/lib/api/questions";
import type { GrammarCard } from "@/lib/api/types";

const CATEGORY_ORDER = ["tense", "mood", "pronoun", "structure", "other"];
const CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  tense: { zh: "时态", en: "Tenses" },
  mood: { zh: "语气", en: "Moods" },
  pronoun: { zh: "代词", en: "Pronouns" },
  structure: { zh: "句型结构", en: "Structures" },
  other: { zh: "其他", en: "Other" },
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  A2: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  B1: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  B2: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  C1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  C2: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

// Module-level cache — cards don't change during a session
let _cardsCache: GrammarCard[] | null = null;

export function GrammarCheatSheet() {
  const t = useTranslations("grammarCheatSheet");
  const locale = useLocale();
  const [cards, setCards] = useState<GrammarCard[]>(_cardsCache ?? []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    if (_cardsCache) {
      setCards(_cardsCache);
      return;
    }
    setLoading(true);
    try {
      const result = await getGrammarCards();
      _cardsCache = result;
      setCards(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open && cards.length === 0 && !loading) {
        fetchCards();
      }
    },
    [cards.length, loading, fetchCards],
  );

  // Filter cards by search
  const filtered = search.trim()
    ? cards.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.name_zh?.toLowerCase().includes(q) ||
          c.name_en?.toLowerCase().includes(q) ||
          c.slug.includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
        );
      })
    : cards;

  // Group by category
  const grouped = CATEGORY_ORDER.reduce<Record<string, GrammarCard[]>>((acc, cat) => {
    const items = filtered.filter((c) => c.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <Sheet onOpenChange={handleOpenChange} modal={false}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <BookOpen className="h-3.5 w-3.5" />
          {t("trigger")}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[360px] sm:w-[420px] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle className="text-base">{t("title")}</SheetTitle>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </SheetHeader>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="mt-3 space-y-4">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          )}

          {!loading && Object.keys(grouped).length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {search ? t("noResults") : t("empty")}
            </p>
          )}

          {!loading &&
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {locale === "en"
                    ? CATEGORY_LABELS[cat]?.en
                    : CATEGORY_LABELS[cat]?.zh}{" "}
                  <span className="font-normal">({items.length})</span>
                </h4>
                <div className="space-y-1">
                  {items.map((card) => (
                    <GrammarCardRow
                      key={card.slug}
                      card={card}
                      locale={locale}
                      expanded={expandedSlug === card.slug}
                      onToggle={() =>
                        setExpandedSlug(
                          expandedSlug === card.slug ? null : card.slug,
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GrammarCardRow({
  card,
  locale,
  expanded,
  onToggle,
}: {
  card: GrammarCard;
  locale: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
      >
        <span className="flex-1 font-medium">
          {card.name}
          {card.name_zh && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              {card.name_zh}
            </span>
          )}
        </span>
        <Badge
          variant="secondary"
          className={`text-[10px] px-1.5 py-0 ${LEVEL_COLORS[card.level] ?? ""}`}
        >
          {card.level}
        </Badge>
        {expanded ? (
          <ChevronUp className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200 border-t px-3 py-2 text-xs space-y-1.5">
          {card.rule && (
            <p className="font-mono text-primary/80">{card.rule}</p>
          )}
          {card.rule_zh && locale !== "en" && (
            <p className="text-muted-foreground">{card.rule_zh}</p>
          )}
          <p className="leading-relaxed">
            {locale === "en" ? card.explanation_en : card.explanation}
          </p>
          {card.examples.length > 0 && (
            <div className="space-y-1 border-t border-border/50 pt-1.5">
              {card.examples.map((ex, i) => (
                <div key={i}>
                  <p className="font-medium text-foreground">{ex.fr}</p>
                  <p className="text-muted-foreground">
                    {locale === "en" ? ex.en : `${ex.zh} / ${ex.en}`}
                  </p>
                </div>
              ))}
            </div>
          )}
          {card.irregulars && (
            <p className="border-t border-border/50 pt-1.5 text-muted-foreground">
              {card.irregulars}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
