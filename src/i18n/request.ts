import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from "./locales";

export default getRequestConfig(async () => {
  let locale: Locale = DEFAULT_LOCALE;
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("NEXT_LOCALE")?.value;
    if (raw && SUPPORTED_LOCALES.includes(raw as Locale)) {
      locale = raw as Locale;
    }
  } catch {
    // cookies() not available during build — fall back to default
  }
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
