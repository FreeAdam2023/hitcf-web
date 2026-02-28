"use client";

import { useState, useCallback } from "react";
import { ChevronDown, CheckCircle, AlertCircle, Headphones, BookOpen } from "lucide-react";
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
import { useTranslations } from "next-intl";
import type { WrongAnswerItem, WrongAnswerDetail } from "@/lib/api/types";
import { TYPE_COLORS } from "@/lib/constants";

const TYPE_ICONS: Record<string, React.ElementType> = {
  listening: Headphones,
  reading: BookOpen,
};

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

  const q = detail?.question;
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
                {/* 1. Answer comparison — options first */}
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

                {/* 2. Quick correct-reasoning summary */}
                {q.explanation?.correct_reasoning && (
                  <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50/50 px-3 py-2 dark:bg-emerald-950/30">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      {q.explanation.correct_reasoning}
                    </p>
                  </div>
                )}

                {/* 3. Audio (if listening) */}
                {q.audio_url && q.type === "listening" && (
                  <AudioPlayer questionId={detail!.question_id} />
                )}

                {/* 4. Context: passage + question text */}
                {q.passage && (
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

                {/* 5. Transcript */}
                {q.transcript && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t("wrongAnswers.card.transcript")}
                    </p>
                    <div className="whitespace-pre-line text-sm"><FrenchText text={q.transcript} /></div>
                  </div>
                )}

                {/* 6. Full explanation (vocab, distractors, tips) */}
                <ExplanationPanel explanation={q.explanation} />

                {/* 7. Bottom mastery button */}
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
