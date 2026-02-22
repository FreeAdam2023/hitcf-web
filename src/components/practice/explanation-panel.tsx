"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Explanation } from "@/lib/api/types";

interface ExplanationPanelProps {
  explanation: Explanation | null | undefined;
}

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  const [open, setOpen] = useState(false);

  const hasContent =
    explanation &&
    (explanation.correct_reasoning ||
      explanation.sentence_translation?.length ||
      explanation.vocabulary?.length ||
      explanation.distractors ||
      explanation.exam_skill ||
      explanation.trap_pattern ||
      explanation.similar_tip);

  return (
    <div className="rounded-md border">
      <Button
        variant="ghost"
        className="w-full justify-between px-4 py-2"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4" />
          查看解析
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {open && (
        <div className="border-t px-4 py-3 text-sm">
          {!hasContent ? (
            <p className="text-muted-foreground">解析即将推出，敬请期待。</p>
          ) : (
            <div className="space-y-3">
              {explanation!.correct_reasoning && (
                <div>
                  <h4 className="mb-1 font-medium">答案解析</h4>
                  <p className="text-muted-foreground">
                    {explanation!.correct_reasoning}
                  </p>
                </div>
              )}

              {explanation!.sentence_translation &&
                explanation!.sentence_translation.length > 0 && (
                  <div>
                    <h4 className="mb-1 font-medium">句子翻译</h4>
                    <div className="space-y-1">
                      {explanation!.sentence_translation.map((s, i) => (
                        <div key={i} className="text-muted-foreground">
                          <span className="text-foreground">{s.fr}</span>
                          {s.zh && <span className="ml-2">— {s.zh}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {explanation!.distractors &&
                Object.keys(explanation!.distractors).length > 0 && (
                  <div>
                    <h4 className="mb-1 font-medium">干扰项分析</h4>
                    <div className="space-y-1">
                      {Object.entries(explanation!.distractors).map(
                        ([key, d]) => (
                          <div key={key} className="text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {key}:
                            </span>{" "}
                            {d.analysis || d.text}
                            {d.trap_type && (
                              <span className="ml-1 text-xs">
                                ({d.trap_type})
                              </span>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {explanation!.vocabulary &&
                explanation!.vocabulary.length > 0 && (
                  <div>
                    <h4 className="mb-1 font-medium">重点词汇</h4>
                    <div className="flex flex-wrap gap-2">
                      {explanation!.vocabulary.map((v, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs"
                        >
                          {v.word} — {v.meaning}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {explanation!.exam_skill && (
                <div>
                  <h4 className="mb-1 font-medium">考试技巧</h4>
                  <p className="text-muted-foreground">
                    {explanation!.exam_skill}
                  </p>
                </div>
              )}

              {explanation!.trap_pattern && (
                <div>
                  <h4 className="mb-1 font-medium">陷阱模式</h4>
                  <p className="text-muted-foreground">
                    {explanation!.trap_pattern}
                  </p>
                </div>
              )}

              {explanation!.similar_tip && (
                <div>
                  <h4 className="mb-1 font-medium">类似题提示</h4>
                  <p className="text-muted-foreground">
                    {explanation!.similar_tip}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
