"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2, Volume2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useFrenchSpeech } from "@/hooks/use-french-speech";
import { getVocabularyCard, logWordView } from "@/lib/api/vocabulary";
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
  /** IPA pronunciation (from pool data) */
  ipa?: string | null;
  /** Source type for view tracking (listening/reading/speaking/writing) */
  source_type?: string | null;
}

interface FlashCardViewProps {
  loadCards: () => Promise<FlashCardWord[]>;
  backLink: string;
  backLabel: string;
  emptyMessage?: string;
  /** Pool identifier for view tracking: "saved" | "nihao" | "theme" */
  pool?: "saved" | "nihao" | "theme";
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                              */
/* ------------------------------------------------------------------ */

const IPA_FONT = '"Cascadia Code", "Fira Code", "SF Mono", Consolas, monospace';

interface GenderStyle {
  color: string;        // CSS var reference e.g. "var(--fc-masc)"
  barGradient: string;  // CSS var for bar gradient
  badgeBg: string;      // CSS var for badge background
}

/** Resolve gender style from explicit gender or infer from article */
function resolveGenderStyle(gender?: string | null, article?: string | null): GenderStyle | null {
  const g = gender?.toLowerCase();
  if (g === "masculin") return { color: "var(--fc-masc)", barGradient: "var(--fc-masc-bar)", badgeBg: "var(--fc-masc-badge-bg)" };
  if (g === "féminin" || g === "feminin") return { color: "var(--fc-fem)", barGradient: "var(--fc-fem-bar)", badgeBg: "var(--fc-fem-badge-bg)" };
  if (article) {
    const a = article.toLowerCase().trim();
    if (a === "le" || a === "un") return { color: "var(--fc-masc)", barGradient: "var(--fc-masc-bar)", badgeBg: "var(--fc-masc-badge-bg)" };
    if (a === "la" || a === "une") return { color: "var(--fc-fem)", barGradient: "var(--fc-fem-bar)", badgeBg: "var(--fc-fem-badge-bg)" };
  }
  return null;
}

const CONJ_TH_STYLE: React.CSSProperties = {
  background: "var(--fc-table-th-bg)",
  fontWeight: 600,
  color: "var(--fc-table-th-color)",
  fontSize: "11px",
  letterSpacing: "0.3px",
  padding: "4px 10px",
  border: "1px solid var(--fc-table-border)",
};

const CONJ_TD_STYLE: React.CSSProperties = {
  padding: "4px 10px",
  border: "1px solid var(--fc-table-border)",
  fontSize: "12px",
};

/* ------------------------------------------------------------------ */
/*  Pill badge                                                          */
/* ------------------------------------------------------------------ */

function PillBadge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "20px",
        padding: "3px 12px",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.3px",
        background: bg,
        color,
      }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Dictionary detail sub-components                                     */
/* ------------------------------------------------------------------ */

