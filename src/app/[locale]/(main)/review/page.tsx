import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReviewPage } from "./review-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.review" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/review`,
      languages: { zh: "/zh/review", en: "/en/review", fr: "/fr/review", ar: "/ar/review" },
    },
  };
}

export default function Page() {
  return <ReviewPage />;
}
