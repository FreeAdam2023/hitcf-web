import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ExpressionsPoolView } from "./expressions-pool-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.vocabularyExpressions" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/vocabulary/expressions`,
      languages: { zh: "/zh/vocabulary/expressions", en: "/en/vocabulary/expressions", fr: "/fr/vocabulary/expressions", ar: "/ar/vocabulary/expressions" },
    },
  };
}

export default function ExpressionsPage() {
  return <ExpressionsPoolView />;
}
