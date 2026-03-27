import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReferenceView } from "./reference-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.reference" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/reference`,
      languages: {
        zh: "/zh/reference",
        en: "/en/reference",
        fr: "/fr/reference",
        ar: "/ar/reference",
      },
    },
  };
}

export default function ReferencePage() {
  return <ReferenceView />;
}
