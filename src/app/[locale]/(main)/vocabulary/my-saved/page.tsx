import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SavedWordsView } from "./saved-words-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.vocabularyMySaved" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/vocabulary/my-saved`,
      languages: { zh: "/zh/vocabulary/my-saved", en: "/en/vocabulary/my-saved", fr: "/fr/vocabulary/my-saved", ar: "/ar/vocabulary/my-saved" },
    },
  };
}

export default function MySavedPage() {
  return <SavedWordsView />;
}
