import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LandingPage } from "./landing-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("home.title"),
    description: t("home.description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { zh: "/zh", en: "/en", fr: "/fr", ar: "/ar" },
    },
  };
}

export default function Home() {
  return <LandingPage />;
}
