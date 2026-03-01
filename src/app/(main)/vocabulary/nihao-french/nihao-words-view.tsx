"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Layers, Loader2, PenLine, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportDialog } from "@/components/vocabulary/export-dialog";
import { listNihaoWords, getNihaoFilters, exportNihaoWords } from "@/lib/api/vocabulary";
import { useFrenchSpeech } from "@/hooks/use-french-speech";
import type { PaginatedResponse, NihaoWordItem, NihaoFilters } from "@/lib/api/types";

export function NihaoWordsView() {
  const t = useTranslations();
  const [data, setData] = useState<PaginatedResponse<NihaoWordItem> | null>(null);
  const [filters, setFilters] = useState<NihaoFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<string | undefined>(undefined);
  const [lesson, setLesson] = useState<number | undefined>(undefined);
  const [theme, setTheme] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { speak, playing } = useFrenchSpeech();

  useEffect(() => {
    getNihaoFilters().then(setFilters).catch(() => {});
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/vocabulary" className="hover:text-foreground">{t("vocabulary.title")}</Link>
            <span>/</span>
            <span>{t("vocabulary.nihaoFrench.title")}</span>
          </div>
          <h1 className="text-2xl font-bold">{t("vocabulary.nihaoFrench.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("vocabulary.nihaoFrench.subtitle")}</p>
        </div>
        {data && data.total > 0 && (
          <div className="flex items-center gap-2">
            <ExportDialog
              wordCount={data.total}
              onExport={() => exportNihaoWords(level, lesson, theme)}
            />
            <Link href={`/vocabulary/nihao-french/dictation${level ? `?level=${level}` : ""}${lesson != null ? `${level ? "&" : "?"}lesson=${lesson}` : ""}`}>
              <Button variant="outline" size="sm">
                <PenLine className="mr-1.5 h-4 w-4" />
                {t("vocabulary.dictation.button")}
              </Button>
            </Link>
            <Link href={`/vocabulary/nihao-french/flashcard${level ? `?level=${level}` : ""}${lesson != null ? `${level ? "&" : "?"}lesson=${lesson}` : ""}`}>
              <Button variant="outline" size="sm">
                <Layers className="mr-1.5 h-4 w-4" />
                {t("vocabulary.mySaved.flashcardReview")}
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
                playing={playing}
                t={t}
              />
            ))}
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
  playing,
  t,
}: {
  item: NihaoWordItem;
  onSpeak: (word: string, url: string | null) => void;
  playing: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/30">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-semibold">{item.display_form}</span>
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
        {/* Meanings */}
        <div className="text-sm">
          {item.meaning_zh && <span>{item.meaning_zh}</span>}
          {item.meaning_en && item.meaning_zh && <span className="mx-1.5 text-muted-foreground">·</span>}
          {item.meaning_en && <span className="text-muted-foreground">{item.meaning_en}</span>}
        </div>
        {/* Source tag */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px] px-1 py-0">{item.level}</Badge>
          <span>{t("vocabulary.nihaoFrench.lesson", { num: item.lesson })}</span>
          {item.lesson_title && <span>· {item.lesson_title}</span>}
          {item.theme && <span>· {item.theme}</span>}
        </div>
        {/* Example */}
        {item.example_fr && (
          <p className="text-xs text-muted-foreground italic line-clamp-2">
            {item.example_fr}
            {item.example_zh && <span className="not-italic ml-2">— {item.example_zh}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
