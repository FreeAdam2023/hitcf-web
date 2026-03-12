"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronDown, CheckCircle, AlertCircle, Headphones, BookOpen, Clock, Loader2 } from "lucide-react";
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
import { getWrongAnswerDetail } from "@/lib/api/wrong-answers";
import { getImageUrl } from "@/lib/api/media";
import { useTranslations } from "next-intl";
import type { WrongAnswerItem, WrongAnswerDetail } from "@/lib/api/types";
import { TYPE_COLORS } from "@/lib/constants";

const TYPE_ICONS: Record<string, React.ElementType> = {
  listening: Headphones,
  reading: BookOpen,
};

function formatRelativeTime(isoStr: string | null | undefined): string {
  if (!isoStr) return "";
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

/** Left border color based on wrong frequency */
function wrongCountBorder(item: WrongAnswerItem): string {
  if (item.is_mastered) return "";
  if (item.wrong_count >= 5) return "border-l-4 border-l-red-500";
  if (item.wrong_count >= 3) return "border-l-4 border-l-orange-400";
  return "";
}

interface WrongAnswerCardProps {
  item: WrongAnswerItem;
  onToggleMastered: (id: string) => void;
}

export function WrongAnswerCard({ item, onToggleMastered }: WrongAnswerCardProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<WrongAnswerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoadingDetail(true);
    setDetailError(false);
    try {
      const d = await getWrongAnswerDetail(item.id);
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

  // Image loading for listening questions
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
    <Card className={cn("overflow-hidden", wrongCountBorder(item))}>
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild>
          <CardContent className="flex cursor-pointer items-start gap-3 pt-4">
            {/* Type icon */}
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
                <span className="text-xs font-medium text-red-500">
                  {t("wrongAnswers.card.wrongCount", { count: item.wrong_count })}
                </span>
                {item.last_wrong_at && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
                    <Clock className="h-2.5 w-2.5" />
                    {formatRelativeTime(item.last_wrong_at)}
                  </span>
                )}
              </div>
              {item.question_text && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.question_text}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant={item.is_mastered ? "secondary" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMastered(item.id);
                }}
              >
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                {item.is_mastered
                  ? t("wrongAnswers.card.mastered")
                  : t("wrongAnswers.card.markMastered")}
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
                {/* 1. Image (listening only) */}
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

                {/* 2. Audio (listening only) */}
                {isListening && q.audio_url && (
                  <AudioPlayer questionId={detail!.question_id} />
                )}

                {/* 3. Passage (reading only) */}
                {!isListening && q.passage && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      <FrenchText text={q.passage} />
                    </div>
                  </div>
                )}

                {/* 4. Question text */}
                {q.question_text && (
                  <p className="text-sm font-medium">
                    <FrenchText text={q.question_text} />
                  </p>
                )}

                {/* 5. Options with correct/wrong highlighting */}
                {q.options && q.options.length > 0 && (
                  <OptionList
                    options={q.options}
                    answer={null}
                    onSelect={() => {}}
                    disabled
                    readonly
                    correctAnswer={q.correct_answer}
                    lastSelected={detail!.last_selected}
                  />
                )}

                {/* 6. Explanation */}
                {q.explanation?.correct_reasoning && (
                  <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50/50 px-3 py-2 dark:bg-emerald-950/30">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      {q.explanation.correct_reasoning}
                    </p>
                  </div>
                )}
                <ExplanationPanel explanation={q.explanation} />

                {/* 7. Transcript (listening only, at the end) */}
                {isListening && q.transcript && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t("wrongAnswers.card.transcript")}
                    </p>
                    <div className="whitespace-pre-line text-sm"><FrenchText text={q.transcript} /></div>
                  </div>
                )}

                {/* 8. Bottom mastery button */}
                {!item.is_mastered && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => onToggleMastered(item.id)}
                  >
                    <CheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
                    {t("wrongAnswers.card.understoodIt")}
                  </Button>
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
