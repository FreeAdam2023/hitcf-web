import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { STATS_PARAMS } from "@/lib/constants";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { PricingView } from "./pricing-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.pricing" });
  return {
    title: t("title", STATS_PARAMS),
    description: t("description", STATS_PARAMS),
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: { zh: "/zh/pricing", en: "/en/pricing", fr: "/fr/pricing", ar: "/ar/pricing" },
    },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <BreadcrumbJsonLd locale={locale} items={[{ name: "HiTCF", href: "/" }, { name: "Pricing" }]} />
      <PricingView />
    </>
  );
}
