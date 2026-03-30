"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/locales";

import zhMessages from "@/i18n/messages/zh.json";
import enMessages from "@/i18n/messages/en.json";
import frMessages from "@/i18n/messages/fr.json";

// Locale files may have slightly different key sets (e.g. guide pages not yet
// translated). Use a loose record type so TS doesn't require exact structural
// match across every locale JSON file.
type Messages = Record<string, unknown>;

// ar.json loaded lazily to avoid bundling ~60KB for non-Arabic users
let arMessagesCache: Messages | null = null;
async function loadArMessages() {
  if (!arMessagesCache) {
    arMessagesCache = (await import("@/i18n/messages/ar.json")).default as Messages;
  }
  return arMessagesCache;
}

const messagesMap: Record<Locale, Messages | null> = {
  zh: zhMessages,
  en: enMessages,
  fr: frMessages,
  ar: null, // loaded lazily
};

export function LocaleProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const validLocale = (SUPPORTED_LOCALES.includes(locale as Locale) ? locale : "en") as Locale;
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname()!;

  // READ-ONLY sync: redirect URL to match user's saved ui_language preference.
  // IMPORTANT: This must NEVER write to ui_language. Only user-initiated actions
  // (locale toggle, account settings) are allowed to change ui_language in the DB.
  const userLocale = user?.ui_language;
  useEffect(() => {
    if (
      userLocale &&
      SUPPORTED_LOCALES.includes(userLocale as Locale) &&
      userLocale !== validLocale
    ) {
      const pathWithoutLocale = pathname.replace(/^\/(zh|en|fr|ar)/, "") || "/";
      router.replace(`/${userLocale}${pathWithoutLocale}`);
    }
  }, [userLocale, validLocale, router, pathname]);

  const [arMessages, setArMessages] = useState<Messages | null>(arMessagesCache);
  const messages = validLocale === "ar" ? (arMessages || enMessages) : (messagesMap[validLocale] || enMessages);

  // Lazy-load Arabic messages
  useEffect(() => {
    if (validLocale === "ar" && !arMessagesCache) {
      loadArMessages().then(setArMessages);
    }
  }, [validLocale]);

  // Keep <html> dir attribute in sync (RTL for Arabic)
  useEffect(() => {
    document.documentElement.dir = validLocale === "ar" ? "rtl" : "ltr";
  }, [validLocale]);

  return (
    <NextIntlClientProvider locale={validLocale} messages={messages} timeZone="America/Toronto">
      {children}
    </NextIntlClientProvider>
  );
}
