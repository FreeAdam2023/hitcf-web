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
  loading = false,
  error = false,
  onRetry,
  onForceRefresh,
  onOpen,
  saveContext,
}: ExplanationPanelProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(defaultOpen);
  const [distractorsOpen, setDistractorsOpen] = useState(false);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  // Reset when question changes
  useEffect(() => {
    setOpen(defaultOpen);
    setDistractorsOpen(false);
  }, [questionId, defaultOpen]);

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

  // Only show refresh button on dev/localhost
  const [isDevHost, setIsDevHost] = useState(false);
  useEffect(() => {
    const host = window.location.hostname;
    setIsDevHost(
      host === "localhost" ||
        host === "127.0.0.1" ||
        host.startsWith("dev."),
    );
  }, []);

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
        <div className="border-t px-4 py-3 text-sm">
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
              {/* Dev-only: force refresh button */}
              {isDevHost && questionId && onForceRefresh && (
                <div className="flex justify-end">
                  <button
                    onClick={onForceRefresh}
                    disabled={loading}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t("explanation.forceRefresh")}
                  </button>
                </div>
              )}

              {/* 2. 答案解析 — Hero Section */}
              {explanation!.correct_reasoning && (
                <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50/50 p-3 dark:bg-emerald-950/20">
                  <h4 className="mb-1 font-medium">{t("explanation.title")}</h4>
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
                    <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 px-2.5 py-1.5 text-left transition-colors hover:bg-muted/60 hover:border-muted-foreground/50">
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                          distractorsOpen ? "rotate-180" : ""
                        }`}
                      />
                      <h4 className="font-medium">{t("explanation.distractors")}</h4>
                      <span className="text-xs text-muted-foreground">
                        {t("explanation.distractorCount", { count: Object.keys(explanation!.distractors).length })}
                      </span>
                      {!distractorsOpen && (
                        <span className="ml-auto text-[10px] text-muted-foreground/60">{t("explanation.expandHint")}</span>
                      )}
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
