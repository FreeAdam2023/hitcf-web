import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ThemeWordsView } from "./theme-words-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.vocabularyThemeWords" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/vocabulary/theme-words`,
      languages: { zh: "/zh/vocabulary/theme-words", en: "/en/vocabulary/theme-words", fr: "/fr/vocabulary/theme-words", ar: "/ar/vocabulary/theme-words" },
    },
  };
}

export default function ThemeWordsPage() {
  return <ThemeWordsView />;
}
