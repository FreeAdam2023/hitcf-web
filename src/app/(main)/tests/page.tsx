import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TestList } from "./test-list";
import { PlacementBanner } from "@/components/shared/placement-banner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.tests");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/tests" },
  };
}

export default function TestsPage() {
  return (
    <div>
      <PlacementBanner />
      <TestList />
    </div>
  );
}
