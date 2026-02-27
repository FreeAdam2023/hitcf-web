"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/i18n/locales";

import zhMessages from "@/i18n/messages/zh.json";
import enMessages from "@/i18n/messages/en.json";

const messagesMap: Record<Locale, typeof zhMessages> = {
  zh: zhMessages,
  en: enMessages,
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const rawLocale = user?.ui_language;
  const locale: Locale =
    rawLocale && SUPPORTED_LOCALES.includes(rawLocale as Locale)
      ? (rawLocale as Locale)
      : DEFAULT_LOCALE;

  const messages = messagesMap[locale];

  // Update <html lang> attribute when locale changes
  useEffect(() => {
    const langMap: Record<Locale, string> = { zh: "zh-CN", en: "en" };
    document.documentElement.lang = langMap[locale] || locale;
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
