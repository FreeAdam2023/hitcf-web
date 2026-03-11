"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Star, BookOpen, ArrowRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateSentenceAnalysis, regenerateSentenceAnalysis, matchGrammarCard } from "@/lib/api/questions";
import { useAuthStore } from "@/stores/auth-store";
import { useVocabStore } from "@/stores/vocab-store";
import type { GrammarCard, SentenceAnalysis } from "@/lib/api/types";
import type { WordSaveContext } from "./french-text";

/** Inline expandable grammar card */
function GrammarCardInline({ name }: { name: string }) {
  const t = useTranslations("sentenceAnalysis");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [card, setCard] = useState<GrammarCard | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (card !== undefined) return;
    setLoading(true);
    try {
      const result = await matchGrammarCard(name);
      setCard(result);
    } catch {
      setCard(null);
    } finally {
      setLoading(false);
    }
  }, [expanded, card, name]);

  return (
    <div>
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1 rounded-md border bg-primary/5 px-2 py-0.5 font-mono text-xs text-primary transition-colors hover:bg-primary/10"
      >
        {name}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {expanded && (
        <div className="mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {loading && (
            <div className="flex items-center gap-1.5 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t("loading")}
            </div>
          )}
          {card === null && !loading && (
            <p className="py-1 text-xs text-muted-foreground">{t("noGrammarCard")}</p>
          )}
          {card && (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{card.name}</span>
                {card.name_zh && <span className="text-muted-foreground">{card.name_zh}</span>}
                <Badge variant="secondary" className="ml-auto text-[10px]">{card.level}</Badge>
              </div>
              {card.rule && <p className="mt-1 font-mono text-primary/80">{card.rule}</p>}
              {card.rule_zh && locale !== "en" && <p className="text-muted-foreground">{card.rule_zh}</p>}
              <p className="mt-1.5 leading-relaxed">{locale === "en" ? card.explanation_en : card.explanation}</p>
              {card.examples.length > 0 && (
                <div className="mt-1.5 space-y-1 border-t border-border/50 pt-1.5">
                  {card.examples.map((ex, i) => (
                    <div key={i}>
                      <p className="font-medium text-foreground">{ex.fr}</p>
                      <p className="text-muted-foreground">
                        {locale === "en" ? ex.en : `${ex.zh} / ${ex.en}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {card.irregulars && (
                <p className="mt-1.5 border-t border-border/50 pt-1.5 text-muted-foreground">{card.irregulars}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SentenceAnalysisInlineProps {
  questionId: string;
  sentenceIndex: number;
  sentenceFr: string;
  saveContext?: WordSaveContext;
  onClose: () => void;
}

export function SentenceAnalysisInline({
  questionId,
  sentenceIndex,
  sentenceFr,
  saveContext,
  onClose,
}: SentenceAnalysisInlineProps) {
  const t = useTranslations("sentenceAnalysis");
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isSaved, addWord, removeWord, isLoaded: vocabLoaded } = useVocabStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<SentenceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await generateSentenceAnalysis(questionId, sentenceIndex, sentenceFr, locale);
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [questionId, sentenceIndex, sentenceFr, locale]);

  const handleRegenerate = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await regenerateSentenceAnalysis(questionId, sentenceIndex, sentenceFr, locale);
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [questionId, sentenceIndex, sentenceFr, locale]);

  // Fetch on mount, trigger expand animation
  useEffect(() => {
    fetchAnalysis();
    // Small delay to trigger CSS transition
    requestAnimationFrame(() => setVisible(true));
  }, [fetchAnalysis]);

  // Scroll into view once expanded
  useEffect(() => {
    if (visible && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [visible]);

  const handleSaveCollocation = useCallback(
    async (phrase: string) => {
      if (!isAuthenticated || !saveContext) return;
      const normalized = phrase.trim().toLowerCase();
      if (isSaved(normalized)) {
        await removeWord(normalized);
        toast.success(t("unsaved"));
      } else {
        await addWord(normalized, {
          word: phrase,
          source_type: saveContext.sourceType,
          test_set_id: saveContext.testSetId,
          test_set_name: saveContext.testSetName,
          question_id: saveContext.questionId,
          question_number: saveContext.questionNumber,
        });
        toast.success(t("saved"));
      }
    },
    [isAuthenticated, saveContext, isSaved, addWord, removeWord, t],
  );

  return (
    <div
      ref={containerRef}
      className="overflow-hidden transition-all duration-300 ease-out"
      style={{
        maxHeight: visible ? "2000px" : "0px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
      }}
    >
      <div className="mt-2 rounded-xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent px-4 py-3">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            {t("title")}
          </div>
          <div className="flex items-center gap-1">
            {data && !loading && (
              <button
                onClick={handleRegenerate}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title={t("regenerate")}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="absolute inset-0 h-5 w-5 animate-ping rounded-full bg-primary/20" />
              </div>
              <span className="text-sm text-muted-foreground">{t("loading")}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="py-4 text-center text-sm text-muted-foreground">
            {t("error")}
            <button onClick={fetchAnalysis} className="ml-2 text-primary underline underline-offset-2">
              {t("retry")}
            </button>
          </div>
        )}

        {/* Content */}
        {data && !loading && (
          <div className="animate-in fade-in duration-300">
            <div className="space-y-3">
              {/* Structure */}
              <section>
                <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {t("structure")}
                </h4>
                <p className="text-sm leading-relaxed">
                  {locale === "en" ? data.structure_en : data.structure}
                </p>
                {locale === "zh" && data.structure_en && (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{data.structure_en}</p>
                )}
              </section>

              {/* Tense */}
              {data.tense && (
                <>
                  <Separator className="opacity-50" />
                  <section>
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {t("tense")}
                    </h4>
                    <div className="flex items-center gap-2">
                      <GrammarCardInline name={data.tense} />
                      {data.tense_zh && <span className="text-sm">{data.tense_zh}</span>}
                    </div>
                    {data.tense_note && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{data.tense_note}</p>
                    )}
                  </section>
                </>
              )}

              {/* Collocations */}
              {data.collocations.length > 0 && (
                <>
                  <Separator className="opacity-50" />
                  <section>
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {t("collocations")}
                    </h4>
                    <div className="space-y-1.5">
                      {data.collocations.map((c, i) => (
                        <div key={i} className="flex items-start justify-between rounded-lg border bg-card/50 px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-primary">{c.phrase}</p>
                            <p className="text-xs text-foreground/80">
                              {locale === "en" ? c.meaning_en : c.meaning}
                              {locale === "zh" && c.meaning_en && (
                                <span className="ml-1.5 text-muted-foreground">{c.meaning_en}</span>
                              )}
                            </p>
                            {c.example && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs italic text-muted-foreground">
                                <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                                {c.example}
                              </p>
                            )}
                          </div>
                          {isAuthenticated && vocabLoaded && saveContext && (
                            <button
                              onClick={() => handleSaveCollocation(c.phrase)}
                              className="ml-2 shrink-0 rounded-full p-1 transition-colors hover:bg-muted"
                              title={isSaved(c.phrase.toLowerCase()) ? t("unsaveCollocation") : t("saveCollocation")}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  isSaved(c.phrase.toLowerCase())
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* Grammar points */}
              {data.grammar.length > 0 && (
                <>
                  <Separator className="opacity-50" />
                  <section>
                    <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {t("grammarPoints")}
                    </h4>
                    <div className="space-y-1.5">
                      {data.grammar.map((g, i) => (
                        <div key={i} className="rounded-lg border bg-card/50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <GrammarCardInline name={g.name} />
                            {g.name_zh && <span className="text-xs text-foreground/80">{g.name_zh}</span>}
                          </div>
                          {g.rule && <p className="mt-1 font-mono text-xs text-primary/80">{g.rule}</p>}
                          {g.note && <p className="mt-0.5 text-xs text-muted-foreground">{g.note}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
