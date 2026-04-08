"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  FRENCH_EXPRESSIONS,
  EXPRESSION_CATEGORIES,
  EXPRESSION_LEVELS,
  type ExpressionCategory,
  type ExpressionLevel,
  type FrenchExpression,
} from "@/lib/french-expressions";
import { ChevronDown, ChevronUp, Lightbulb, BookOpen, PenLine, Mic } from "lucide-react";

export function ExpressionsView() {
  const t = useTranslations("expressions");
  const locale = useLocale();

  const [selectedCategory, setSelectedCategory] = useState<
    ExpressionCategory | "all"
  >("all");
  const [selectedLevel, setSelectedLevel] = useState<ExpressionLevel | "all">(
    "all",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return FRENCH_EXPRESSIONS.filter((e) => {
      if (selectedCategory !== "all" && e.category !== selectedCategory)
        return false;
      if (selectedLevel !== "all" && e.level !== selectedLevel) return false;
      return true;
    });
  }, [selectedCategory, selectedLevel]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {/* Category filters */}
        <FilterButton
          active={selectedCategory === "all"}
          onClick={() => setSelectedCategory("all")}
        >
          {t("allCategories")}
        </FilterButton>
        {EXPRESSION_CATEGORIES.map((cat) => (
          <FilterButton
            key={cat}
            active={selectedCategory === cat}
            onClick={() =>
              setSelectedCategory(cat === selectedCategory ? "all" : cat)
            }
          >
            {t(`categories.${cat}`)}
          </FilterButton>
        ))}

        <span className="mx-1" />

        {/* Level filters */}
        {EXPRESSION_LEVELS.map((level) => (
          <FilterButton
            key={level}
            active={selectedLevel === level}
            onClick={() =>
              setSelectedLevel(level === selectedLevel ? "all" : level)
            }
          >
            {level}
          </FilterButton>
        ))}
      </div>

      {/* Count */}
      <p className="mt-4 text-xs text-muted-foreground">
        {t("count", { count: filtered.length })}
      </p>

      {/* Cards */}
      <div className="mt-4 space-y-3">
        {filtered.map((expr) => (
          <ExpressionCard
            key={expr.id}
            expression={expr}
            locale={locale}
            expanded={expandedId === expr.id}
            onToggle={() =>
              setExpandedId(expandedId === expr.id ? null : expr.id)
            }
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterButton({
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
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function ExpressionCard({
  expression: e,
  locale,
  expanded,
  onToggle,
}: {
  expression: FrenchExpression;
  locale: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("expressions");
  const meaning =
    e.meaning[locale as keyof typeof e.meaning] || e.meaning.en;
  const exampleTr =
    e.example_translation[locale as keyof typeof e.example_translation] ||
    e.example_translation.en;
  const usageTip =
    e.usage_tip[locale as keyof typeof e.usage_tip] || e.usage_tip.en;

  return (
    <div className="rounded-lg border border-border bg-card transition-colors">
      {/* Collapsed header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{e.fr}</span>
            <span className="text-xs text-muted-foreground">{e.phonetic}</span>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {meaning}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {e.tags.includes("writing") && (
            <PenLine className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
          {e.tags.includes("speaking") && (
            <Mic className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none">
            {e.level}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
            {t(`categories.${e.category}`)}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/50 px-4 pb-4 pt-3 text-sm">
          {/* French meaning */}
          <p className="text-xs italic text-muted-foreground">
            {e.meaning.fr}
          </p>

          {/* Example */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {t("example")}
            </div>
            <p className="mt-1 text-foreground">
              &laquo;&nbsp;{e.example_fr}&nbsp;&raquo;
            </p>
            <p className="mt-0.5 text-muted-foreground">{exampleTr}</p>
          </div>

          {/* Usage tip */}
          <div className="mt-3 rounded-md bg-muted/50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              {t("usageTip")}
            </div>
            <p className="mt-1 text-foreground/90">{usageTip}</p>
          </div>

          {/* Tags */}
          <div className="mt-3 flex gap-1.5">
            {e.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag === "writing" ? (
                  <PenLine className="h-3 w-3" />
                ) : (
                  <Mic className="h-3 w-3" />
                )}
                {t(`tags.${tag}`)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
