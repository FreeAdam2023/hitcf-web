import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReferralView } from "./referral-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.referral" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/referral`,
      languages: { zh: "/zh/referral", en: "/en/referral", fr: "/fr/referral", ar: "/ar/referral" },
    },
  };
}

export default function ReferralPage() {
  return <ReferralView />;
}
