import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.privacy" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/privacy-policy`,
      languages: { zh: "/zh/privacy-policy", en: "/en/privacy-policy", fr: "/fr/privacy-policy", ar: "/ar/privacy-policy" },
    },
  };
}

const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
const email = (chunks: React.ReactNode) => (
  <a href="mailto:support@hitcf.com">{chunks}</a>
);

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("privacyPage");

  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>{t("heading")}</h1>
      <p className="text-sm text-muted-foreground">{t("lastUpdated")}</p>

      <p>{t("intro")}</p>

      <h2>{t("infoCollect.title")}</h2>

      <h3>{t("infoCollect.authTitle")}</h3>
      <p>{t("infoCollect.authP1")}</p>
      <ul>
        <li>{t("infoCollect.authLi1")}</li>
        <li>{t("infoCollect.authLi2")}</li>
      </ul>

      <h3>{t("infoCollect.payTitle")}</h3>
      <p>{t.rich("infoCollect.payP1", { b: bold })}</p>
      <ul>
        <li>{t("infoCollect.payLi1")}</li>
        <li>{t("infoCollect.payLi2")}</li>
        <li>{t("infoCollect.payLi3")}</li>
      </ul>

      <h3>{t("infoCollect.usageTitle")}</h3>
      <p>{t("infoCollect.usageP1")}</p>
      <ul>
        <li>{t("infoCollect.usageLi1")}</li>
        <li>{t("infoCollect.usageLi2")}</li>
        <li>{t("infoCollect.usageLi3")}</li>
      </ul>

      <h3>{t("infoCollect.cookieTitle")}</h3>
      <p>{t("infoCollect.cookieP1")}</p>
      <ul>
        <li>{t.rich("infoCollect.cookieLi1", { b: bold })}</li>
        <li>{t.rich("infoCollect.cookieLi2", { b: bold })}</li>
      </ul>
      <p>{t.rich("infoCollect.cookieP2", { b: bold })}</p>

      <h2>{t("purpose.title")}</h2>
      <p>{t("purpose.p1")}</p>
      <ul>
        <li>{t("purpose.li1")}</li>
        <li>{t("purpose.li2")}</li>
        <li>{t("purpose.li3")}</li>
        <li>{t("purpose.li4")}</li>
        <li>{t("purpose.li5")}</li>
      </ul>
      <p>{t.rich("purpose.p2", { b: bold })}</p>

      <h2>{t("storage.title")}</h2>
      <ul>
        <li>{t("storage.li1")}</li>
        <li>{t("storage.li2")}</li>
        <li>{t("storage.li3")}</li>
        <li>{t("storage.li4")}</li>
      </ul>

      <h2>{t("thirdParty.title")}</h2>
      <p>{t("thirdParty.p1")}</p>
      <table>
        <thead>
          <tr>
            <th>{t("thirdParty.thService")}</th>
            <th>{t("thirdParty.thPurpose")}</th>
            <th>{t("thirdParty.thData")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Stripe</td>
            <td>{t("thirdParty.stripe")}</td>
            <td>{t("thirdParty.stripeData")}</td>
          </tr>
          <tr>
            <td>Azure Blob Storage</td>
            <td>{t("thirdParty.azure")}</td>
            <td>{t("thirdParty.azureData")}</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>{t("thirdParty.vercel")}</td>
            <td>{t("thirdParty.vercelData")}</td>
          </tr>
        </tbody>
      </table>

      <h2>{t("retention.title")}</h2>
      <ul>
        <li>{t("retention.li1")}</li>
        <li>{t("retention.li2")}</li>
        <li>{t("retention.li3")}</li>
      </ul>

      <h2>{t("rights.title")}</h2>
      <p>{t("rights.p1")}</p>
      <ul>
        <li>{t.rich("rights.li1", { b: bold })}</li>
        <li>{t.rich("rights.li2", { b: bold })}</li>
        <li>{t.rich("rights.li3", { b: bold })}</li>
        <li>{t.rich("rights.li4", { b: bold })}</li>
        <li>{t.rich("rights.li5", { b: bold })}</li>
      </ul>
      <p>{t.rich("rights.p2", { email })}</p>

      <h2>{t("minors.title")}</h2>
      <p>{t("minors.p1")}</p>

      <h2>{t("crossBorder.title")}</h2>
      <p>{t("crossBorder.p1")}</p>

      <h2>{t("policyChanges.title")}</h2>
      <p>{t("policyChanges.p1")}</p>

      <h2>{t("contact.title")}</h2>
      <p>{t("contact.p1")}</p>
      <ul>
        <li>{t.rich("contact.li1", { email })}</li>
      </ul>
    </article>
  );
}
