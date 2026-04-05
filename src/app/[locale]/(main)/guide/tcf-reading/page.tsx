import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.guideTcfReading" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(","),
    alternates: {
      canonical: `/${locale}/guide/tcf-reading`,
      languages: {
        zh: "/zh/guide/tcf-reading",
        en: "/en/guide/tcf-reading",
        fr: "/fr/guide/tcf-reading",
        ar: "/ar/guide/tcf-reading",
      },
    },
  };
}

interface ScoringRow {
  range: string;
  level: string;
  pointsPerQ: string;
  subtotal: string;
  percent: string;
}

interface TrapItem {
  title: string;
  desc: string;
}

export default async function TcfReadingGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("guide.tcfReading");

  const scoringRows = t.raw("scoring.rows") as ScoringRow[];
  const trapItems = t.raw("traps.items") as TrapItem[];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
      "@type": "Question",
      name: t(`faq.q${n}.q`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq.q${n}.a`),
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("preparationPlan.title"),
    description: t("preparationPlan.intro"),
    step: [
      { key: "week1_2", position: 1 },
      { key: "week3_4", position: 2 },
      { key: "week5_6", position: 3 },
      { key: "week7_8", position: 4 },
    ].map((s) => ({
      "@type": "HowToStep",
      position: s.position,
      name: t(`preparationPlan.${s.key}.title`),
      text: t(`preparationPlan.${s.key}.actions`),
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "HiTCF", href: "/" },
          { name: "Guide", href: "/guide" },
          { name: t("heading") },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <h1>{t("heading")}</h1>
      <p className="lead">{t("intro")}</p>

      {/* Quick facts */}
      <h2>{t("quickFacts.title")}</h2>
      <ul>
        <li>{t("quickFacts.questions")}</li>
        <li>{t("quickFacts.duration")}</li>
        <li>{t("quickFacts.audio")}</li>
        <li>{t("quickFacts.totalScore")}</li>
        <li>{t("quickFacts.difficultyRange")}</li>
      </ul>

      {/* Format */}
      <h2>{t("format.title")}</h2>
      <p>{t("format.p1")}</p>
      <p>{t("format.p2")}</p>
      <p>{t("format.p3")}</p>
      <p>{t("format.p4")}</p>

      {/* Scoring weight table */}
      <h2>{t("scoring.title")}</h2>
      <p>{t("scoring.intro")}</p>
      <div className="not-prose overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-semibold">{t("scoring.tableHeader.range")}</th>
              <th className="px-3 py-2 text-left font-semibold">{t("scoring.tableHeader.level")}</th>
              <th className="px-3 py-2 text-left font-semibold">{t("scoring.tableHeader.pointsPerQ")}</th>
              <th className="px-3 py-2 text-left font-semibold">{t("scoring.tableHeader.subtotal")}</th>
              <th className="px-3 py-2 text-left font-semibold">{t("scoring.tableHeader.percent")}</th>
            </tr>
          </thead>
          <tbody>
            {scoringRows.map((row, i) => (
              <tr key={i} className="border-b">
                <td className="px-3 py-2 font-medium">{row.range}</td>
                <td className="px-3 py-2">{row.level}</td>
                <td className="px-3 py-2">{row.pointsPerQ}</td>
                <td className="px-3 py-2">{row.subtotal}</td>
                <td className="px-3 py-2">{row.percent}</td>
              </tr>
            ))}
            <tr className="border-b bg-muted/30 font-semibold">
              <td className="px-3 py-2" colSpan={3}>{t("scoring.totalLabel")}</td>
              <td className="px-3 py-2" colSpan={2}>{t("scoring.totalValue")}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm italic text-muted-foreground">{t("scoring.insight")}</p>

      {/* Levels deep-dive */}
      <h2>{t("levels.title")}</h2>
      {(["a1a2", "a2b1", "b1b2", "b2c1"] as const).map((key) => (
        <section key={key}>
          <h3>{t(`levels.${key}.title`)}</h3>
          <p>{t(`levels.${key}.desc`)}</p>
          <p><strong>{t(`levels.${key}.scenarios`)}</strong></p>
          <p>{t(`levels.${key}.sample`)}</p>
          <p><em>{t(`levels.${key}.errors`)}</em></p>
        </section>
      ))}

      {/* 60-minute strategy */}
      <h2>{t("strategy.title")}</h2>
      <p>{t("strategy.intro")}</p>
      {(["phase1", "phase2", "phase3", "phase4"] as const).map((key) => (
        <section key={key}>
          <h3>{t(`strategy.${key}.title`)}</h3>
          <p>{t(`strategy.${key}.action`)}</p>
          <p><em>{t(`strategy.${key}.tip`)}</em></p>
        </section>
      ))}

      {/* 10 common traps */}
      <h2>{t("traps.title")}</h2>
      <p>{t("traps.intro")}</p>
      <ol>
        {trapItems.map((trap, i) => (
          <li key={i}>
            <strong>{trap.title}</strong> — {trap.desc}
          </li>
        ))}
      </ol>

      {/* Key expressions glossary */}
      <h2>{t("keyExpressions.title")}</h2>
      <p>{t("keyExpressions.intro")}</p>
      {(["time", "numbers", "negation", "tone"] as const).map((key) => (
        <section key={key}>
          <h3>{t(`keyExpressions.${key}.name`)}</h3>
          <p>{t(`keyExpressions.${key}.items`)}</p>
        </section>
      ))}

      {/* 8-week preparation plan */}
      <h2>{t("preparationPlan.title")}</h2>
      <p>{t("preparationPlan.intro")}</p>
      {(["week1_2", "week3_4", "week5_6", "week7_8"] as const).map((key) => (
        <section key={key}>
          <h3>{t(`preparationPlan.${key}.title`)}</h3>
          <p>{t(`preparationPlan.${key}.actions`)}</p>
        </section>
      ))}

      {/* 10 practical tips */}
      <h2>{t("tips.title")}</h2>
      <ul>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <li key={n}>{t(`tips.tip${n}`)}</li>
        ))}
      </ul>

      {/* How to practice on HiTCF */}
      <h2>{t("practice.title")}</h2>
      <p>{t("practice.p1")}</p>
      <p>{t("practice.p2")}</p>
      <p>{t("practice.p3")}</p>

      {/* FAQ */}
      <h2>{t("faq.title")}</h2>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <section key={n}>
          <h3>{t(`faq.q${n}.q`)}</h3>
          <p>{t(`faq.q${n}.a`)}</p>
        </section>
      ))}

      {/* CTA */}
      <h2>{t("cta.title")}</h2>
      <p>{t("cta.desc")}</p>
      <p className="text-sm text-muted-foreground">{t("cta.dataPoint")}</p>
      <div className="not-prose flex flex-wrap gap-4">
        <Link
          href="/tests?type=reading"
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
