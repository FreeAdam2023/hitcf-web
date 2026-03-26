import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { STATS_PARAMS } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.refund" });
  return {
    title: t("title"),
    description: t("description", STATS_PARAMS),
    alternates: {
      canonical: `/${locale}/refund-policy`,
      languages: { zh: "/zh/refund-policy", en: "/en/refund-policy", fr: "/fr/refund-policy", ar: "/ar/refund-policy" },
    },
  };
}

const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
const email = (chunks: React.ReactNode) => (
  <a href="mailto:support@hitcf.com">{chunks}</a>
);

export default async function RefundPolicyPage() {
  const t = await getTranslations("refundPage");

  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>{t("heading")}</h1>
      <p className="text-sm text-muted-foreground">{t("lastUpdated")}</p>

      <p>{t("intro")}</p>

      <h2>{t("freeTrial.title")}</h2>
      <ul>
        <li>{t.rich("freeTrial.li1", { b: bold, ...STATS_PARAMS })}</li>
        <li>{t("freeTrial.li2")}</li>
        <li>{t("freeTrial.li3")}</li>
        <li>{t("freeTrial.li4")}</li>
      </ul>

      <h2>{t("cancellation.title")}</h2>
      <ul>
        <li>{t.rich("cancellation.li1", { pricing: (chunks) => <Link href="/pricing">{chunks}</Link> })}</li>
        <li>{t("cancellation.li2")}</li>
        <li>{t.rich("cancellation.li3", { b: bold })}</li>
      </ul>

      <h2>{t("conditions.title")}</h2>
      <p>{t("conditions.p1")}</p>

      <h3>{t("conditions.fullTitle")}</h3>
      <ul>
        <li>{t.rich("conditions.fullLi1", { b: bold })}</li>
        <li>{t("conditions.fullLi2")}</li>
        <li>{t("conditions.fullLi3")}</li>
      </ul>

      <h3>{t("conditions.proTitle")}</h3>
      <ul>
        <li>{t.rich("conditions.proLi1", { b: bold, ...STATS_PARAMS })}</li>
      </ul>

      <h3>{t("conditions.noTitle")}</h3>
      <ul>
        <li>{t("conditions.noLi1")}</li>
        <li>{t("conditions.noLi2", STATS_PARAMS)}</li>
        <li>{t("conditions.noLi3")}</li>
        <li>{t.rich("conditions.noLi4", { disclaimerLink: (chunks) => <Link href="/disclaimer">{chunks}</Link> })}</li>
        <li>{t.rich("conditions.noLi5", { termsLink: (chunks) => <Link href="/terms-of-service">{chunks}</Link> })}</li>
      </ul>

      <h2>{t("process.title")}</h2>
      <ol>
        <li>
          {t.rich("process.step1", { email })}
          <ul>
            <li>{t("process.step1Li1")}</li>
            <li>{t("process.step1Li2")}</li>
            <li>{t("process.step1Li3")}</li>
          </ul>
        </li>
        <li>{t.rich("process.step2", { b: bold })}</li>
        <li>{t.rich("process.step3", { b: bold })}</li>
      </ol>

      <h2>{t("disputes.title")}</h2>
      <p>{t.rich("disputes.p1", { b: bold })}</p>

      <h2>{t("contact.title")}</h2>
      <p>{t.rich("contact.p1", { email })}</p>
    </article>
  );
}
