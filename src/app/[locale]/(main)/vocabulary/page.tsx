import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { VocabularyView } from "./vocabulary-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.vocabulary" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/vocabulary`,
      languages: { zh: "/zh/vocabulary", en: "/en/vocabulary", fr: "/fr/vocabulary", ar: "/ar/vocabulary" },
    },
  };
}

export default function VocabularyPage() {
  return <VocabularyView />;
}
