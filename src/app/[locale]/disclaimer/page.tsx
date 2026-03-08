import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.disclaimer" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/disclaimer`,
      languages: { zh: "/zh/disclaimer", en: "/en/disclaimer", fr: "/fr/disclaimer", ar: "/ar/disclaimer" },
    },
  };
}

const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
const email = (chunks: React.ReactNode) => (
  <a href="mailto:support@hitcf.com">{chunks}</a>
);

export default async function DisclaimerPage() {
  const t = await getTranslations("disclaimerPage");

  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>{t("heading")}</h1>
      <p className="text-sm text-muted-foreground">{t("lastUpdated")}</p>

      <h2>{t("notOfficial.title")}</h2>
      <p>{t.rich("notOfficial.p1", { b: bold })}</p>
      <p>{t("notOfficial.p2")}</p>

      <h2>{t("noGuarantee.title")}</h2>
      <p>{t.rich("noGuarantee.p1", { b: bold })}</p>
      <ul>
        <li>{t.rich("noGuarantee.li1", { b: bold })}</li>
        <li>{t("noGuarantee.li2")}</li>
        <li>{t.rich("noGuarantee.li3", { b: bold })}</li>
      </ul>

      <h2>{t("contentSources.title")}</h2>
      <ul>
        <li>{t.rich("contentSources.li1", { b: bold })}</li>
        <li>{t.rich("contentSources.li2", { b: bold })}</li>
        <li>{t.rich("contentSources.li3", { email })}</li>
        <li>{t("contentSources.li4")}</li>
      </ul>

      <h2>{t("notImmigrationAdvice.title")}</h2>
      <p>{t.rich("notImmigrationAdvice.p1", { b: bold })}</p>

      <h2>{t("thirdPartyLinks.title")}</h2>
      <p>{t("thirdPartyLinks.p1")}</p>

      <h2>{t("userReviews.title")}</h2>
      <p>{t.rich("userReviews.p1", { b: bold })}</p>

      <h2>{t("serviceAvailability.title")}</h2>
      <p>{t("serviceAvailability.p1")}</p>

      <h2>{t("liability.title")}</h2>
      <p>{t("liability.p1")}</p>
      <ul>
        <li>{t("liability.li1")}</li>
        <li>{t("liability.li2")}</li>
        <li>{t("liability.li3")}</li>
      </ul>

      <h2>{t("contact.title")}</h2>
      <p>{t.rich("contact.p1", { email })}</p>

      <p className="mt-8 text-sm text-muted-foreground">
        {t.rich("footerLinks", {
          terms: (chunks) => <Link href="/terms-of-service">{chunks}</Link>,
          privacy: (chunks) => <Link href="/privacy-policy">{chunks}</Link>,
          refund: (chunks) => <Link href="/refund-policy">{chunks}</Link>,
        })}
      </p>
    </article>
  );
}
