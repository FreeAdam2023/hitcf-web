import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LandingPage } from "./landing-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.home");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/" },
  };
}

export default function Home() {
  return <LandingPage />;
}
