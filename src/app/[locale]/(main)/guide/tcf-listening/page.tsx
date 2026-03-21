import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.guideTcfListening" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(","),
    alternates: {
      canonical: `/${locale}/guide/tcf-listening`,
      languages: {
        zh: "/zh/guide/tcf-listening",
        en: "/en/guide/tcf-listening",
        fr: "/fr/guide/tcf-listening",
        ar: "/ar/guide/tcf-listening",
      },
    },
  };
}

export default async function TcfListeningGuidePage() {
  const t = await getTranslations("guide.tcfListening");

  return (
    <>
      <h1>{t("heading")}</h1>
      <p className="lead">{t("intro")}</p>

      <h2>{t("format.title")}</h2>
      <p>{t("format.p1")}</p>
      <p>{t("format.p2")}</p>

      <h2>{t("levels.title")}</h2>

      <h3>{t("levels.a1a2.title")}</h3>
      <p>{t("levels.a1a2.desc")}</p>

      <h3>{t("levels.a2b1.title")}</h3>
      <p>{t("levels.a2b1.desc")}</p>

      <h3>{t("levels.b1b2.title")}</h3>
      <p>{t("levels.b1b2.desc")}</p>

      <h3>{t("levels.b2c1.title")}</h3>
      <p>{t("levels.b2c1.desc")}</p>

      <h2>{t("tips.title")}</h2>
      <ul>
        <li>{t("tips.tip1")}</li>
        <li>{t("tips.tip2")}</li>
        <li>{t("tips.tip3")}</li>
        <li>{t("tips.tip4")}</li>
        <li>{t("tips.tip5")}</li>
      </ul>

      <h2>{t("practice.title")}</h2>
      <p>{t("practice.desc")}</p>

      <h2>{t("cta.title")}</h2>
      <p>{t("cta.desc")}</p>
      <div className="not-prose flex flex-wrap gap-4">
        <Link
          href="/tests?type=listening"
          className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("cta.practiceButton")}
        </Link>
        <Link
          href="/guide/tcf-canada"
          className="inline-flex items-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
        >
          {t("cta.overviewButton")}
        </Link>
      </div>
    </>
  );
}
