"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ChevronUp, Layers, Loader2, PenLine, Volume2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WordCard } from "@/components/practice/word-card";
import { ExportDialog } from "@/components/vocabulary/export-dialog";
import { listExpressionWords, getExpressionFilters, getExpressionStats } from "@/lib/api/vocabulary";
import { useFrenchSpeech } from "@/hooks/use-french-speech";
import { getLocalizedField } from "@/lib/test-name";
import type { PaginatedResponse, ExpressionWordItem, ExpressionFilters, ExpressionStats } from "@/lib/api/types";

export function ExpressionsPoolView() {
  const t = useTranslations();
  const locale = useLocale();
  const [data, setData] = useState<PaginatedResponse<ExpressionWordItem> | null>(null);
  const [filters, setFilters] = useState<ExpressionFilters | null>(null);
  const [stats, setStats] = useState<ExpressionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [cefrLevel, setCefrLevel] = useState<string | undefined>(undefined);
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { speak, playingWord } = useFrenchSpeech();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleWordClick = useCallback((word: string, el: HTMLElement) => {
    setSelectedWord(word);
    setAnchorEl(el);
  }, []);

  const handleWordCardClose = useCallback(() => {
    setSelectedWord(null);
    setAnchorEl(null);
  }, []);

  useEffect(() => {
    getExpressionFilters().then(setFilters).catch(() => {});
    getExpressionStats().then(setStats).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listExpressionWords({ category, cefr_level: cefrLevel, tag, page, page_size: 50 });
      setData(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [category, cefrLevel, tag, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategoryChange = (v: string) => {
    setCategory(v === "all" ? undefined : v);
    setPage(1);
  };

  const handleLevelChange = (v: string) => {
    setCefrLevel(v === "all" ? undefined : v);
    setPage(1);
  };

  const handleTagChange = (v: string) => {
    setTag(v === "all" ? undefined : v);
    setPage(1);
  };

  const hasFilter = !!(category || cefrLevel || tag);

  const flashcardHref = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (cefrLevel) params.set("cefr_level", cefrLevel);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return `/vocabulary/expressions/flashcard${qs ? `?${qs}` : ""}`;
  }, [category, cefrLevel, tag]);

  const dictationHref = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (cefrLevel) params.set("cefr_level", cefrLevel);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return `/vocabulary/expressions/dictation${qs ? `?${qs}` : ""}`;
  }, [category, cefrLevel, tag]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/vocabulary" className="hover:text-foreground">{t("vocabulary.title")}</Link>
          <span>/</span>
          <span>{t("vocabulary.expressions.title")}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("vocabulary.expressions.title")}
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("vocabulary.expressions.heroDesc")}</p>

        {/* Stats badges */}
        {stats && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stats.by_category).map(([cat, count]) => (
              <span
                key={cat}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {cat} · {count}
              </span>
            ))}
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {t("vocabulary.expressions.totalWords", { count: stats.total })}
            </span>
          </div>
        )}

        {/* CTA row */}
        {data && data.total > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Link href={flashcardHref}>
              <Button>
                <Layers className="mr-1.5 h-4 w-4" />
                {t("vocabulary.expressions.startFlashcard")}
              </Button>
            </Link>
            <ExportDialog
              wordCount={data.total}
              exportType="expression"
              exportParams={{ category, cefr_level: cefrLevel, tag }}
            />
            <Link href={dictationHref}>
              <Button variant="outline" size="sm">
                <PenLine className="mr-1.5 h-4 w-4" />
                {t("vocabulary.dictation.button")}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      {filters && (
        <div className="flex flex-wrap gap-3">
          <Select value={category || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("vocabulary.expressions.filterCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vocabulary.expressions.filterAll")}</SelectItem>
              {filters.categories.map((c) => (
                <SelectItem key={c.category} value={c.category}>
                  {getLocalizedField(locale, c.category_zh, null, null, c.category)} ({c.category}) · {c.count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cefrLevel || "all"} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("vocabulary.expressions.filterLevel")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vocabulary.expressions.filterAll")}</SelectItem>
              {filters.levels.map((lv) => (
                <SelectItem key={lv} value={lv}>{lv}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tag || "all"} onValueChange={handleTagChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("vocabulary.expressions.filterTag")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vocabulary.expressions.filterAll")}</SelectItem>
              {filters.tags.map((tg) => (
                <SelectItem key={tg} value={tg}>{tg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Word count */}
      {data && data.total > 0 && (
        <p className="text-sm text-muted-foreground">
          {t("vocabulary.expressions.totalWords", { count: data.total })}
          {hasFilter && stats && (
            <span> / {t("vocabulary.expressions.totalWords", { count: stats.total })}</span>
          )}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t("vocabulary.expressions.emptyTitle")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((item) => (
              <ExpressionRow
                key={item.id}
                item={item}
                onSpeak={(word, url) => speak(word, url)}
                onWordClick={handleWordClick}
                playingWord={playingWord}
                locale={locale}
              />
            ))}

            {selectedWord && anchorEl && (
              <WordCard
                word={selectedWord}
                anchorEl={anchorEl}
                onClose={handleWordCardClose}
              />
            )}
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t("common.pagination.prev")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {data.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("common.pagination.next")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ExpressionRow({
  item,
  onSpeak,
  onWordClick,
  playingWord,
  locale,
}: {
  item: ExpressionWordItem;
  onSpeak: (word: string, url: string | null) => void;
  onWordClick: (word: string, el: HTMLElement) => void;
  playingWord: string | null;
  locale: string;
}) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border px-4 py-2.5 transition-colors hover:bg-accent/30">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Row 1: expression + meaning */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={(e) => onWordClick(item.expression, e.currentTarget)}
              className="text-base font-semibold text-left hover:text-primary hover:underline underline-offset-2 transition-colors cursor-pointer"
            >
              {item.display_form}
            </button>
            {getLocalizedField(locale, item.meaning_zh, item.meaning_en, item.meaning_ar) && (
              <span className="text-sm">{getLocalizedField(locale, item.meaning_zh, item.meaning_en, item.meaning_ar)}</span>
            )}
          </div>
          {/* Row 2: IPA + audio + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.ipa && <span className="text-xs text-muted-foreground font-mono">{item.ipa}</span>}
            <button
              onClick={() => onSpeak(item.expression, item.audio_url)}
              className="rounded-full p-0.5 hover:bg-muted transition-colors"
            >
              <Volume2 className={`h-3.5 w-3.5 ${playingWord === item.expression ? "text-blue-500" : "text-muted-foreground"}`} />
            </button>
            {item.cefr_level && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0" title="CEFR">{item.cefr_level}</Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {getLocalizedField(locale, item.category_zh, null, null, item.category)}
            </Badge>
            {item.tags.map((tg) => (
              <Badge key={tg} variant="secondary" className="text-[10px] px-1 py-0">{tg}</Badge>
            ))}
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-auto rounded-full p-0.5 hover:bg-muted transition-colors cursor-pointer"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="mt-2 space-y-1.5 border-t pt-2 text-sm text-muted-foreground">
          {item.example_fr && (
            <div>
              <span className="font-medium text-foreground">{t("vocabulary.expressions.example")}:</span>{" "}
              <span className="italic">{item.example_fr}</span>
              {getLocalizedField(locale, item.example_zh, item.example_en, item.example_ar) && (
                <span className="ml-2">{getLocalizedField(locale, item.example_zh, item.example_en, item.example_ar)}</span>
              )}
            </div>
          )}
          {getLocalizedField(locale, item.tcf_tip_zh, item.tcf_tip_en, item.tcf_tip_ar) && (
            <div>
              <span className="font-medium text-foreground">{t("vocabulary.expressions.tcfTip")}:</span>{" "}
              {getLocalizedField(locale, item.tcf_tip_zh, item.tcf_tip_en, item.tcf_tip_ar)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
