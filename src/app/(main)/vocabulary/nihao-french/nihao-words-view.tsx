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
import { listNihaoWords, getNihaoFilters, getNihaoStats, exportNihaoWords } from "@/lib/api/vocabulary";
import { useFrenchSpeech } from "@/hooks/use-french-speech";
import type { PaginatedResponse, NihaoWordItem, NihaoFilters, NihaoStats } from "@/lib/api/types";

export function NihaoWordsView() {
  const t = useTranslations();
  const [data, setData] = useState<PaginatedResponse<NihaoWordItem> | null>(null);
  const [filters, setFilters] = useState<NihaoFilters | null>(null);
  const [nihaoStats, setNihaoStats] = useState<NihaoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<string | undefined>(undefined);
  const [lesson, setLesson] = useState<number | undefined>(undefined);
  const [theme, setTheme] = useState<string | undefined>(undefined);
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
    getNihaoFilters().then(setFilters).catch(() => {});
    getNihaoStats().then(setNihaoStats).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listNihaoWords({ level, lesson, theme, page, page_size: 50 });
      setData(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [level, lesson, theme, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLevelChange = (v: string) => {
    setLevel(v === "all" ? undefined : v);
    setLesson(undefined);
    setPage(1);
  };

  const handleLessonChange = (v: string) => {
    setLesson(v === "all" ? undefined : Number(v));
    setPage(1);
  };

  const handleThemeChange = (v: string) => {
    setTheme(v === "all" ? undefined : v);
    setPage(1);
  };

  const filteredLessons = filters?.lessons.filter((l) => !level || l.level === level) || [];

  const hasFilter = !!(level || lesson != null || theme);

  const flashcardHref = useMemo(() => {
    const params = new URLSearchParams();
    if (level) params.set("level", level);
    if (lesson != null) params.set("lesson", String(lesson));
    const qs = params.toString();
    return `/vocabulary/nihao-french/flashcard${qs ? `?${qs}` : ""}`;
  }, [level, lesson]);

  const dictationHref = useMemo(() => {
    const params = new URLSearchParams();
    if (level) params.set("level", level);
    if (lesson != null) params.set("lesson", String(lesson));
    const qs = params.toString();
    return `/vocabulary/nihao-french/dictation${qs ? `?${qs}` : ""}`;
  }, [level, lesson]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/vocabulary" className="hover:text-foreground">{t("vocabulary.title")}</Link>
          <span>/</span>
          <span>{t("vocabulary.nihaoFrench.title")}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("vocabulary.nihaoFrench.title")}
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("vocabulary.nihaoFrench.heroDesc")}</p>

        {/* Stats badges */}
        {nihaoStats && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(nihaoStats.by_level).map(([lvl, count]) => (
              <span
                key={lvl}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {lvl} · {count}
              </span>
            ))}
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {t("vocabulary.nihaoFrench.totalWords", { count: nihaoStats.total })}
            </span>
          </div>
        )}

        {/* CTA row */}
        {data && data.total > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Link href={flashcardHref}>
              <Button>
                <Layers className="mr-1.5 h-4 w-4" />
                {t("vocabulary.nihaoFrench.startFlashcard")}
              </Button>
            </Link>
            <ExportDialog
              wordCount={data.total}
              onExport={() => exportNihaoWords(level, lesson, theme)}
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
          <Select value={level || "all"} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t("vocabulary.nihaoFrench.filterLevel")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vocabulary.nihaoFrench.filterAll")}</SelectItem>
              {filters.levels.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={lesson != null ? String(lesson) : "all"} onValueChange={handleLessonChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("vocabulary.nihaoFrench.filterLesson")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vocabulary.nihaoFrench.filterAll")}</SelectItem>
              {filteredLessons.map((l) => (
                <SelectItem key={`${l.level}-${l.lesson}`} value={String(l.lesson)}>
                  {t("vocabulary.nihaoFrench.lesson", { num: l.lesson })}
                  {l.lesson_title ? ` — ${l.lesson_title}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filters.themes.length > 0 && (
            <Select value={theme || "all"} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("vocabulary.nihaoFrench.filterTheme")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("vocabulary.nihaoFrench.filterAll")}</SelectItem>
                {filters.themes.map((th) => (
                  <SelectItem key={th} value={th}>{th}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Word count stats */}
      {data && data.total > 0 && (
        <p className="text-sm text-muted-foreground">
          {t("vocabulary.nihaoFrench.wordCount", { total: data.total })}
          {hasFilter && nihaoStats && (
            <span>{t("vocabulary.nihaoFrench.wordCountFiltered", { total: nihaoStats.total })}</span>
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
          <p className="text-lg font-medium text-muted-foreground">{t("vocabulary.nihaoFrench.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("vocabulary.nihaoFrench.emptyDesc")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((item) => (
              <NihaoWordRow
                key={item.id}
                item={item}
                onSpeak={(word, url) => speak(word, url)}
                onWordClick={handleWordClick}
                playing={playing}
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

function NihaoWordRow({
  item,
  onSpeak,
  onWordClick,
  playing,
}: {
  item: NihaoWordItem;
  onSpeak: (word: string, url: string | null) => void;
  onWordClick: (word: string, el: HTMLElement) => void;
  playing: boolean;
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
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.cefr_level}</Badge>
          )}
          {item.part_of_speech && item.part_of_speech !== "OTHER" && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">{item.part_of_speech}</Badge>
          )}
        </div>
      </div>
      {/* Right side: level badge */}
      <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">{item.level}</Badge>
    </div>
  );
}
