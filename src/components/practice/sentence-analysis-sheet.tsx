"use client";

import { useCallback, useState } from "react";
import { Loader2, Star, BookOpen, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateSentenceAnalysis, matchGrammarCard } from "@/lib/api/questions";
import { useAuthStore } from "@/stores/auth-store";
import { useVocabStore } from "@/stores/vocab-store";
import type { GrammarCard, SentenceAnalysis } from "@/lib/api/types";
import type { WordSaveContext } from "./french-text";

interface SentenceAnalysisSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  sentenceIndex: number;
  sentenceFr: string;
  saveContext?: WordSaveContext;
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
    if (card !== undefined) return; // already fetched
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
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
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
              {card.rule && (
                <p className="mt-1 font-mono text-primary/80">{card.rule}</p>
              )}
              {card.rule_zh && locale !== "en" && (
                <p className="text-muted-foreground">{card.rule_zh}</p>
              )}
              <p className="mt-1.5 leading-relaxed">
                {locale === "en" ? card.explanation_en : card.explanation}
              </p>
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
                <p className="mt-1.5 border-t border-border/50 pt-1.5 text-muted-foreground">
                  {card.irregulars}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SentenceAnalysisSheet({
  open,
  onOpenChange,
  questionId,
  sentenceIndex,
  sentenceFr,
  saveContext,
}: SentenceAnalysisSheetProps) {
  const t = useTranslations("sentenceAnalysis");
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isSaved, addWord, removeWord, isLoaded: vocabLoaded } = useVocabStore();

  const [data, setData] = useState<SentenceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    if (data && data.sentence === sentenceFr) return;
    setLoading(true);
    setError(false);
    try {
      const result = await generateSentenceAnalysis(
        questionId,
        sentenceIndex,
        sentenceFr,
        locale,
      );
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [questionId, sentenceIndex, sentenceFr, locale, data]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) fetchAnalysis();
      onOpenChange(nextOpen);
    },
    [fetchAnalysis, onOpenChange],
  );

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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto rounded-t-2xl pb-safe">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            {t("title")}
          </SheetTitle>
        </SheetHeader>

        {/* Original sentence */}
        <p className="mb-3 rounded-lg bg-muted/60 px-3 py-2 text-sm font-medium leading-relaxed">
          {sentenceFr}
        </p>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">{t("loading")}</span>
          </div>
        )}

        {error && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("error")}
            <button
              onClick={fetchAnalysis}
              className="ml-2 text-primary underline underline-offset-2"
            >
              {t("retry")}
            </button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4">
            {/* Structure */}
            <section>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("structure")}
              </h4>
              <p className="text-sm leading-relaxed">
                {locale === "en" ? data.structure_en : data.structure}
              </p>
              {locale === "zh" && data.structure_en && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {data.structure_en}
                </p>
              )}
            </section>

            {/* Tense — clickable to expand grammar card */}
            {data.tense && (
              <>
                <Separator />
                <section>
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("tense")}
                  </h4>
                  <div className="flex items-center gap-2">
                    <GrammarCardInline name={data.tense} />
                    {data.tense_zh && (
                      <span className="text-sm">{data.tense_zh}</span>
                    )}
                  </div>
                  {data.tense_note && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {data.tense_note}
                    </p>
                  )}
                </section>
              </>
            )}

            {/* Collocations */}
            {data.collocations.length > 0 && (
              <>
                <Separator />
                <section>
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("collocations")}
                  </h4>
                  <div className="space-y-2">
                    {data.collocations.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between rounded-lg border bg-card px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-primary">
                            {c.phrase}
                          </p>
                          <p className="text-xs text-foreground/80">
                            {locale === "en" ? c.meaning_en : c.meaning}
                            {locale === "zh" && c.meaning_en && (
                              <span className="ml-1.5 text-muted-foreground">
                                {c.meaning_en}
                              </span>
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
                            title={
                              isSaved(c.phrase.toLowerCase())
                                ? t("unsaveCollocation")
                                : t("saveCollocation")
                            }
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

            {/* Grammar points — clickable to expand grammar card */}
            {data.grammar.length > 0 && (
              <>
                <Separator />
                <section>
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("grammarPoints")}
                  </h4>
                  <div className="space-y-2">
                    {data.grammar.map((g, i) => (
                      <div
                        key={i}
                        className="rounded-lg border bg-card px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <GrammarCardInline name={g.name} />
                          {g.name_zh && (
                            <span className="text-xs text-foreground/80">
                              {g.name_zh}
                            </span>
                          )}
                        </div>
                        {g.rule && (
                          <p className="mt-1 font-mono text-xs text-primary/80">
                            {g.rule}
                          </p>
                        )}
                        {g.note && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {g.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
