import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.guideTcfCanada" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(","),
    alternates: {
      canonical: `/${locale}/guide/tcf-canada`,
      languages: {
        zh: "/zh/guide/tcf-canada",
        en: "/en/guide/tcf-canada",
        fr: "/fr/guide/tcf-canada",
        ar: "/ar/guide/tcf-canada",
      },
    },
  };
}

export default async function TcfCanadaGuidePage() {
  const t = await getTranslations("guide.tcfCanada");

  return (
    <>
      <h1>{t("heading")}</h1>
      <p className="lead">{t("intro")}</p>

      <h2>{t("whatIs.title")}</h2>
      <p>{t("whatIs.p1")}</p>
      <p>{t("whatIs.p2")}</p>

      <h2>{t("structure.title")}</h2>
      <p>{t("structure.intro")}</p>

      <h3>{t("structure.co.title")}</h3>
      <p>{t("structure.co.desc")}</p>

      <h3>{t("structure.ce.title")}</h3>
      <p>{t("structure.ce.desc")}</p>

      <h3>{t("structure.eo.title")}</h3>
      <p>{t("structure.eo.desc")}</p>

      <h3>{t("structure.ee.title")}</h3>
      <p>{t("structure.ee.desc")}</p>

      <h2>{t("scoring.title")}</h2>
      <p>{t("scoring.p1")}</p>
      <p>{t("scoring.p2")}</p>

      <h3>{t("scoring.nclc.title")}</h3>
      <p>{t("scoring.nclc.desc")}</p>

      <h2>{t("immigration.title")}</h2>
      <p>{t("immigration.p1")}</p>
      <p>{t("immigration.p2")}</p>

      <h2>{t("cta.title")}</h2>
      <p>{t("cta.desc")}</p>
      <div className="not-prose flex flex-wrap gap-4">
        <Link
          href="/tests"
          className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("cta.practiceButton")}
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
        >
          {t("cta.pricingButton")}
        </Link>
      </div>
    </>
  );
}
