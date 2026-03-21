import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.guideTcfWriting" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(","),
    alternates: {
      canonical: `/${locale}/guide/tcf-writing`,
      languages: {
        zh: "/zh/guide/tcf-writing",
        en: "/en/guide/tcf-writing",
        fr: "/fr/guide/tcf-writing",
        ar: "/ar/guide/tcf-writing",
      },
    },
  };
}

export default async function TcfWritingGuidePage() {
  const t = await getTranslations("guide.tcfWriting");

  return (
    <>
      <h1>{t("heading")}</h1>
      <p className="lead">{t("intro")}</p>

      <h2>{t("format.title")}</h2>
      <p>{t("format.p1")}</p>

      <h3>{t("format.task1.title")}</h3>
      <p>{t("format.task1.desc")}</p>

      <h3>{t("format.task2.title")}</h3>
      <p>{t("format.task2.desc")}</p>

      <h3>{t("format.task3.title")}</h3>
      <p>{t("format.task3.desc")}</p>

      <h2>{t("scoring.title")}</h2>
      <p>{t("scoring.p1")}</p>
      <p>{t("scoring.p2")}</p>

      <h2>{t("tips.title")}</h2>
      <ul>
        <li>{t("tips.tip1")}</li>
        <li>{t("tips.tip2")}</li>
        <li>{t("tips.tip3")}</li>
        <li>{t("tips.tip4")}</li>
        <li>{t("tips.tip5")}</li>
      </ul>

      <h2>{t("methodology.title")}</h2>
      <p>{t("methodology.p1")}</p>
      <p>{t("methodology.p2")}</p>

      <h2>{t("cta.title")}</h2>
      <p>{t("cta.desc")}</p>
      <div className="not-prose flex flex-wrap gap-4">
        <Link
          href="/writing-mock-exam"
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
