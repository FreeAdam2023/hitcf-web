import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

const SITE_URL = "https://hitcf.com";
const LAST_UPDATED = "2026-04-05";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "TCF Canada Score Chart: CEFR, CLB and NCLC Conversion (2026)";
  const description =
    "Complete TCF Canada score conversion: raw scores to CEFR levels (A1–C2) and to CLB / NCLC for Canadian PR, Express Entry, QSW, and PEQ. Official IRCC table, last updated " +
    LAST_UPDATED +
    ".";
  return {
    title,
    description,
    keywords: [
      "TCF Canada score chart",
      "TCF Canada CLB conversion",
      "TCF NCLC equivalence",
      "TCF Canada CEFR A1 A2 B1 B2 C1 C2",
      "Express Entry French score",
      "TCF Canada CLB 7",
      "TCF Canada points",
      "IRCC TCF conversion table",
    ],
    alternates: {
      canonical: `/${locale}/guide/tcf-score-chart`,
      languages: {
        zh: "/zh/guide/tcf-score-chart",
        en: "/en/guide/tcf-score-chart",
        fr: "/fr/guide/tcf-score-chart",
        ar: "/ar/guide/tcf-score-chart",
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/${locale}/guide/tcf-score-chart`,
    },
  };
}

export default async function TcfScoreChartGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const pageUrl = `${SITE_URL}/${locale}/guide/tcf-score-chart`;

  // JSON-LD: LearningResource + Article + FAQPage, all in one @graph
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LearningResource", "Article"],
        "@id": `${pageUrl}#article`,
        headline: "TCF Canada Score Chart: CEFR, CLB and NCLC Conversion",
        description:
          "Complete conversion between TCF Canada raw scores, CEFR levels (A1–C2), and CLB/NCLC for Canadian permanent residence and citizenship applications.",
        url: pageUrl,
        datePublished: LAST_UPDATED,
        dateModified: LAST_UPDATED,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: "en",
        learningResourceType: "reference",
        educationalLevel: "A1-C2 CEFR",
        teaches: [
          "TCF Canada score interpretation",
          "CEFR to CLB conversion",
          "IRCC French language requirements",
        ],
        about: {
          "@type": "Thing",
          name: "TCF Canada (Test de connaissance du français pour le Canada)",
        },
        isAccessibleForFree: true,
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What TCF Canada score do I need for CLB 7?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CLB 7 requires: Compréhension Écrite 453–498 points, Compréhension Orale 458–502 points, Expression Écrite 10–11 points, and Expression Orale 10–11 points. CLB 7 is the minimum French proficiency required for most Express Entry federal skilled worker programs.",
            },
          },
          {
            "@type": "Question",
            name: "Is NCLC the same as CLB?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. NCLC (Niveaux de compétence linguistique canadiens) is the French-language equivalent of CLB (Canadian Language Benchmarks). Both use the same 1–12 scale. NCLC 7 = CLB 7.",
            },
          },
          {
            "@type": "Question",
            name: "How is TCF Canada scored?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "TCF Canada has 4 mandatory sections. Compréhension Orale (CO, listening) and Compréhension Écrite (CE, reading) are each scored from 100 to 699 points. Expression Écrite (EE, writing) and Expression Orale (EO, speaking) are each scored from 0 to 20 points. There is no overall total — each skill is reported independently and mapped to a CEFR level.",
            },
          },
          {
            "@type": "Question",
            name: "What is the highest TCF Canada score?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The highest score on Compréhension Orale and Compréhension Écrite is 699 points, corresponding to CEFR C2. The highest score on Expression Écrite and Expression Orale is 20 points, also corresponding to C2.",
            },
          },
          {
            "@type": "Question",
            name: "Can I take TCF Canada in Canada?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. TCF Canada is administered at accredited centres in Canada, including the Alliance Française in Ottawa, Calgary, and Vancouver, among other cities. Seat availability is limited — HiTCF provides a real-time seat monitor for Ottawa, Calgary, and Vancouver.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>TCF Canada Score Chart: CEFR, CLB and NCLC Conversion</h1>

      <p className="lead">
        The <strong>TCF Canada</strong> (
        <em>Test de connaissance du français pour le Canada</em>) is the
        French proficiency exam recognized by{" "}
        <a
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof/test-results-meet-level.html"
          target="_blank"
          rel="noopener"
        >
          Immigration, Refugees and Citizenship Canada (IRCC)
        </a>{" "}
        for permanent residence and citizenship applications. It is
        administered by{" "}
        <a
          href="https://www.france-education-international.fr/test/tcf-canada"
          target="_blank"
          rel="noopener"
        >
          France Éducation International (FEI)
        </a>
        . This page shows the complete score conversion between TCF Canada
        raw scores, CEFR levels (A1 through C2), and the Canadian Language
        Benchmarks (CLB) / Niveaux de compétence linguistique canadiens
        (NCLC) 1–12 scale.
      </p>

      <p>
        Last updated: <strong>{LAST_UPDATED}</strong>. Source tables below
        are published by IRCC and FEI. HiTCF is an independent third-party
        practice platform and is not affiliated with IRCC or FEI.
      </p>

      <h2>How TCF Canada is scored</h2>

      <p>
        TCF Canada has <strong>four mandatory sections</strong>, each scored
        independently:
      </p>

      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Format</th>
            <th>Questions</th>
            <th>Duration</th>
            <th>Score range</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Compréhension Orale (CO)</strong> — Listening
            </td>
            <td>Multiple choice</td>
            <td>39</td>
            <td>35 min</td>
            <td>100–699 points</td>
          </tr>
          <tr>
            <td>
              <strong>Compréhension Écrite (CE)</strong> — Reading
            </td>
            <td>Multiple choice</td>
            <td>39</td>
            <td>60 min</td>
            <td>100–699 points</td>
          </tr>
          <tr>
            <td>
              <strong>Expression Écrite (EE)</strong> — Writing
            </td>
            <td>3 tasks</td>
            <td>—</td>
            <td>60 min</td>
            <td>0–20 points</td>
          </tr>
          <tr>
            <td>
              <strong>Expression Orale (EO)</strong> — Speaking
            </td>
            <td>3 tasks</td>
            <td>—</td>
            <td>12 min</td>
            <td>0–20 points</td>
          </tr>
        </tbody>
      </table>

      <p>
        There is <strong>no overall total</strong>. Each skill is reported
        separately and mapped to its own CEFR level. To qualify for a given
        CLB level (for Express Entry or PEQ), you must reach the minimum
        score in <em>every</em> skill.
      </p>

      <h2>TCF Canada score → CEFR level</h2>

      <p>
        The raw CO/CE score maps to CEFR as follows (published by FEI). The
        EE/EO mapping uses the 0–20 scale directly.
      </p>

      <table>
        <thead>
          <tr>
            <th>CEFR level</th>
            <th>CO / CE (points)</th>
            <th>EE / EO (points)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>C2</strong> — Mastery
            </td>
            <td>600–699</td>
            <td>18–20</td>
          </tr>
          <tr>
            <td>
              <strong>C1</strong> — Advanced
            </td>
            <td>500–599</td>
            <td>14–17</td>
          </tr>
          <tr>
            <td>
              <strong>B2</strong> — Upper intermediate
            </td>
            <td>400–499</td>
            <td>10–13</td>
          </tr>
          <tr>
            <td>
              <strong>B1</strong> — Intermediate
            </td>
            <td>300–399</td>
            <td>6–9</td>
          </tr>
          <tr>
            <td>
              <strong>A2</strong> — Elementary
            </td>
            <td>200–299</td>
            <td>4–5</td>
          </tr>
          <tr>
            <td>
              <strong>A1</strong> — Beginner
            </td>
            <td>100–199</td>
            <td>1–3</td>
          </tr>
        </tbody>
      </table>

      <h2>TCF Canada score → CLB / NCLC (official IRCC table)</h2>

      <p>
        This is the table IRCC uses for Express Entry and all federal
        immigration programs. See the{" "}
        <a
          href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/refugee-protection/removals/pre-removal-risk-assessment/language-testing.html"
          target="_blank"
          rel="noopener"
        >
          official IRCC language testing reference
        </a>{" "}
        for the authoritative current version.
      </p>

      <table>
        <thead>
          <tr>
            <th>CLB / NCLC</th>
            <th>CE (Reading)</th>
            <th>CO (Listening)</th>
            <th>EE (Writing)</th>
            <th>EO (Speaking)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>CLB 10</strong>
            </td>
            <td>549+</td>
            <td>549+</td>
            <td>16+</td>
            <td>16+</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 9</strong>
            </td>
            <td>524–548</td>
            <td>523–548</td>
            <td>14–15</td>
            <td>14–15</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 8</strong>
            </td>
            <td>499–523</td>
            <td>503–522</td>
            <td>12–13</td>
            <td>12–13</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 7</strong>
            </td>
            <td>453–498</td>
            <td>458–502</td>
            <td>10–11</td>
            <td>10–11</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 6</strong>
            </td>
            <td>406–452</td>
            <td>398–457</td>
            <td>7–9</td>
            <td>7–9</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 5</strong>
            </td>
            <td>375–405</td>
            <td>369–397</td>
            <td>6</td>
            <td>6</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 4</strong>
            </td>
            <td>342–374</td>
            <td>331–368</td>
            <td>4–5</td>
            <td>4–5</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Note:</strong> CLB (Canadian Language Benchmarks) and NCLC
        (Niveaux de compétence linguistique canadiens) are the same scale
        applied to English and French respectively. NCLC 7 = CLB 7. Every
        CLB threshold above applies to TCF Canada regardless of the term
        used.
      </p>

      <h2>What score do you need for Canadian PR?</h2>

      <h3>Express Entry — Federal Skilled Worker (FSW)</h3>

      <p>
        You need a minimum of <strong>CLB 7 in all four skills</strong> in
        either English or French to be eligible for the Federal Skilled
        Worker Program. Claiming French as your <em>first</em> official
        language and English as your second unlocks up to{" "}
        <strong>50 extra CRS points</strong> for bilingual ability — a major
        advantage for candidates with a French background.
      </p>

      <h3>Quebec Skilled Worker (QSW) / PEQ</h3>

      <p>
        Quebec programs require a minimum of <strong>NCLC 7 in oral skills</strong>{" "}
        (CO + EO). For some streams, NCLC 5 in written skills (CE + EE) is
        sufficient. The Programme de l'expérience québécoise (PEQ) also
        accepts NCLC 7 in oral comprehension and production.
      </p>

      <h3>Canadian citizenship</h3>

      <p>
        Citizenship requires <strong>CLB 4 in speaking and listening</strong>{" "}
        (EO and CO). Writing and reading are not tested for citizenship
        applications, but demonstrated proficiency through education or
        employment is considered.
      </p>

      <h2>How HiTCF helps you hit these benchmarks</h2>

      <p>
        HiTCF offers <strong>1,306 test sets</strong> and{" "}
        <strong>8,397 questions</strong> covering every CEFR level from A1
        through C2:
      </p>

      <ul>
        <li>
          <strong>42 listening test sets</strong> (1,638 CO questions) with
          sentence-level audio timestamps generated by OpenAI Whisper — every
          sentence can be replayed independently.
        </li>
        <li>
          <strong>42 reading test sets</strong> (1,638 CE questions) with
          click-to-lookup vocabulary and full explanations for every answer.
        </li>
        <li>
          <strong>702 speaking topic sets</strong> (3,536 EO tasks across
          Tâche 1, 2, and 3) with AI evaluation powered by Azure Speech
          pronunciation scoring and Grok language modelling, graded on the
          6-dimension TCF rubric.
        </li>
        <li>
          <strong>520 writing task sets</strong> (1,540 EE tasks) with AI
          feedback on the official 4-criteria TCF grading rubric.
        </li>
      </ul>

      <p>
        Every practice question shows an estimated CEFR level and the
        corresponding CLB/NCLC band, so you can track exactly where you
        stand against the benchmarks above. New users receive a 7-day Pro
        trial on registration — no credit card required.
      </p>

      <p>
        <Link
          href="/tests"
          className="inline-block rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground no-underline"
        >
          Start practising now →
        </Link>
      </p>

      <h2>Frequently asked questions</h2>

      <h3>What TCF Canada score do I need for CLB 7?</h3>
      <p>
        CLB 7 requires: <strong>Compréhension Écrite 453–498 points</strong>,{" "}
        <strong>Compréhension Orale 458–502 points</strong>,{" "}
        <strong>Expression Écrite 10–11 points</strong>, and{" "}
        <strong>Expression Orale 10–11 points</strong>. CLB 7 is the minimum
        French proficiency required for most Express Entry federal skilled
        worker programs and for full bilingual points on CRS.
      </p>

      <h3>Is NCLC the same as CLB?</h3>
      <p>
        Yes. NCLC is the French-language equivalent of CLB, using the same
        1–12 scale. NCLC 7 = CLB 7. IRCC reports both terms interchangeably
        depending on whether the test was in French (NCLC) or English
        (CLB).
      </p>

      <h3>How is TCF Canada different from TCF?</h3>
      <p>
        TCF Canada is a special version of the Test de Connaissance du
        Français designed specifically for the Canadian immigration and
        citizenship context. All four skills (CO, CE, EE, EO) are
        mandatory, scored with the Canadian scale, and recognized by IRCC.
        The regular TCF tests vary by version and are used for other
        purposes (academic admission, visa applications, etc.).
      </p>

      <h3>How long are TCF Canada scores valid?</h3>
      <p>
        TCF Canada scores are valid for <strong>two years</strong> from the
        date of the exam. After two years, you must retake the test to
        submit a new Express Entry profile or other IRCC application.
      </p>

      <h3>Where can I take TCF Canada in Canada?</h3>
      <p>
        TCF Canada is offered at accredited Alliance Française centres in
        Ottawa, Calgary, Vancouver, Toronto, Montreal, and several other
        Canadian cities. Seats are limited and fill quickly — HiTCF provides
        a{" "}
        <Link href="/seat-monitor">real-time seat monitor</Link> for Ottawa,
        Calgary, and Vancouver that refreshes every 15 seconds.
      </p>

      <hr />

      <p className="text-sm text-muted-foreground">
        Sources:{" "}
        <a
          href="https://www.france-education-international.fr/test/tcf-canada"
          target="_blank"
          rel="noopener"
        >
          France Éducation International — TCF Canada
        </a>
        ,{" "}
        <a
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof/test-results-meet-level.html"
          target="_blank"
          rel="noopener"
        >
          IRCC — Test results and CLB levels
        </a>
        . This page is maintained by HiTCF, an independent TCF Canada
        practice platform. We are not affiliated with IRCC or FEI. Please
        verify with the official sources for the most up-to-date
        thresholds before submitting your application.
      </p>
    </>
  );
}
