/**
 * Type/mode label keys — use with useTranslations('common'):
 *   t(`types.${type}`)   e.g. t('types.listening')
 *   t(`modes.${mode}`)   e.g. t('modes.practice')
 */
export const TYPE_KEYS = ["listening", "reading", "speaking", "writing"] as const;
export const MODE_KEYS = ["practice", "exam", "speed_drill"] as const;

/** Per-type colour classes for badges, borders, icons, backgrounds */
export const TYPE_COLORS: Record<
  string,
  { badge: string; border: string; icon: string; bg: string; iconBg: string; wash: string; accent: string }
> = {
  listening: {
    badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    border: "border-l-sky-500",
    icon: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
    wash: "from-sky-500/[0.06] via-sky-500/[0.02] to-transparent",
    accent: "sky",
  },
  reading: {
    badge: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
    border: "border-l-teal-500",
    icon: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950",
    iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
    wash: "from-teal-500/[0.06] via-teal-500/[0.02] to-transparent",
    accent: "teal",
  },
  speaking: {
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    border: "border-l-amber-500",
    icon: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    wash: "from-amber-500/[0.06] via-amber-500/[0.02] to-transparent",
    accent: "amber",
  },
  writing: {
    badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    border: "border-l-violet-500",
    icon: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950",
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    wash: "from-violet-500/[0.06] via-violet-500/[0.02] to-transparent",
    accent: "violet",
  },
};

export const LOGIN_URL = "/login";
export const CLB7_TARGET = 0.78;

/* ------------------------------------------------------------------ */
/*  Pricing — single source of truth for display amounts (USD)        */
/* ------------------------------------------------------------------ */
export const PRICING = {
  monthly: 19.9,
  quarterly: 49.9,
  semiannual: 69.9,
  currency: "USD",
  monthlyTrialDays: 3,
  quarterlyTrialDays: 3,
  semiannualTrialDays: 3,
  get quarterlyPerMonth() { return +(this.quarterly / 3).toFixed(2); },
  get semiannualPerMonth() { return +(this.semiannual / 6).toFixed(2); },
  get quarterlySavePercent() { return Math.round((1 - this.quarterly / (this.monthly * 3)) * 100); },
  get semiannualSavePercent() { return Math.round((1 - this.semiannual / (this.monthly * 6)) * 100); },
} as const;

/** Format a price for display, e.g. "US$19.90" */
export function formatPrice(amount: number, prefix = "US$"): string {
  const str = amount % 1 === 0 ? String(amount) : String(parseFloat(amount.toFixed(2)));
  return `${prefix}${str}`;
}

/* ------------------------------------------------------------------ */
/*  Site stats — single source of truth for all display numbers       */
/* ------------------------------------------------------------------ */
export const SITE_STATS = {
  /** Test-set counts */
  listeningSets: 42,
  readingSets: 42,
  speakingSets: "702",
  writingSets: 520,
  get listeningReadingSets() {
    return this.listeningSets + this.readingSets;
  },

  /** Question counts (display strings) */
  totalQuestions: "8,500+",
  totalTestSets: "1,200+",
  listeningQuestions: "1,600+",
  readingQuestions: "1,700+",
  speakingQuestions: "3,500+",
  writingQuestions: "1,500+",

  /** Bank display counts (landing page big numbers) */
  listeningReadingQuestions: "3,400+",
} as const;

/* ------------------------------------------------------------------ */
/*  Free-tier quotas                                                   */
/* ------------------------------------------------------------------ */
export const QUOTAS = {
  dailyQuestions: 5,
  dailyExplanations: 3,
  dailyVocabFlips: 20,
  dailySavedWords: 10,
} as const;

/**
 * Flattened string params for i18n interpolation.
 * Use: t("some.key", STATS_PARAMS)
 */
export const STATS_PARAMS: Record<string, string> = {
  listeningSets: String(SITE_STATS.listeningSets),
  readingSets: String(SITE_STATS.readingSets),
  speakingSets: String(SITE_STATS.speakingSets),
  writingSets: String(SITE_STATS.writingSets),
  listeningReadingSets: String(SITE_STATS.listeningReadingSets),
  totalQuestions: SITE_STATS.totalQuestions,
  totalTestSets: SITE_STATS.totalTestSets,
  listeningQuestions: SITE_STATS.listeningQuestions,
  readingQuestions: SITE_STATS.readingQuestions,
  speakingQuestions: SITE_STATS.speakingQuestions,
  writingQuestions: SITE_STATS.writingQuestions,
  listeningReadingQuestions: SITE_STATS.listeningReadingQuestions,
  dailyQuestions: String(QUOTAS.dailyQuestions),
  dailyExplanations: String(QUOTAS.dailyExplanations),
  dailyVocabFlips: String(QUOTAS.dailyVocabFlips),
  dailySavedWords: String(QUOTAS.dailySavedWords),
  dailyExports: "3",
  exportWordLimit: "2,000",
  monthlyTrialDays: String(PRICING.monthlyTrialDays),
  quarterlyTrialDays: String(PRICING.quarterlyTrialDays),
  semiannualTrialDays: String(PRICING.semiannualTrialDays),
  monthlyPrice: PRICING.monthly.toFixed(2),
  quarterlyPrice: PRICING.quarterly.toFixed(2),
  semiannualPrice: PRICING.semiannual.toFixed(2),
  semiannualPerMonth: PRICING.semiannualPerMonth.toFixed(2),
  quarterlyPerMonth: PRICING.quarterlyPerMonth.toFixed(2),
};
