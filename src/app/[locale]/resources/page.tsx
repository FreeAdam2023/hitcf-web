import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResourcesContent } from "./resources-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.resources" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(","),
    alternates: {
      canonical: `/${locale}/resources`,
      languages: { zh: "/zh/resources", en: "/en/resources", fr: "/fr/resources", ar: "/ar/resources" },
    },
  };
}

export default function ResourcesPage() {
  return <ResourcesContent />;
}
