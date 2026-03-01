import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountView } from "./account-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.account");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/account" },
  };
}

export default function AccountPage() {
  return <AccountView />;
}
