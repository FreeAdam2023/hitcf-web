import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ExpressionsView } from "./expressions-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "expressions.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/expressions`,
      languages: {
        zh: "/zh/expressions",
        en: "/en/expressions",
        fr: "/fr/expressions",
        ar: "/ar/expressions",
      },
    },
  };
}

export default function ExpressionsPage() {
  return <ExpressionsView />;
}
