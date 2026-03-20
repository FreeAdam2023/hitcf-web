"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Link2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FrenchText, type WordSaveContext } from "./french-text";
import type { Explanation } from "@/lib/api/types";

interface ExplanationPanelProps {
  explanation: Explanation | null | undefined;
  questionId?: string;
  defaultOpen?: boolean;
  /** The user's selected answer key (e.g. "A") */
  selectedAnswer?: string | null;
  /** The correct answer key (e.g. "C") */
  correctAnswer?: string | null;
  /** Externally managed loading state */
  loading?: boolean;
  /** Externally managed error state */
  error?: boolean;
  /** Called when user clicks retry */
  onRetry?: () => void;
  /** Called when user clicks force refresh */
  onForceRefresh?: () => void;
  /** Called when panel is opened and needs data */
  onOpen?: () => void;
  /** Context for saving vocabulary words */
  saveContext?: WordSaveContext;
}

export function ExplanationPanel({
  explanation,
  questionId,
  defaultOpen = false,
  selectedAnswer,
  correctAnswer,
  loading = false,
  error = false,
  onRetry,
  onForceRefresh,
  onOpen,
  saveContext,
}: ExplanationPanelProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(defaultOpen);
  const isWrong = !!(selectedAnswer && correctAnswer && selectedAnswer !== correctAnswer);
  const [distractorsOpen, setDistractorsOpen] = useState(isWrong);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  // Reset when question changes
  useEffect(() => {
    setOpen(defaultOpen);
    const wrong = !!(selectedAnswer && correctAnswer && selectedAnswer !== correctAnswer);
    setDistractorsOpen(wrong);
  }, [questionId, defaultOpen, selectedAnswer, correctAnswer]);

  // Trigger fetch when opened and no data (use ref to avoid re-runs from callback prop changes)
  useEffect(() => {
    if (open && !explanation && !loading && !error) {
      onOpenRef.current?.();
    }
  }, [open, explanation, loading, error]);

  const hasContent =
    explanation &&
    (explanation.correct_reasoning ||
      explanation.sentence_translation?.length ||
      explanation.vocabulary?.length ||
      explanation.distractors ||
      explanation.exam_skill ||
      explanation.trap_pattern ||
      explanation.similar_tip);

  const hasLearningTips =
    explanation?.exam_skill ||
    explanation?.trap_pattern ||
    explanation?.similar_tip;

  // Force refresh is available to all users (backend enforces rate limits)

  return (
    <div className="rounded-md border">
      <Button
        variant="ghost"
        className="w-full justify-between px-4 py-2"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4" />
          {t("explanation.viewExplanation")}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {open && (
        <div className="border-t px-4 py-3 text-sm lg:text-base">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("explanation.loading")}
            </div>
          ) : error ? (
            <p className="text-muted-foreground">
              {t("explanation.loadFailed")}
              <button
                className="underline hover:text-foreground"
                onClick={onRetry}
              >
                {t("explanation.clickRetry")}
              </button>
            </p>
          ) : !hasContent ? (
            <p className="text-muted-foreground">
              {t("explanation.comingSoon")}
            </p>
          ) : (
            <div className="space-y-3">
              {/* 2. 答案解析 — Hero Section */}
              {explanation!.correct_reasoning && (
                <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50/50 p-3 dark:bg-emerald-950/20">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-medium">{t("explanation.title")}</h4>
                    {questionId && onForceRefresh && (
                      <button
                        onClick={onForceRefresh}
                        disabled={loading}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                        title={t("explanation.forceRefresh")}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="leading-relaxed text-foreground/90">
                    {explanation!.correct_reasoning}
                  </p>
                </div>
              )}

              {/* 3. 干扰项分析 — 默认折叠 */}
              {explanation!.distractors &&
                Object.keys(explanation!.distractors).length > 0 && (
                  <Collapsible
                    open={distractorsOpen}
                    onOpenChange={setDistractorsOpen}
                  >
                    <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-muted/60">
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                          distractorsOpen ? "rotate-180" : ""
                        }`}
                      />
                      <h4 className="font-medium">{t("explanation.distractors")}</h4>
                      <span className="text-xs text-muted-foreground">
                        {t("explanation.distractorCount", { count: Object.keys(explanation!.distractors).length })}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-1.5 space-y-2 pl-1">
                        {Object.entries(explanation!.distractors)
                        .sort(([a], [b]) => {
                          // Show user's wrong choice first
                          if (a === selectedAnswer) return -1;
                          if (b === selectedAnswer) return 1;
                          return 0;
                        })
                        .map(([key, d]) => {
                          const isUserChoice = key === selectedAnswer && isWrong;
                          return (
                            <div key={key} className={`flex gap-2 ${isUserChoice ? "rounded-lg border-l-4 border-red-400 bg-red-50/50 p-2 dark:bg-red-950/20" : ""}`}>
                              <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${isUserChoice ? "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-muted"}`}>
                                {key}{isUserChoice ? ` ✗` : ""}
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
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

              {/* 5. 重点词汇 — 2 列 Grid */}
              {explanation!.vocabulary &&
                explanation!.vocabulary.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium">{t("explanation.vocabulary")}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {explanation!.vocabulary.map((v, i) => (
                        <div
                          key={i}
                          className="rounded-lg border p-2"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-medium">
                              {v.word && <FrenchText text={v.word} saveContext={saveContext} />}
                            </span>
                            {v.freq && (
                              <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
                                {v.freq}
                              </span>
                            )}
                          </div>
                          {v.meaning && (
                            <p className="mt-0.5 text-xs lg:text-sm text-muted-foreground">
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
                  <h4 className="mb-2 font-medium">{t("explanation.studyPoints")}</h4>
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
