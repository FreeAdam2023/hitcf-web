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
import type { GrammarCard, SentenceAnalysis, SentenceAnalysisPart } from "@/lib/api/types";
import type { WordSaveContext } from "./french-text";

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  subject:     { bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-700 dark:text-blue-300" },
  verb:        { bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-300" },
  object:      { bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-300" },
  complement:  { bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-700 dark:text-amber-300" },
  adverbial:   { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
  connector:   { bg: "bg-cyan-100 dark:bg-cyan-900/30",     text: "text-cyan-700 dark:text-cyan-300" },
  preposition: { bg: "bg-pink-100 dark:bg-pink-900/30",     text: "text-pink-700 dark:text-pink-300" },
  negation:    { bg: "bg-orange-100 dark:bg-orange-900/30",  text: "text-orange-700 dark:text-orange-300" },
  pronoun:     { bg: "bg-teal-100 dark:bg-teal-900/30",     text: "text-teal-700 dark:text-teal-300" },
  auxiliary:   { bg: "bg-indigo-100 dark:bg-indigo-900/30",  text: "text-indigo-700 dark:text-indigo-300" },
};
const DEFAULT_COLOR = { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" };

function ColoredSentence({ parts }: { parts: SentenceAnalysisPart[] }) {
  return (
    <p className="flex flex-wrap items-end gap-x-1 gap-y-2 text-sm leading-loose">
      {parts.map((p, i) => {
        const c = ROLE_COLORS[p.role] || DEFAULT_COLOR;
        return (
          <span key={i} className="inline-flex flex-col items-center">
            <span className={`rounded px-1.5 py-0.5 font-medium ${c.bg} ${c.text}`}>{p.fr}</span>
            <span className={`text-[9px] leading-none mt-0.5 ${c.text} opacity-60`}>{p.role}</span>
          </span>
        );
      })}
    </p>
  );
}

function PartsTable({ parts, locale }: { parts: SentenceAnalysisPart[]; locale: string }) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border text-xs">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50 text-muted-foreground">
            <th className="px-2 py-1.5 text-left font-medium w-16">Role</th>
            <th className="px-2 py-1.5 text-left font-medium">French</th>
            <th className="px-2 py-1.5 text-left font-medium">Translation</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((p, i) => {
            const c = ROLE_COLORS[p.role] || DEFAULT_COLOR;
            return (
              <tr key={i} className="border-t border-border/50">
                <td className="px-2 py-1.5">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text}`}>{p.role}</span>
                </td>
                <td className={`px-2 py-1.5 font-medium ${c.text}`}>{p.fr}</td>
                <td className="px-2 py-1.5 text-muted-foreground">
                  {locale === "en" ? p.en : p.zh}
                  {locale === "zh" && p.en && <span className="ml-1.5 text-muted-foreground/50">{p.en}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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
              {/* Structure: color-coded parts or fallback paragraph */}
              <section>
                <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {t("structure")}
                </h4>
                {data.parts && data.parts.length > 0 ? (
                  <>
                    <ColoredSentence parts={data.parts} />
                    <PartsTable parts={data.parts} locale={locale} />
                  </>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed">
                      {locale === "en" ? data.structure_en : data.structure}
                    </p>
                    {locale === "zh" && data.structure_en && (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{data.structure_en}</p>
                    )}
                  </>
                )}
              </section>

              {/* Tense + Grammar compact tags */}
              {(data.tense || data.grammar.length > 0) && (
                <>
                  <Separator className="opacity-50" />
                  <section>
                    <div className="flex flex-wrap items-start gap-2">
                      {data.tense && (
                        <div className="flex items-center gap-1.5">
                          <GrammarCardInline name={data.tense} />
                          {data.tense_zh && <span className="text-xs text-muted-foreground">{data.tense_zh}</span>}
                          {data.tense_note && <span className="text-xs text-muted-foreground/60">— {data.tense_note}</span>}
                        </div>
                      )}
                      {data.grammar.map((g, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <GrammarCardInline name={g.name} />
                          {g.name_zh && <span className="text-xs text-muted-foreground">{g.name_zh}</span>}
                        </div>
                      ))}
                    </div>
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

              {/* Grammar details (rule + note) — shown below tags if any grammar has details */}
              {data.grammar.some((g) => g.rule || g.note) && (
                <div className="space-y-1.5">
                  {data.grammar.filter((g) => g.rule || g.note).map((g, i) => (
                    <div key={i} className="rounded-lg border bg-card/50 px-3 py-2">
                      <p className="text-xs font-medium text-foreground/80">{g.name} {g.name_zh && `— ${g.name_zh}`}</p>
                      {g.rule && <p className="mt-0.5 font-mono text-xs text-primary/80">{g.rule}</p>}
                      {g.note && <p className="mt-0.5 text-xs text-muted-foreground">{g.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
