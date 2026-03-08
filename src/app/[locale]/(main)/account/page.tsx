import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountView } from "./account-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.account" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/account`,
      languages: { zh: "/zh/account", en: "/en/account", fr: "/fr/account", ar: "/ar/account" },
    },
  };
}

export default function AccountPage() {
  return <AccountView />;
}
