"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  Link2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { generateExplanation } from "@/lib/api/questions";
import type { Explanation } from "@/lib/api/types";

interface ExplanationPanelProps {
  explanation: Explanation | null | undefined;
  questionId?: string;
  defaultOpen?: boolean;
  transcript?: string | null;
  onLoaded?: (exp: Explanation) => void;
}

export function ExplanationPanel({
  explanation: initialExplanation,
  questionId,
  defaultOpen = false,
  transcript,
  onLoaded,
}: ExplanationPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [explanation, setExplanation] = useState(initialExplanation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [distractorsOpen, setDistractorsOpen] = useState(false);

  // Sync with prop changes (e.g. navigating between questions)
  useEffect(() => {
    setExplanation(initialExplanation);
    setOpen(defaultOpen);
    setLoading(false);
    setError(false);
    setDistractorsOpen(false);
  }, [initialExplanation, questionId, defaultOpen]);

  const hasContent =
    explanation &&
    (explanation.correct_reasoning ||
      explanation.sentence_translation?.length ||
      explanation.vocabulary?.length ||
      explanation.distractors ||
      explanation.exam_skill ||
      explanation.trap_pattern ||
      explanation.similar_tip);

  // Auto-fetch when expanded and no explanation available
  useEffect(() => {
    if (!open || hasContent || loading || error || !questionId) return;

    let cancelled = false;
    setLoading(true);

    generateExplanation(questionId)
      .then((data) => {
        if (!cancelled) {
          setExplanation(data);
          onLoaded?.(data);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasContent, questionId, error]);

  const hasLearningTips =
    explanation?.exam_skill ||
    explanation?.trap_pattern ||
    explanation?.similar_tip;

  // Only show refresh button on dev/localhost (not on www/prod)
  const [isDevHost, setIsDevHost] = useState(false);
  useEffect(() => {
    const host = window.location.hostname;
    setIsDevHost(
      host === "localhost" ||
        host === "127.0.0.1" ||
        host.startsWith("dev."),
    );
  }, []);

  const handleForceRefresh = () => {
    if (!questionId || loading) return;
    setLoading(true);
    setError(false);
    generateExplanation(questionId, true)
      .then((data) => { setExplanation(data); onLoaded?.(data); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

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
          {/* 1. 原文 (transcript) — 保持现状 */}
          {transcript && (
            <div className="mb-3 rounded-lg bg-muted/50 p-3">
              <h4 className="mb-1.5 flex items-center gap-1.5 font-medium">
                <FileText className="h-4 w-4" />
                原文
              </h4>
              <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                {transcript}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在加载解析...
            </div>
          ) : error ? (
            <p className="text-muted-foreground">
              加载失败，
              <button
                className="underline hover:text-foreground"
                onClick={() => {
                  setError(false);
                  setLoading(false);
                  setExplanation(null);
                }}
              >
                点击重试
              </button>
            </p>
          ) : !hasContent ? (
            <p className="text-muted-foreground">
              解析即将推出，敬请期待。
            </p>
          ) : (
            <div className="space-y-3">
              {/* Dev-only: force refresh button */}
              {isDevHost && questionId && (
                <div className="flex justify-end">
                  <button
                    onClick={handleForceRefresh}
                    disabled={loading}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                  >
                    <RefreshCw className="h-3 w-3" />
                    强制刷新
                  </button>
                </div>
              )}

              {/* 2. 答案解析 — Hero Section */}
              {explanation!.correct_reasoning && (
                <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50/50 p-3 dark:bg-emerald-950/20">
                  <h4 className="mb-1 font-medium">答案解析</h4>
                  <p className="leading-relaxed text-foreground/90">
                    {explanation!.correct_reasoning}
                  </p>
                </div>
              )}

              {/* 3. 句子翻译 — 逐句卡片 */}
              {explanation!.sentence_translation &&
                explanation!.sentence_translation.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium">句子翻译</h4>
                    <div className="space-y-1.5">
                      {explanation!.sentence_translation.map((s, i) => (
                        <div
                          key={i}
                          className={`rounded-lg bg-muted/30 p-2.5 ${
                            s.is_key
                              ? "border-l-2 border-amber-400"
                              : ""
                          }`}
                        >
                          <p className="font-medium text-foreground">
                            {s.fr}
                          </p>
                          {s.zh && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {s.zh}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 4. 干扰项分析 — 默认折叠 */}
              {explanation!.distractors &&
                Object.keys(explanation!.distractors).length > 0 && (
                  <Collapsible
                    open={distractorsOpen}
                    onOpenChange={setDistractorsOpen}
                  >
                    <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left hover:bg-muted/50">
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                          distractorsOpen ? "rotate-180" : ""
                        }`}
                      />
                      <h4 className="font-medium">干扰项分析</h4>
                      <span className="text-xs text-muted-foreground">
                        ({Object.keys(explanation!.distractors).length}项)
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-1.5 space-y-2 pl-1">
                        {Object.entries(explanation!.distractors).map(
                          ([key, d]) => (
                            <div key={key} className="flex gap-2">
                              <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
                                {key}
                              </span>
                              <div className="min-w-0">
                                <p className="text-muted-foreground">
                                  {d.analysis || d.text}
                                </p>
                                {d.trap_type && (
                                  <span className="mt-0.5 inline-block text-xs text-muted-foreground/70">
                                    {d.trap_type}
                                  </span>
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

              {/* 5. 重点词汇 — 2 列 Grid */}
              {explanation!.vocabulary &&
                explanation!.vocabulary.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium">重点词汇</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {explanation!.vocabulary.map((v, i) => (
                        <div
                          key={i}
                          className="rounded-lg border p-2"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-medium">
                              {v.word}
                            </span>
                            {v.freq && (
                              <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
                                {v.freq}
                              </span>
                            )}
                          </div>
                          {v.meaning && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {v.meaning}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 6. 学习要点 — 合并 exam_skill + trap_pattern + similar_tip */}
              {hasLearningTips && (
                <div className="rounded-lg bg-blue-50/50 p-3 dark:bg-blue-950/20">
                  <h4 className="mb-2 font-medium">学习要点</h4>
                  <div className="space-y-2">
                    {explanation!.exam_skill && (
                      <div className="flex gap-2">
                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <p className="text-foreground/90">
                          {explanation!.exam_skill}
                        </p>
                      </div>
                    )}
                    {explanation!.trap_pattern && (
                      <div className="flex gap-2">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <p className="text-foreground/90">
                          {explanation!.trap_pattern}
                        </p>
                      </div>
                    )}
                    {explanation!.similar_tip && (
                      <div className="flex gap-2">
                        <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <p className="text-foreground/90">
                          {explanation!.similar_tip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
