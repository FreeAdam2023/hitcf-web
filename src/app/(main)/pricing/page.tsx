import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PricingView } from "./pricing-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.pricing");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/pricing" },
  };
}

export default function PricingPage() {
  return <PricingView />;
}
