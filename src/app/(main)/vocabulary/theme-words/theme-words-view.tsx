"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Loader2, PenLine, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WordCard } from "@/components/practice/word-card";
import { ExportDialog } from "@/components/vocabulary/export-dialog";
import { listThemeWords, getThemeFilters, getThemeStats } from "@/lib/api/vocabulary";
import { useFrenchSpeech } from "@/hooks/use-french-speech";
import type { PaginatedResponse, ThemeWordItem, ThemeFilters, ThemeStats, ThemeTagInfo } from "@/lib/api/types";

export function ThemeWordsView() {
  const t = useTranslations();
  const [data, setData] = useState<PaginatedResponse<ThemeWordItem> | null>(null);
  const [filters, setFilters] = useState<ThemeFilters | null>(null);
  const [stats, setStats] = useState<ThemeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { speak, playing } = useFrenchSpeech();
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
    getThemeFilters().then(setFilters).catch(() => {});
    getThemeStats().then(setStats).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listThemeWords({ tag, tag_category: category, page, page_size: 50 });
      setData(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tag, category, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategoryChange = (v: string) => {
    setCategory(v === "all" ? undefined : v);
    setTag(undefined);
    setPage(1);
  };

  const handleTagChange = (v: string) => {
    setTag(v === "all" ? undefined : v);
    setPage(1);
  };

  // Filter tags by selected category
  const filteredTags: ThemeTagInfo[] = filters?.tags.filter(
    (t) => !category || t.tag_category === category
  ) || [];

  const hasFilter = !!(category || tag);

  const flashcardHref = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("tag_category", category);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return `/vocabulary/theme-words/flashcard${qs ? `?${qs}` : ""}`;
  }, [category, tag]);

  const dictationHref = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("tag_category", category);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return `/vocabulary/theme-words/dictation${qs ? `?${qs}` : ""}`;
  }, [category, tag]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/vocabulary" className="hover:text-foreground">{t("vocabulary.title")}</Link>
          <span>/</span>
          <span>{t("vocabulary.themeWords.title")}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("vocabulary.themeWords.title")}
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("vocabulary.themeWords.heroDesc")}</p>

        {/* Stats badges */}
        {stats && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stats.by_category).map(([cat, info]) => (
              <span
                key={cat}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {cat} · {info.tag_count} 主题 · {info.word_count} 词
              </span>
            ))}
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {t("vocabulary.themeWords.totalWords", { count: stats.total })}
            </span>
          </div>
        )}

        {/* CTA row */}
        {data && data.total > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Link href={flashcardHref}>
              <Button>
                <Layers className="mr-1.5 h-4 w-4" />
                {t("vocabulary.themeWords.startFlashcard")}
              </Button>
            </Link>
            <ExportDialog
              wordCount={data.total}
              exportType="theme"
              exportParams={{ tag, tag_category: category }}
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
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("vocabulary.themeWords.filterCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vocabulary.themeWords.filterAll")}</SelectItem>
              {filters.categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tag || "all"} onValueChange={handleTagChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("vocabulary.themeWords.filterTag")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vocabulary.themeWords.filterAll")}</SelectItem>
              {filteredTags.map((t) => (
                <SelectItem key={t.tag} value={t.tag}>
                  {t.tag_zh} ({t.tag}) · {t.count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Word count */}
      {data && data.total > 0 && (
        <p className="text-sm text-muted-foreground">
          {t("vocabulary.themeWords.wordCount", { total: data.total })}
          {hasFilter && stats && (
            <span>{t("vocabulary.themeWords.wordCountFiltered", { total: stats.total })}</span>
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
          <p className="text-lg font-medium text-muted-foreground">{t("vocabulary.themeWords.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("vocabulary.themeWords.emptyDesc")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((item) => (
              <ThemeWordRow
                key={item.id}
                item={item}
                onSpeak={(word, url) => speak(word, url)}
                onWordClick={handleWordClick}
                playing={playing}
                showTag={!tag}
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

function ThemeWordRow({
  item,
  onSpeak,
  onWordClick,
  playing,
  showTag,
}: {
  item: ThemeWordItem;
  onSpeak: (word: string, url: string | null) => void;
  onWordClick: (word: string, el: HTMLElement) => void;
  playing: boolean;
  showTag: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors hover:bg-accent/30">
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Row 1: word + meaning */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={(e) => onWordClick(item.word, e.currentTarget)}
            className="text-base font-semibold text-left hover:text-primary hover:underline underline-offset-2 transition-colors cursor-pointer"
          >
            {item.display_form}
          </button>
          {item.meaning_zh && <span className="text-sm">{item.meaning_zh}</span>}
        </div>
        {/* Row 2: IPA + audio + badges */}
        <div className="flex items-center gap-2">
          {item.ipa && <span className="text-xs text-muted-foreground font-mono">{item.ipa}</span>}
          <button
            onClick={() => onSpeak(item.word, item.audio_url)}
            className="rounded-full p-0.5 hover:bg-muted transition-colors"
          >
            <Volume2 className={`h-3.5 w-3.5 ${playing ? "text-blue-500" : "text-muted-foreground"}`} />
          </button>
          {item.cefr_level && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0" title="CEFR">{item.cefr_level}</Badge>
          )}
          {item.part_of_speech && item.part_of_speech !== "OTHER" && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">{item.part_of_speech}</Badge>
          )}
        </div>
      </div>
      {/* Right side: tag badge */}
      {showTag && (
        <span className="shrink-0 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-[10px] text-violet-700 dark:text-violet-300">
          {item.tag_zh}
        </span>
      )}
    </div>
  );
}
