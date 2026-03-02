import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta.terms");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/terms-of-service" },
  };
}

const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
const email = (chunks: React.ReactNode) => (
  <a href="mailto:support@hitcf.com">{chunks}</a>
);

export default async function TermsOfServicePage() {
  const t = await getTranslations("termsPage");

  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>{t("heading")}</h1>
      <p className="text-sm text-muted-foreground">{t("lastUpdated")}</p>

      <p>{t("intro")}</p>

      <h2>{t("service.title")}</h2>
      <p>{t.rich("service.p1", { b: bold })}</p>

      <h2>{t("account.title")}</h2>
      <ul>
        <li>{t("account.li1")}</li>
        <li>{t("account.li2")}</li>
        <li>{t("account.li3")}</li>
      </ul>

      <h2>{t("subscription.title")}</h2>
      <ul>
        <li>{t("subscription.li1")}</li>
        <li>{t.rich("subscription.li2", { b: bold })}</li>
        <li>{t("subscription.li3")}</li>
        <li>{t("subscription.li4")}</li>
        <li>{t.rich("subscription.li5", { refund: (chunks) => <Link href="/refund-policy">{chunks}</Link> })}</li>
      </ul>

      <h2>{t("trial.title")}</h2>
      <p>{t("trial.p1")}</p>

      <h2>{t("acceptableUse.title")}</h2>
      <p>{t("acceptableUse.p1")}</p>
      <ul>
        <li>{t("acceptableUse.li1")}</li>
        <li>{t("acceptableUse.li2")}</li>
        <li>{t("acceptableUse.li3")}</li>
        <li>{t("acceptableUse.li4")}</li>
      </ul>

      <h2>{t("ip.title")}</h2>
      <ul>
        <li>{t("ip.li1")}</li>
        <li>{t.rich("ip.li2", { email })}</li>
        <li>{t("ip.li3")}</li>
      </ul>

      <h2>{t("disclaimer.title")}</h2>
      <ul>
        <li>{t.rich("disclaimer.li1", { b: bold })}</li>
        <li>{t.rich("disclaimer.li2", { b: bold })}</li>
        <li>{t("disclaimer.li3")}</li>
        <li>{t.rich("disclaimer.li4", { disclaimerLink: (chunks) => <Link href="/disclaimer">{chunks}</Link> })}</li>
      </ul>

      <h2>{t("serviceChanges.title")}</h2>
      <p>{t("serviceChanges.p1")}</p>

      <h2>{t("liability.title")}</h2>
      <p>{t("liability.p1")}</p>

      <h2>{t("governing.title")}</h2>
      <p>{t("governing.p1")}</p>

      <h2>{t("modifications.title")}</h2>
      <p>{t("modifications.p1")}</p>

      <h2>{t("contact.title")}</h2>
      <p>{t.rich("contact.p1", { email })}</p>
    </article>
  );
}
