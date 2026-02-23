"use client";

import { useState, useCallback } from "react";
import { ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
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
import { OptionList } from "@/components/practice/option-list";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import { getWrongAnswerDetail } from "@/lib/api/wrong-answers";
import type { WrongAnswerItem, WrongAnswerDetail } from "@/lib/api/types";

import { TYPE_LABELS, TYPE_COLORS } from "@/lib/constants";

interface WrongAnswerCardProps {
  item: WrongAnswerItem;
  onToggleMastered: (id: string) => void;
}

export function WrongAnswerCard({ item, onToggleMastered }: WrongAnswerCardProps) {
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

  return (
    <Card>
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild>
          <CardContent className="flex cursor-pointer items-start gap-3 pt-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {item.question_number && (
                  <span className="text-sm font-medium text-muted-foreground">
                    #{item.question_number}
                  </span>
                )}
                {item.question_type && (
                  <Badge
                    variant="outline"
                    className={TYPE_COLORS[item.question_type]?.badge ?? ""}
                  >
                    {TYPE_LABELS[item.question_type] || item.question_type}
                  </Badge>
                )}
                {item.level && <Badge variant="secondary">{item.level}</Badge>}
                <span className="text-xs text-muted-foreground">
                  错误 {item.wrong_count} 次
                </span>
              </div>
              {item.question_text && (
                <p className="text-sm line-clamp-2">{item.question_text}</p>
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
                {item.is_mastered ? "已掌握" : "标记掌握"}
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
          <div className="border-t px-6 py-4 space-y-4">
            {loadingDetail ? (
              <p className="text-sm text-muted-foreground">加载中...</p>
            ) : q ? (
              <>
                {/* Passage */}
                {q.passage && (
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {q.passage}
                    </p>
                  </div>
                )}

                {/* Question text */}
                {q.question_text && (
                  <p className="text-sm font-medium">{q.question_text}</p>
                )}

                {/* Audio */}
                {q.audio_url && q.type === "listening" && (
                  <AudioPlayer questionId={detail!.question_id} />
                )}

                {/* Options with highlighting */}
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

                {/* Transcript */}
                {q.transcript && (
                  <div className="rounded-md border p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      听力原文
                    </p>
                    <p className="whitespace-pre-line text-sm">{q.transcript}</p>
                  </div>
                )}

                {/* Explanation */}
                <ExplanationPanel explanation={q.explanation} />
              </>
            ) : detailError ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>加载详情失败</span>
                <Button variant="outline" size="sm" onClick={loadDetail}>
                  重试
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">无法加载题目详情</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

