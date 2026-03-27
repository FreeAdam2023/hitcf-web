/**
 * Maps GrammarCard slugs (35 items, used in writing corrections)
 * to GrammarReference slugs (15 topics, the detailed reference handbook).
 *
 * This enables the "Learn more" link from correction badges to reference pages.
 */

const GRAMMAR_TO_REFERENCE: Record<string, string> = {
  // Tenses → reference topics
  present: "present-tense",
  "futur-proche": "future-conditional",
  "passe-recent": "past-tenses",
  "futur-simple": "future-conditional",
  imparfait: "past-tenses",
  "passe-compose": "past-tenses",
  "plus-que-parfait": "past-tenses",
  "passe-simple": "past-tenses",
  "futur-anterieur": "future-conditional",

  // Moods
  imperatif: "present-tense",
  "subjonctif-present": "subjunctive",
  "conditionnel-present": "future-conditional",
  "subjonctif-passe": "subjunctive",
  "conditionnel-passe": "future-conditional",

  // Pronouns
  "pronoms-coi": "object-pronouns",
  "pronoms-cod": "object-pronouns",
  "pronoms-y-en": "object-pronouns",
  "pronoms-relatifs": "other-pronouns",
  "double-pronoms": "object-pronouns",

  // Structures
  negation: "negation-questions",
  interrogation: "negation-questions",
  superlatif: "comparisons",
  comparatif: "comparisons",
  but: "tcf-exam-tips",
  "voix-passive": "present-tense",
  "cause-consequence": "tcf-exam-tips",
  "hypothese-si": "future-conditional",
  "discours-indirect": "past-tenses",
  "participe-present": "present-tense",
  gerondif: "present-tense",
  "infinitif-passe": "past-tenses",
  "concordance-des-temps": "past-tenses",
  "opposition-concession": "tcf-exam-tips",

  // Other
  "verbes-pronominaux": "present-tense",
  "accord-participe-passe": "past-tenses",
};

/**
 * Get the GrammarReference slug for a given GrammarCard slug.
 * Returns null if no mapping exists.
 */
export function getReferenceSluForGrammarPoint(
  grammarPointSlug: string,
): string | null {
  return GRAMMAR_TO_REFERENCE[grammarPointSlug] ?? null;
}
