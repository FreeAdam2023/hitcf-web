"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2, Volume2, Layers, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportDialog } from "@/components/vocabulary/export-dialog";
import { listSavedWords, unsaveWord, exportSavedWords } from "@/lib/api/vocabulary";
import { useFrenchSpeech } from "@/hooks/use-french-speech";
import type { PaginatedResponse, SavedWordItem } from "@/lib/api/types";

const SOURCE_TYPES = ["listening", "reading", "speaking", "writing"] as const;
type SourceType = (typeof SOURCE_TYPES)[number];

function isSourceType(v: string | null): v is SourceType {
  return v !== null && (SOURCE_TYPES as readonly string[]).includes(v);
}

export function SavedWordsView() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [data, setData] = useState<PaginatedResponse<SavedWordItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [sourceType, setSourceType] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { speak, playing } = useFrenchSpeech();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listSavedWords({
        source_type: sourceType,
        page,
        page_size: 20,
      });
      setData(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [sourceType, page]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [session?.user, fetchData]);

  const handleDelete = async (word: string) => {
    try {
      await unsaveWord(word);
      // Remove from local state
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((i) => i.word !== word),
              total: prev.total - 1,
            }
          : prev,
      );
    } catch {
      // ignore
    }
  };

  const handleFilterChange = (type: string | undefined) => {
    setSourceType(type);
    setPage(1);
  };

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">{t("vocabulary.mySaved.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("vocabulary.loginHint")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/vocabulary" className="hover:text-foreground">{t("vocabulary.title")}</Link>
            <span>/</span>
            <span>{t("vocabulary.mySaved.title")}</span>
          </div>
          <h1 className="text-2xl font-bold">{t("vocabulary.mySaved.title")}</h1>
        </div>
        {data && data.total > 0 && (
          <div className="flex items-center gap-2">
            <ExportDialog
              wordCount={data.total}
              onExport={() => exportSavedWords(sourceType)}
            />
            <Link href="/vocabulary/my-saved/dictation">
              <Button variant="outline" size="sm">
                <PenLine className="mr-1.5 h-4 w-4" />
                {t("vocabulary.dictation.button")}
              </Button>
            </Link>
            <Link href="/vocabulary/my-saved/flashcard">
              <Button variant="outline" size="sm">
                <Layers className="mr-1.5 h-4 w-4" />
                {t("vocabulary.mySaved.flashcardReview")}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange(undefined)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            !sourceType ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          {t("vocabulary.mySaved.filterAll")}
        </button>
        {SOURCE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              sourceType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {t(`common.types.${type}`)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t("vocabulary.mySaved.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("vocabulary.mySaved.emptyDesc")}</p>
          <Link href="/tests">
            <Button variant="outline" className="mt-4">{t("vocabulary.mySaved.goToTests")}</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((item) => (
              <SavedWordRow
                key={item.id}
                item={item}
                onDelete={handleDelete}
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

function SavedWordRow({
  item,
  onDelete,
  onSpeak,
  playing,
  t,
}: {
  item: SavedWordItem;
  onDelete: (word: string) => void;
  onSpeak: (word: string, url: string | null) => void;
  playing: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/30">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-semibold">{item.display_form || item.word}</span>
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
        {item.source_type && isSourceType(item.source_type) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{t(`common.types.${item.source_type}`)}</span>
            {item.test_set_name && <span>· {item.test_set_name}</span>}
            {item.question_number && <span>· Q{item.question_number}</span>}
          </div>
        )}
        {/* Sentence context */}
        {item.sentence && (
          <p className="text-xs text-muted-foreground italic line-clamp-2">{item.sentence}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(item.word)}
        className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        title={t("vocabulary.mySaved.remove")}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
