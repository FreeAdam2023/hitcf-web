"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronDown, AlertCircle, Headphones, BookOpen, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AudioPlayer } from "@/components/practice/audio-player";
import { FrenchText } from "@/components/practice/french-text";
import { OptionList } from "@/components/practice/option-list";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import { getBookmarkDetail } from "@/lib/api/bookmarks";
import { getImageUrl } from "@/lib/api/media";
import { useTranslations } from "next-intl";
import type { BookmarkItem, BookmarkDetail } from "@/lib/api/types";
import { TYPE_COLORS } from "@/lib/constants";

const TYPE_ICONS: Record<string, React.ElementType> = {
  listening: Headphones,
  reading: BookOpen,
};

interface BookmarkCardProps {
  item: BookmarkItem;
  onRemove: (id: string) => void;
}

export function BookmarkCard({ item, onRemove }: BookmarkCardProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<BookmarkDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoadingDetail(true);
    setDetailError(false);
    try {
      const d = await getBookmarkDetail(item.id);
      setDetail(d);
    } catch {
      setDetailError(true);
    } finally {
      setLoadingDetail(false);
    }
  }, [item.id]);

  const handleOpenChange = useCallback(
    async (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen && !detail && !detailError) {
        loadDetail();
      }
    },
    [detail, detailError, loadDetail],
  );

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const q = detail?.question;
  const isListening = q?.type === "listening";

  useEffect(() => {
    if (!q?.has_image || !detail?.question_id) return;
    setImageLoading(true);
    getImageUrl(detail.question_id)
      .then((res) => setImageSrc(res.url))
      .catch(() => setImageSrc(null))
      .finally(() => setImageLoading(false));
  }, [q?.has_image, detail?.question_id]);

  const colors = TYPE_COLORS[item.question_type || ""];
  const Icon = TYPE_ICONS[item.question_type || ""] || AlertCircle;

  return (
    <Card className="overflow-hidden">
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild>
          <CardContent className="flex cursor-pointer items-start gap-3 pt-4">
            <div
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                colors?.iconBg || "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {item.test_set_name && (
                  <span className="text-xs text-muted-foreground">{item.test_set_name}</span>
                )}
                {item.question_number && (
                  <span className="text-sm font-medium">#{item.question_number}</span>
                )}
                {item.question_type && (
                  <Badge
                    variant="outline"
                    className={TYPE_COLORS[item.question_type]?.badge ?? ""}
                  >
                    {t(`common.types.${item.question_type}`)}
                  </Badge>
                )}
                {item.level && <Badge variant="secondary">{item.level}</Badge>}
              </div>
              {item.question_text && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.question_text}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-500 hover:text-yellow-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
              >
                <Star className="mr-1 h-3.5 w-3.5 fill-current" />
                {t("review.bookmarks.remove")}
              </Button>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  open && "rotate-180",
                )}
              />
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-4 border-t px-6 py-4">
            {loadingDetail ? (
              <p className="text-sm text-muted-foreground">{t("wrongAnswers.card.loading")}</p>
            ) : q ? (
              <>
                {isListening && (imageLoading || imageSrc) && (
                  <div className="flex justify-center">
                    {imageLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageSrc}
                        alt={`Question ${q.question_number}`}
                        className="max-h-64 rounded-md border"
                      />
                    ) : null}
                  </div>
                )}

                {isListening && q.audio_url && (
                  <AudioPlayer questionId={detail!.question_id} />
                )}

                {!isListening && q.passage && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      <FrenchText text={q.passage} />
                    </div>
                  </div>
                )}

                {q.question_text && (
                  <p className="text-sm font-medium">
                    <FrenchText text={q.question_text} />
                  </p>
                )}

                {q.options && q.options.length > 0 && (
                  <OptionList
                    options={q.options}
                    answer={null}
                    onSelect={() => {}}
                    disabled
                    readonly
                    correctAnswer={q.correct_answer}
                  />
                )}

                {q.explanation?.correct_reasoning && (
                  <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50/50 px-3 py-2 dark:bg-emerald-950/30">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      {q.explanation.correct_reasoning}
                    </p>
                  </div>
                )}
                <ExplanationPanel explanation={q.explanation} />

                {isListening && q.transcript && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t("wrongAnswers.card.transcript")}
                    </p>
                    <div className="whitespace-pre-line text-sm"><FrenchText text={q.transcript} /></div>
                  </div>
                )}
              </>
            ) : detailError ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{t("wrongAnswers.card.loadFailed")}</span>
                <Button variant="outline" size="sm" onClick={loadDetail}>
                  {t("wrongAnswers.card.retry")}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("wrongAnswers.card.loadError")}</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
