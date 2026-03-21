import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.guideClb7" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(","),
    alternates: {
      canonical: `/${locale}/guide/clb-7`,
      languages: {
        zh: "/zh/guide/clb-7",
        en: "/en/guide/clb-7",
        fr: "/fr/guide/clb-7",
        ar: "/ar/guide/clb-7",
      },
    },
  };
}

export default async function Clb7GuidePage() {
  const t = await getTranslations("guide.clb7");

  return (
    <>
      <h1>{t("heading")}</h1>
      <p className="lead">{t("intro")}</p>

      <h2>{t("whatIsClb7.title")}</h2>
      <p>{t("whatIsClb7.p1")}</p>
      <p>{t("whatIsClb7.p2")}</p>

      <h2>{t("targetScores.title")}</h2>
      <p>{t("targetScores.intro")}</p>
      <ul>
        <li>{t("targetScores.co")}</li>
        <li>{t("targetScores.ce")}</li>
        <li>{t("targetScores.eo")}</li>
        <li>{t("targetScores.ee")}</li>
      </ul>

      <h2>{t("strategies.title")}</h2>

      <h3>{t("strategies.listening.title")}</h3>
      <p>{t("strategies.listening.desc")}</p>

      <h3>{t("strategies.reading.title")}</h3>
      <p>{t("strategies.reading.desc")}</p>

      <h3>{t("strategies.speaking.title")}</h3>
      <p>{t("strategies.speaking.desc")}</p>

      <h3>{t("strategies.writing.title")}</h3>
      <p>{t("strategies.writing.desc")}</p>

      <h2>{t("howHitcfHelps.title")}</h2>
      <p>{t("howHitcfHelps.intro")}</p>
      <ul>
        <li>{t("howHitcfHelps.feature1")}</li>
        <li>{t("howHitcfHelps.feature2")}</li>
        <li>{t("howHitcfHelps.feature3")}</li>
        <li>{t("howHitcfHelps.feature4")}</li>
        <li>{t("howHitcfHelps.feature5")}</li>
      </ul>

      <h2>{t("cta.title")}</h2>
      <p>{t("cta.desc")}</p>
      <div className="not-prose flex flex-wrap gap-4">
        <Link
          href="/pricing"
          className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("cta.pricingButton")}
        </Link>
        <Link
          href="/tests"
          className="inline-flex items-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
        >
          {t("cta.practiceButton")}
        </Link>
      </div>
    </>
  );
}
