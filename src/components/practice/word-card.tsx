"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getVocabularyCard } from "@/lib/api/vocabulary";
import { getCached, setCache } from "@/lib/vocab-cache";
import { useFrenchSpeech } from "@/hooks/use-french-speech";
import type { VocabularyCardData, ConjugationTable } from "@/lib/api/types";

interface WordCardProps {
  word: string;
  anchorEl: HTMLElement;
  onClose: () => void;
}

export function WordCard({ word, anchorEl, onClose }: WordCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [data, setData] = useState<VocabularyCardData | null>(
    () => getCached(word, locale) ?? null,
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(false);
  const { speak, playing } = useFrenchSpeech();

  useEffect(() => {
    if (data) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    getVocabularyCard(word, locale)
      .then((res) => {
        if (cancelled) return;
        setCache(word, res, locale);
        setData(res);
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
  }, [word, data, locale]);

  const handleSpeak = useCallback(() => {
    speak(word, data?.audio_url);
  }, [speak, word, data?.audio_url]);

  // Gender color: blue for masculin, rose for féminin
  const genderColor =
    data?.gender === "masculin"
      ? "text-blue-600 dark:text-blue-400"
      : data?.gender === "féminin"
        ? "text-rose-600 dark:text-rose-400"
        : "";

  const isVerb = !!(data?.present || data?.passe_compose);
  const isAdj = !!data?.adjective_forms;

  // Clean up null-like values from backend
  const article = data?.article && data.article !== "null" ? data.article : null;
  const pluralForm = data?.plural_form && data.plural_form !== "null" ? data.plural_form : null;
  const pos = data?.part_of_speech && data.part_of_speech !== "OTHER" ? data.part_of_speech : null;

  // Resolve native meaning (prefer meaning_native, fall back to legacy fields)
  const nativeMeaning = data?.meaning_native
    || (locale === "zh" ? data?.meaning_zh : null)
    || (locale === "en" ? data?.meaning_en : null);

  return (
    <Popover open onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor virtualRef={{ current: anchorEl }} />
      <PopoverContent
        className="w-80 max-h-[70vh] overflow-y-auto p-0"
        side="bottom"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-3 space-y-2.5">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">{t("wordCard.loading")}</span>
            </div>
          ) : error ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {t("wordCard.error")}
            </div>
          ) : data ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  {article && (
                    <span className={`text-sm ${genderColor}`}>
                      {article}
                    </span>
                  )}
                  <span className={`text-lg font-semibold ${genderColor || "text-foreground"}`}>
                    {data.display_form}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSpeak}
                    className="rounded-full p-1 hover:bg-muted transition-colors"
                    title="Prononciation"
                  >
                    <Volume2
                      className={`h-4 w-4 ${playing ? "text-blue-500 animate-pulse" : "text-muted-foreground"}`}
                    />
                  </button>
                  {data.cefr_level && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {data.cefr_level}
                    </Badge>
                  )}
                </div>
              </div>

              {/* IPA + POS + Gender */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {data.ipa && <span className="font-mono">{data.ipa}</span>}
                {pos && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {pos}
                  </Badge>
                )}
                {data.gender && data.gender !== "null" && (
                  <span className={genderColor}>{data.gender}</span>
                )}
              </div>

              {/* Meanings: native (primary) + EN bridge (secondary, hidden if locale=en) */}
              <div className="space-y-0.5">
                {nativeMeaning && (
                  <p className="text-sm font-medium">{nativeMeaning}</p>
                )}
                {locale !== "en" && data.meaning_en && (
                  <p className="text-xs text-muted-foreground">{data.meaning_en}</p>
                )}
              </div>

              {/* Plural form (noun) */}
              {pluralForm && (
                <p className="text-xs text-muted-foreground">
                  {t("wordCard.plural", { form: pluralForm })}
                </p>
              )}

              {/* Verb conjugation */}
              {isVerb && <VerbConjugation data={data} />}

              {/* Adjective forms */}
              {isAdj && data.adjective_forms && (
                <div>
                  <h4 className="mb-1 text-xs font-medium text-muted-foreground">{t("wordCard.adjForms")}</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="rounded bg-muted/50 px-2 py-1">
                      <span className="text-muted-foreground">{t("wordCard.mascSg")} </span>
                      <span className="font-medium">{data.adjective_forms.masculine_singular}</span>
                    </div>
                    <div className="rounded bg-muted/50 px-2 py-1">
                      <span className="text-muted-foreground">{t("wordCard.femSg")} </span>
                      <span className="font-medium">{data.adjective_forms.feminine_singular}</span>
                    </div>
                    <div className="rounded bg-muted/50 px-2 py-1">
                      <span className="text-muted-foreground">{t("wordCard.mascPl")} </span>
                      <span className="font-medium">{data.adjective_forms.masculine_plural}</span>
                    </div>
                    <div className="rounded bg-muted/50 px-2 py-1">
                      <span className="text-muted-foreground">{t("wordCard.femPl")} </span>
                      <span className="font-medium">{data.adjective_forms.feminine_plural}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Examples */}
              {data.examples.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-medium text-muted-foreground">{t("wordCard.examples")}</h4>
                  {data.examples.map((ex, i) => {
                    // Resolve native text for this example
                    const exNative = ex.native
                      || (locale === "zh" ? ex.zh : null)
                      || (locale === "en" ? ex.en : null);

                    return (
                      <div key={i} className="rounded bg-muted/30 px-2 py-1.5 text-xs space-y-0.5">
                        <p className="italic text-foreground">{ex.fr}</p>
                        {/* English bridge (always shown) */}
                        {ex.en && (
                          <p className="text-muted-foreground">{ex.en}</p>
                        )}
                        {/* Native translation (only for non-EN users, when available) */}
                        {locale !== "en" && exNative && (
                          <p className="text-emerald-600 dark:text-emerald-400">{exNative}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Verb conjugation tabs */
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
          {tenses.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="h-6 px-1.5 text-[10px]"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tenses.map((t) => (
          <TabsContent key={t.key} value={t.key} className="mt-1.5">
            <ConjugationGrid table={t.table!} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Past participle + auxiliary */}
      {(data.past_participle || data.auxiliary) && (
        <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
          {data.past_participle && (
            <span>
              {t("wordCard.pastParticiple", { form: data.past_participle })}
            </span>
          )}
          {data.auxiliary && (
            <span>
              {t("wordCard.auxiliary", { aux: data.auxiliary })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** 2-column grid for a conjugation tense */
function ConjugationGrid({ table }: { table: ConjugationTable }) {
  const rows: [string, string][] = [
    ["je", "nous"],
    ["tu", "vous"],
    ["il", "ils"],
  ];

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