function ConjugationTable({ label, table }: { label: string; table: ConjugationTable }) {
  const rows: [string, string][] = [["je", "nous"], ["tu", "vous"], ["il", "ils"]];
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "12px" }}>
      <thead>
        <tr>
          <th colSpan={2} style={CONJ_TH_STYLE}>{label}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([left, right]) => (
          <tr key={left}>
            <td style={CONJ_TD_STYLE}>
              <span style={{ color: "var(--fc-ipa)", marginRight: 4 }}>{left}</span>
              {table[left as keyof ConjugationTable] || "\u2014"}
            </td>
            <td style={CONJ_TD_STYLE}>
              <span style={{ color: "var(--fc-ipa)", marginRight: 4 }}>{right}</span>
              {table[right as keyof ConjugationTable] || "\u2014"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function VerbConjugation({ data }: { data: VocabularyCardData }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

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
    <Collapsible open={open} onOpenChange={setOpen}>
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <CollapsibleTrigger asChild>
          <button
            style={{
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              padding: "6px 20px",
              borderRadius: "8px",
              border: "none",
              transition: "all .2s",
              background: open ? "var(--fc-details-open-bg)" : "var(--fc-details-bg)",
              color: open ? "var(--fc-details-open-color)" : "var(--fc-details-color)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {t("wordCard.verbConj")}
            {data.verb_group && <span style={{ fontSize: "11px", opacity: 0.7 }}>({data.verb_group})</span>}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginTop: "10px",
            textAlign: "left",
          }}
        >
          {tenses.map((tn) => (
            <ConjugationTable key={tn.key} label={tn.label} table={tn.table!} />
          ))}
        </div>
        {(data.past_participle || data.auxiliary) && (
          <div style={{ marginTop: 8, display: "flex", gap: 12, fontSize: "12px", color: "var(--fc-ipa)", justifyContent: "center" }}>
            {data.past_participle && <span>{t("wordCard.pastParticiple", { form: data.past_participle })}</span>}
            {data.auxiliary && <span>{t("wordCard.auxiliary", { aux: data.auxiliary })}</span>}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function AdjFormSection({ data }: { data: VocabularyCardData }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  if (!data.adjective_forms) return null;

  const forms = data.adjective_forms;
  const rows: { label: string; value: string | undefined }[] = [
    { label: t("wordCard.mascSg"), value: forms.masculine_singular },
    { label: t("wordCard.femSg"), value: forms.feminine_singular },
    { label: t("wordCard.mascPl"), value: forms.masculine_plural },
    { label: t("wordCard.femPl"), value: forms.feminine_plural },
  ];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <CollapsibleTrigger asChild>
          <button
            style={{
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              padding: "6px 20px",
              borderRadius: "8px",
              border: "none",
              transition: "all .2s",
              background: open ? "var(--fc-details-open-bg)" : "var(--fc-details-bg)",
              color: open ? "var(--fc-details-open-color)" : "var(--fc-details-color)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {t("wordCard.adjForms")}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "12px", marginTop: 10 }}>
          <thead>
            <tr>
              <th style={CONJ_TH_STYLE}>{t("wordCard.adjForms")}</th>
              <th style={CONJ_TH_STYLE}></th>
            </tr>
          </thead>
          <tbody>
            {[0, 1].map((rowIdx) => (
              <tr key={rowIdx}>
                {[0, 1].map((colIdx) => {
                  const item = rows[rowIdx * 2 + colIdx];
                  return (
                    <td key={colIdx} style={CONJ_TD_STYLE}>
                      <span style={{ color: "var(--fc-ipa)", marginRight: 4 }}>{item.label}</span>
                      {item.value || "\u2014"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Full dictionary detail panel — rendered inside CardBack when expanded */
function DictionaryDetail({ data }: { data: VocabularyCardData }) {
  const t = useTranslations();
  const locale = useLocale();

  const gs = resolveGenderStyle(data.gender);
  const pos = data.part_of_speech && data.part_of_speech !== "OTHER" ? data.part_of_speech : null;
  const pluralForm = data.plural_form && data.plural_form !== "null" ? data.plural_form : null;
  const nativeMeaning = data.meaning_native || (locale === "zh" ? data.meaning_zh : null) || (locale === "en" ? data.meaning_en : null);
  const isVerb = !!(data.present || data.passe_compose);
  const isAdj = !!data.adjective_forms;

  return (
    <div style={{ paddingTop: 14 }}>
      {/* Dashed divider */}
      <div style={{ borderTop: "1.5px dashed var(--fc-divider)", marginBottom: 14 }} />

      {/* IPA + POS pill */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, justifyContent: "center" }}>
        {data.ipa && (
          <span style={{ fontFamily: IPA_FONT, fontSize: "14px", color: "var(--fc-ipa)" }}>{data.ipa}</span>
        )}
        {pos && (
          <PillBadge bg="var(--fc-badge-pos-bg)" color="var(--fc-badge-pos-color)">{pos}</PillBadge>
        )}
        {data.gender && data.gender !== "null" && (
          <PillBadge bg={gs?.badgeBg || "var(--fc-badge-generic-bg)"} color={gs?.color || "var(--fc-badge-generic-color)"}>{data.gender}</PillBadge>
        )}
      </div>

      {/* Dictionary meaning */}
      {nativeMeaning && (
        <p style={{ fontSize: "15px", color: "var(--fc-meaning-en)", marginTop: 10, textAlign: "center" }}>{nativeMeaning}</p>
      )}
      {locale !== "en" && data.meaning_en && (
        <p style={{ fontSize: "13px", color: "var(--fc-meaning-en)", textAlign: "center", marginTop: 4 }}>{data.meaning_en}</p>
      )}

      {/* Plural form */}
      {pluralForm && (
        <p style={{ fontSize: "13px", color: "var(--fc-ipa)", textAlign: "center", marginTop: 6 }}>{t("wordCard.plural", { form: pluralForm })}</p>
      )}

      {/* Examples — blockquote accent style */}
      {data.examples.length > 0 && (
        <div style={{ textAlign: "left", marginTop: 16 }}>
          {data.examples.map((ex, i) => {
            const exNative = ex.native || (locale === "zh" ? ex.zh : null) || (locale === "en" ? ex.en : null);
            return (
              <div
                key={i}
                style={{
                  borderLeft: "3px solid var(--fc-example-border)",
                  padding: "6px 0 6px 16px",
                  marginBottom: i < data.examples.length - 1 ? 10 : 0,
                }}
              >
                <span style={{ fontStyle: "italic", fontSize: "14px", color: "var(--fc-example-fr)", fontWeight: 500, display: "block" }}>
                  {ex.fr}
                </span>
                {ex.en && (
                  <span style={{ fontSize: "13px", color: "var(--fc-example-en)", display: "block", marginTop: 1 }}>
                    {ex.en}
                  </span>
                )}
                {locale !== "en" && exNative && (
                  <span style={{ fontSize: "13px", color: "var(--fc-example-zh)", display: "block", marginTop: 1 }}>
                    {exNative}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Verb conjugation — Collapsible */}
      {isVerb && <VerbConjugation data={data} />}

      {/* Adjective forms — Collapsible */}
      {isAdj && <AdjFormSection data={data} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PRO preview for free users                                          */
/* ------------------------------------------------------------------ */

function DictionaryProPreview() {
  const t = useTranslations();
  return (
    <div className="relative" style={{ paddingTop: 14 }}>
      {/* Dashed divider */}
      <div style={{ borderTop: "1.5px dashed var(--fc-divider)", marginBottom: 14 }} />

      {/* Blurred mock dictionary — Anki style */}
      <div className="blur-[5px] select-none pointer-events-none" aria-hidden style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
          <span style={{ fontFamily: IPA_FONT, fontSize: "14px", color: "var(--fc-ipa)" }}>/mɛ.zɔ̃/</span>
          <span style={{ borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: 600, background: "var(--fc-badge-pos-bg)", color: "var(--fc-badge-pos-color)" }}>NOUN</span>
          <span style={{ borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: 600, background: "var(--fc-fem-badge-bg)", color: "var(--fc-fem)" }}>féminin</span>
        </div>
        <p style={{ fontSize: "15px", color: "var(--fc-meaning-en)", marginTop: 8 }}>房子; house; résidence</p>
        <div style={{ textAlign: "left", margin: "12px 0" }}>
          <div style={{ borderLeft: "3px solid var(--fc-example-border)", padding: "6px 0 6px 16px" }}>
            <span style={{ fontStyle: "italic", fontSize: "14px", color: "var(--fc-example-fr)", fontWeight: 500, display: "block" }}>
              La maison est grande et lumineuse.
            </span>
          </div>
        </div>
      </div>

      {/* Gentle overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: "color-mix(in srgb, var(--fc-card-bg) 70%, transparent)", borderRadius: "12px" }}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <p className="text-sm" style={{ color: "var(--fc-ipa)" }}>
            {t("vocabulary.flashcard.proDesc")}
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 transition-colors"
            style={{
              borderRadius: "8px",
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: 500,
              background: "var(--fc-details-bg)",
              color: "var(--fc-details-color)",
            }}
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
  const gs = resolveGenderStyle(card.gender, card.article);

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        background: "var(--fc-card-bg)",
        boxShadow: "var(--fc-card-shadow)",
      }}
    >
      {/* Gender accent bar */}
      <div style={{ height: 4, background: gs?.barGradient || "var(--fc-neutral-bar)" }} />

      {/* Content */}
      <div style={{ padding: "28px 32px 24px", textAlign: "center" }}>
        {card.article && (
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--fc-article)", letterSpacing: "0.5px", marginBottom: 2 }}>
            {card.article}
          </div>
        )}
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: gs?.color || "var(--fc-word)",
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
            margin: "4px 0 10px",
          }}
        >
          {card.display_form || card.word}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); speak(card.word, card.audio_url); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            margin: "4px 0",
            opacity: playing ? 0.7 : 0.4,
            transition: "opacity 0.2s",
          }}
        >
          <Volume2 size={22} style={{ color: playing ? (gs?.color || "var(--fc-masc)") : "var(--fc-article)" }} />
        </button>
        {card.ipa && (
          <div style={{ fontSize: 15, color: "var(--fc-ipa)", fontFamily: IPA_FONT }}>
            {card.ipa}
          </div>
        )}
        {card.source_label && (
          <div style={{ fontSize: 11, color: "var(--fc-source)", letterSpacing: "0.3px", marginTop: 10 }}>
            {card.source_label}
          </div>
        )}
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

  const gs = resolveGenderStyle(card.gender, card.article);

  return (
    <div
      className="absolute inset-0 overflow-y-auto rounded-2xl scrollbar-thin"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        background: "var(--fc-card-bg)",
        boxShadow: "var(--fc-card-shadow)",
      }}
    >
      {/* Gender accent bar */}
      <div style={{ height: 4, background: gs?.barGradient || "var(--fc-neutral-bar)" }} />

      {/* Content */}
      <div style={{ padding: "16px 28px 24px", textAlign: "center" }}>
        {/* Article + Word (smaller than front) + IPA + Speaker */}
        {card.article && (
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fc-article)", letterSpacing: "0.5px" }}>
            {card.article}
          </div>
        )}
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: gs?.color || "var(--fc-word)",
            lineHeight: 1.2,
            margin: "2px 0 6px",
          }}
        >
          {card.display_form || card.word}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); speak(card.word, card.audio_url); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            opacity: playing ? 0.7 : 0.4,
            transition: "opacity 0.2s",
          }}
        >
          <Volume2 size={18} style={{ color: playing ? (gs?.color || "var(--fc-masc)") : "var(--fc-article)" }} />
        </button>
        {(dictData?.ipa || card.ipa) && (
          <div style={{ fontSize: 13, color: "var(--fc-ipa)", fontFamily: IPA_FONT, marginTop: 2 }}>
            {dictData?.ipa || card.ipa}
          </div>
        )}

        {/* Dashed divider */}
        <div style={{ borderTop: "1.5px dashed var(--fc-divider)", margin: "14px 0" }} />

        {/* Chinese meaning — large & bold */}
        {card.pool_meaning_zh && (
          <div style={{ fontSize: 28, fontWeight: 600, color: "var(--fc-meaning)", margin: "8px 0 4px" }}>
            {card.pool_meaning_zh}
          </div>
        )}

        {/* Pill badges: POS + Gender + CEFR */}
        {(card.part_of_speech || card.gender) && (
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6, margin: "14px 0" }}>
            {card.part_of_speech && card.part_of_speech !== "OTHER" && (
              <PillBadge bg="var(--fc-badge-pos-bg)" color="var(--fc-badge-pos-color)">
                {card.part_of_speech}
              </PillBadge>
            )}
            {card.gender && card.gender !== "null" && !(card.part_of_speech && /\.f[\.\b]|\.m[\.\b]|\.f$|\.m$/.test(card.part_of_speech)) && (
              <PillBadge bg={gs?.badgeBg || "var(--fc-badge-generic-bg)"} color={gs?.color || "var(--fc-badge-generic-color)"}>
                {card.gender}
              </PillBadge>
            )}
          </div>
        )}

        {/* Source label */}
        {card.source_label && (
          <div style={{ fontSize: 11, color: "var(--fc-source)", letterSpacing: "0.3px", marginTop: 6 }}>
            {card.source_label}
          </div>
        )}

        {/* Expand dictionary button — Anki details/summary style */}
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <button
            onClick={handleExpand}
            style={{
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              padding: "6px 20px",
              borderRadius: "8px",
              border: "none",
              transition: "all .2s",
              background: expanded ? "var(--fc-details-open-bg)" : "var(--fc-details-bg)",
              color: expanded ? "var(--fc-details-open-color)" : "var(--fc-details-color)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <BookOpen size={14} />
            {expanded ? t("vocabulary.flashcard.hideDict") : t("vocabulary.flashcard.showDict")}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Dictionary detail (expanded) — stop propagation so clicks don't flip card */}
        {expanded && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div onClick={(e) => e.stopPropagation()}>
            {canAccessPaid ? (
              dictLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--fc-ipa)" }} />
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

export function FlashCardView({ loadCards, backLink, backLabel, emptyMessage, pool = "saved" }: FlashCardViewProps) {
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

  // Auto-play audio when a new card appears (navigation or initial load)
  useEffect(() => {
    if (cards.length === 0) return;
    const c = cards[currentIndex];
    // Delay so slide animation settles first
    const timer = setTimeout(() => {
      speak(c.word, c.audio_url);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex, cards, speak]);

  // Auto-play audio when card is flipped (front → back)
  useEffect(() => {
    if (!flipped || cards.length === 0) return;
    const c = cards[currentIndex];
    const timer = setTimeout(() => {
      speak(c.word, c.audio_url);
    }, 300);
    return () => clearTimeout(timer);
  }, [flipped, cards, currentIndex, speak]);

  const handleFlip = useCallback(() => {
    if (animatingRef.current) return;
    setFlipped((prev) => {
      // Log view only when flipping front→back (i.e. prev was false)
      if (!prev && cards[currentIndex]) {
        logWordView(cards[currentIndex].word, cards[currentIndex].source_type, pool);
      }
      return !prev;
    });
  }, [cards, currentIndex, pool]);

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
    <div className="flashcard-anki mx-auto max-w-2xl px-4 py-6 pb-24 md:py-8 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={backLink} className="text-sm text-muted-foreground hover:text-foreground">
          &larr; {backLabel}
        </Link>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <Progress value={progress} className="h-1.5" />

      {/* Card container */}
      <div className="overflow-hidden rounded-2xl">
        <div style={slideStyle}>
          <div
            onClick={handleFlip}
            className="cursor-pointer select-none"
            style={{ perspective: "800px" }}
          >
            <div
              className={`relative min-h-[60svh] md:min-h-[420px] ${skipFlipTransition ? "" : "transition-transform duration-500"}`}
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
