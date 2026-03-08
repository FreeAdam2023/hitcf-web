export const SUPPORTED_LOCALES = ["zh", "en", "fr", "ar"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  zh: "中文",
  en: "English",
  fr: "Français",
  ar: "العربية",
};
