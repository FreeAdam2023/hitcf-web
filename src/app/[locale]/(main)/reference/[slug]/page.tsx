import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReferenceDetail } from "./reference-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta.reference" });
  return {
    title: `${slug} - ${t("title")}`,
    alternates: {
      canonical: `/${locale}/reference/${slug}`,
      languages: {
        zh: `/zh/reference/${slug}`,
        en: `/en/reference/${slug}`,
        fr: `/fr/reference/${slug}`,
        ar: `/ar/reference/${slug}`,
      },
    },
  };
}

export default function ReferenceTopicPage() {
  return <ReferenceDetail />;
}
