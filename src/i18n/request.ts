import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from "./locales";

export default getRequestConfig(async () => {
  // In SSR context we default to zh; client-side locale is handled by the provider
  const locale: Locale = DEFAULT_LOCALE;
  return {
    locale,
    timeZone: "America/Toronto",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

export async function getMessages(locale: string) {
  const validLocale = SUPPORTED_LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : DEFAULT_LOCALE;
  return (await import(`./messages/${validLocale}.json`)).default;
}
