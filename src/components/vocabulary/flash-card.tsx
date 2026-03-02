"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Volume2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFrenchSpeech } from "@/hooks/use-french-speech";
import { getVocabularyCard } from "@/lib/api/vocabulary";
import { getCached, setCache } from "@/lib/vocab-cache";
import type { VocabularyCardData, ConjugationTable } from "@/lib/api/types";

export interface FlashCardWord {
  word: string;
  display_form?: string | null;
  audio_url?: string | null;
  source_label?: string | null;
  /** Pool-specific meaning (textbook context), shown as primary */
  pool_meaning_zh?: string | null;
  /** Gender from pool data — used for color coding */
  gender?: string | null;
  /** Article from pool data (le/la/l'/les) */
  article?: string | null;
  /** Part of speech from pool data */
  part_of_speech?: string | null;
}

interface FlashCardViewProps {
  loadCards: () => Promise<FlashCardWord[]>;
  backLink: string;
  backLabel: string;
  emptyMessage?: string;
}

/* ------------------------------------------------------------------ */
/*  Dictionary detail sub-components (same visual as WordCard)          */
/* ------------------------------------------------------------------ */

function ConjugationGrid({ table }: { table: ConjugationTable }) {
  const rows: [string, string][] = [["je", "nous"], ["tu", "vous"], ["il", "ils"]];
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
      {rows.map(([left, right]) => (
        <div key={left} className="contents">
          <div>
            <span className="text-muted-foreground">{left} </span>
            <span className="font-medium">{table[left as keyof ConjugationTable] || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{right} </span>
            <span className="font-medium">{table[right as keyof ConjugationTable] || "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function VerbConjugation({ data }: { data: VocabularyCardData }) {
  const t = useTranslations();
  const tenses: { key: string; label: string; table?: ConjugationTable }[] = [
    { key: "present", label: t("wordCard.tenses.present"), table: data.present },
    { key: "passe_compose", label: t("wordCard.tenses.passeCompose"), table: data.passe_compose },
    { key: "imparfait", label: t("wordCard.tenses.imparfait"), table: data.imparfait },
    { key: "futur_simple", label: t("wordCard.tenses.futurSimple"), table: data.futur_simple },
    { key: "conditionnel", label: t("wordCard.tenses.conditionnel"), table: data.conditionnel },
    { key: "subjonctif", label: t("wordCard.tenses.subjonctif"), table: data.subjonctif },
  ].filter((item) => item.table);
  if (tenses.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-xs font-medium text-muted-foreground">{t("wordCard.verbConj")}</h4>
        {data.verb_group && (
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {t("wordCard.verbGroup", { group: data.verb_group })}
          </Badge>
        )}
      </div>
      <Tabs defaultValue={tenses[0].key} className="w-full">
        <TabsList className="h-7 w-full flex-wrap gap-0.5">
          {tenses.map((tn) => (
            <TabsTrigger key={tn.key} value={tn.key} className="h-6 px-1.5 text-[10px]">{tn.label}</TabsTrigger>
          ))}
        </TabsList>
        {tenses.map((tn) => (
          <TabsContent key={tn.key} value={tn.key} className="mt-1.5">
            <ConjugationGrid table={tn.table!} />
          </TabsContent>
        ))}
      </Tabs>
      {(data.past_participle || data.auxiliary) && (
        <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
          {data.past_participle && <span>{t("wordCard.pastParticiple", { form: data.past_participle })}</span>}
          {data.auxiliary && <span>{t("wordCard.auxiliary", { aux: data.auxiliary })}</span>}
        </div>
      )}
    </div>
  );
}

/** Full dictionary detail panel — rendered inside CardBack when expanded */
function DictionaryDetail({ data }: { data: VocabularyCardData }) {
  const t = useTranslations();
  const locale = useLocale();

  const genderColor =
    data.gender === "masculin" ? "text-blue-600 dark:text-blue-400"
      : data.gender === "féminin" ? "text-rose-600 dark:text-rose-400" : "";
  const pos = data.part_of_speech && data.part_of_speech !== "OTHER" ? data.part_of_speech : null;
  const pluralForm = data.plural_form && data.plural_form !== "null" ? data.plural_form : null;
  const nativeMeaning = data.meaning_native || (locale === "zh" ? data.meaning_zh : null) || (locale === "en" ? data.meaning_en : null);
  const isVerb = !!(data.present || data.passe_compose);
  const isAdj = !!data.adjective_forms;

  return (
    <div className="space-y-2.5 pt-2.5 border-t border-border/50">
      {/* IPA + POS + Gender */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {data.ipa && <span className="font-mono">{data.ipa}</span>}
        {pos && <Badge variant="outline" className="text-[10px] px-1 py-0">{pos}</Badge>}
        {data.gender && data.gender !== "null" && <span className={genderColor}>{data.gender}</span>}
      </div>

      {/* Dictionary meaning */}
      <div className="space-y-0.5">
        {nativeMeaning && <p className="text-sm text-muted-foreground">{nativeMeaning}</p>}
        {locale !== "en" && data.meaning_en && (
          <p className="text-xs text-muted-foreground">{data.meaning_en}</p>
        )}
      </div>

      {/* Plural form */}
      {pluralForm && (
        <p className="text-xs text-muted-foreground">{t("wordCard.plural", { form: pluralForm })}</p>
      )}

      {/* Verb conjugation */}
      {isVerb && <VerbConjugation data={data} />}

      {/* Adjective forms */}
      {isAdj && data.adjective_forms && (
        <div>
          <h4 className="mb-1 text-xs font-medium text-muted-foreground">{t("wordCard.adjForms")}</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {(["masculine_singular", "feminine_singular", "masculine_plural", "feminine_plural"] as const).map((key) => {
              const labels: Record<string, string> = {
                masculine_singular: t("wordCard.mascSg"),
                feminine_singular: t("wordCard.femSg"),
                masculine_plural: t("wordCard.mascPl"),
                feminine_plural: t("wordCard.femPl"),
              };
              return (
                <div key={key} className="rounded bg-muted/50 px-2 py-1">
                  <span className="text-muted-foreground">{labels[key]} </span>
                  <span className="font-medium">{data.adjective_forms![key]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Examples */}
      {data.examples.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground">{t("wordCard.examples")}</h4>
          {data.examples.map((ex, i) => {
            const exNative = ex.native || (locale === "zh" ? ex.zh : null) || (locale === "en" ? ex.en : null);
            return (
              <div key={i} className="rounded bg-muted/30 px-2 py-1.5 text-xs space-y-0.5">
                <p className="italic text-foreground">{ex.fr}</p>
                {ex.en && <p className="text-muted-foreground">{ex.en}</p>}
                {locale !== "en" && exNative && (
                  <p className="text-emerald-600 dark:text-emerald-400">{exNative}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PRO preview for free users                                          */
/* ------------------------------------------------------------------ */

function DictionaryProPreview() {
  const t = useTranslations();
  return (
    <div className="relative pt-2.5 border-t border-border/50">
      {/* Blurred mock dictionary — gives a glimpse of what's available */}
      <div className="blur-[5px] select-none pointer-events-none space-y-2 text-xs text-muted-foreground" aria-hidden>
        <div className="flex items-center gap-2">
          <span className="font-mono">/mɛ.zɔ̃/</span>
          <span className="rounded border px-1 py-0 text-[10px]">NOUN</span>
          <span className="text-rose-500">féminin</span>
        </div>
        <p className="text-sm">房子; house; résidence</p>
        <div className="flex gap-1">
          {["Présent", "Passé composé", "Imparfait"].map((l) => (
            <span key={l} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{l}</span>
          ))}
        </div>
        <div className="rounded bg-muted/30 px-2 py-1.5 italic">La maison est grande et lumineuse.</div>
      </div>

      {/* Gentle overlay — informational, not aggressive */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-background/70">
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("vocabulary.flashcard.proDesc")}
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {t("vocabulary.flashcard.proUpgrade")}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card faces                                                          */
/* ------------------------------------------------------------------ */

function CardFront({ card, speak, playing }: {
  card: FlashCardWord;
  speak: (word: string, url?: string | null) => void;
  playing: boolean;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-xl border-2 p-8 bg-background shadow-sm"
      style={{ backfaceVisibility: "hidden" }}
    >
      <div className="text-center space-y-4">
        <p className="text-3xl font-semibold tracking-tight">{card.display_form || card.word}</p>
        <button
          onClick={(e) => { e.stopPropagation(); speak(card.word, card.audio_url); }}
          className="rounded-full p-2 hover:bg-muted transition-colors mx-auto"
        >
          <Volume2 className={`h-5 w-5 ${playing ? "text-blue-500 animate-pulse" : "text-muted-foreground"}`} />
        </button>
      </div>
    </div>
  );
}

function CardBack({ card, speak, playing }: {
  card: FlashCardWord;
  speak: (word: string, url?: string | null) => void;
  playing: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [dictData, setDictData] = useState<VocabularyCardData | null>(null);
  const [dictLoading, setDictLoading] = useState(false);

  const canAccessPaid = useAuthStore((s) => {
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });

  // Reset expanded state when card changes
  const wordRef = useRef(card.word);
  if (card.word !== wordRef.current) {
    wordRef.current = card.word;
    if (expanded) setExpanded(false);
    setDictData(null);
  }

  // Fetch vocab card for the current word (IPA etc.) — one call per card
  useEffect(() => {
    const cached = getCached(card.word, locale);
    if (cached) { setDictData(cached); return; }
    setDictLoading(true);
    getVocabularyCard(card.word, locale)
      .then((data) => { setCache(card.word, data, locale); setDictData(data); })
      .catch(() => {})
      .finally(() => setDictLoading(false));
  }, [card.word, locale]);

  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  }, []);

  // Gender color: blue for masculin, rose for féminin (same as WordCard)
  const genderColor =
    card.gender === "masculin" ? "text-blue-600 dark:text-blue-400"
      : card.gender === "féminin" ? "text-rose-600 dark:text-rose-400" : "";

  return (
    <div
      className="absolute inset-0 overflow-y-auto rounded-xl border-2 p-5 bg-background shadow-sm"
      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
    >
      <div className="space-y-3">
        {/* Header: article + word (gender-colored) + IPA + speaker */}
        <div className="flex items-start justify-between gap-2">
          <div>
            {card.article && (
              <p className={`text-sm ${genderColor || "text-muted-foreground"}`}>{card.article}</p>
            )}
            <p className={`text-xl font-semibold ${genderColor}`}>{card.display_form || card.word}</p>
            {dictData?.ipa && (
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{dictData.ipa}</p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); speak(card.word, card.audio_url); }}
            className="rounded-full p-1 hover:bg-muted transition-colors shrink-0"
          >
            <Volume2 className={`h-4 w-4 ${playing ? "text-blue-500 animate-pulse" : "text-muted-foreground"}`} />
          </button>
        </div>

        {/* Pool meaning — the textbook answer */}
        {card.pool_meaning_zh && (
          <p className="text-lg font-medium">{card.pool_meaning_zh}</p>
        )}

        {/* POS + Gender badges (hide gender if POS already encodes it, e.g. n.f., n.m.) */}
        {(card.part_of_speech || card.gender) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {card.part_of_speech && card.part_of_speech !== "OTHER" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{card.part_of_speech}</Badge>
            )}
            {card.gender && card.gender !== "null" && !(card.part_of_speech && /\.f[\.\b]|\.m[\.\b]|\.f$|\.m$/.test(card.part_of_speech)) && (
              <span className={`text-xs ${genderColor}`}>{card.gender}</span>
            )}
          </div>
        )}

        {/* Source label */}
        {card.source_label && (
          <p className="text-xs text-muted-foreground">{card.source_label}</p>
        )}

        {/* Expand button — dictionary detail */}
        <button
          onClick={handleExpand}
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {expanded ? t("vocabulary.flashcard.hideDict") : t("vocabulary.flashcard.showDict")}
        </button>

        {/* Dictionary detail (expanded) — stop propagation so clicks don't flip card */}
        {expanded && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div onClick={(e) => e.stopPropagation()}>
            {canAccessPaid ? (
              dictLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : dictData ? (
                <DictionaryDetail data={dictData} />
              ) : null
            ) : (
              <DictionaryProPreview />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main view                                                           */
/* ------------------------------------------------------------------ */

export function FlashCardView({ loadCards, backLink, backLabel, emptyMessage }: FlashCardViewProps) {
  const t = useTranslations();

  const [cards, setCards] = useState<FlashCardWord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { speak, playing } = useFrenchSpeech();

  // Slide animation state
  const [slideClass, setSlideClass] = useState<string | null>(null);
  const [skipFlipTransition, setSkipFlipTransition] = useState(false);
  const animatingRef = useRef(false);

  const locale = useLocale();

  const canAccessPaid = useAuthStore((s) => {
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });

  useEffect(() => {
    loadCards()
      .then((items) => setCards(items))
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, [loadCards]);

  // Prefetch vocabulary cards for current + next 2 cards (silent, fire-and-forget)
  // Skip for free users — they see the preview instead
  useEffect(() => {
    if (cards.length === 0 || !canAccessPaid) return;
    for (let i = currentIndex; i < Math.min(currentIndex + 3, cards.length); i++) {
      const w = cards[i].word;
      if (!getCached(w, locale)) {
        getVocabularyCard(w, locale)
          .then((d) => setCache(w, d, locale))
          .catch(() => {});
      }
    }
  }, [currentIndex, cards, locale, canAccessPaid]);

  const handleFlip = useCallback(() => {
    if (animatingRef.current) return;
    setFlipped((f) => !f);
  }, []);

  const navigate = useCallback((direction: "next" | "prev") => {
    if (animatingRef.current) return;
    const nextIdx = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIdx < 0 || nextIdx >= cards.length) return;

    animatingRef.current = true;
    setSlideClass(direction === "next" ? "slide-out-left" : "slide-out-right");

    setTimeout(() => {
      // Disable flip transition so the new card appears front-facing instantly
      setSkipFlipTransition(true);
      setCurrentIndex(nextIdx);
      setFlipped(false);
      setSlideClass(direction === "next" ? "slide-in-right" : "slide-in-left");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSkipFlipTransition(false);
          setSlideClass("slide-settle");
          setTimeout(() => {
            setSlideClass(null);
            animatingRef.current = false;
          }, 250);
        });
      });
    }, 200);
  }, [currentIndex, cards.length]);

  const handleNext = useCallback(() => navigate("next"), [navigate]);
  const handlePrev = useCallback(() => navigate("prev"), [navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleFlip(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); handleNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); handlePrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleFlip, handleNext, handlePrev]);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center space-y-4">
        <p className="text-lg font-medium text-muted-foreground">
          {emptyMessage || t("vocabulary.flashcard.empty")}
        </p>
        <Link href={backLink}>
          <Button variant="outline">{t("common.actions.back")}</Button>
        </Link>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const slideStyle: React.CSSProperties = {};
  switch (slideClass) {
    case "slide-out-left":
      slideStyle.transform = "translateX(-110%)"; slideStyle.opacity = 0;
      slideStyle.transition = "transform 200ms ease-in, opacity 200ms ease-in"; break;
    case "slide-out-right":
      slideStyle.transform = "translateX(110%)"; slideStyle.opacity = 0;
      slideStyle.transition = "transform 200ms ease-in, opacity 200ms ease-in"; break;
    case "slide-in-right":
      slideStyle.transform = "translateX(60%)"; slideStyle.opacity = 0; break;
    case "slide-in-left":
      slideStyle.transform = "translateX(-60%)"; slideStyle.opacity = 0; break;
    case "slide-settle":
      slideStyle.transform = "translateX(0)"; slideStyle.opacity = 1;
      slideStyle.transition = "transform 250ms ease-out, opacity 250ms ease-out"; break;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={backLink} className="text-sm text-muted-foreground hover:text-foreground">
          ← {backLabel}
        </Link>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <Progress value={progress} className="h-1.5" />

      {/* Card container */}
      <div className="overflow-hidden rounded-xl">
        <div style={slideStyle}>
          <div
            onClick={handleFlip}
            className="cursor-pointer select-none"
            style={{ perspective: "800px" }}
          >
            <div
              className={`relative min-h-[280px] ${skipFlipTransition ? "" : "transition-transform duration-500"}`}
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <CardFront card={card} speak={speak} playing={playing} />
              <CardBack card={card} speak={speak} playing={playing} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("common.pagination.prev")}
        </Button>
        <Button variant="outline" size="sm" onClick={handleNext} disabled={currentIndex === cards.length - 1}>
          {t("common.pagination.next")}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
