import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PricingView } from "./pricing-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.pricing" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: { zh: "/zh/pricing", en: "/en/pricing", fr: "/fr/pricing", ar: "/ar/pricing" },
    },
  };
}

export default function PricingPage() {
  return <PricingView />;
}
