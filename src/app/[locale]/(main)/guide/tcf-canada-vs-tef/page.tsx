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
  const title = "TCF Canada vs TEF Canada: Which Exam Should You Take? (2026)";
  const description =
    "Side-by-side comparison of TCF Canada and TEF Canada for Canadian PR, Express Entry, and QSW. Covers scoring, format, cost, availability, and how each maps to CLB/NCLC levels. Last updated " +
    LAST_UPDATED +
    ".";
  return {
    title,
    description,
    keywords: [
      "TCF Canada vs TEF Canada",
      "TCF or TEF for PR",
      "TEF Canada CLB conversion",
      "TCF Canada CLB conversion",
      "best French test for Express Entry",
      "TCF vs TEF differences",
      "which French exam for Canadian immigration",
      "TCF Canada TEF Canada comparison",
    ],
    alternates: {
      canonical: `/${locale}/guide/tcf-canada-vs-tef`,
      languages: {
        zh: "/zh/guide/tcf-canada-vs-tef",
        en: "/en/guide/tcf-canada-vs-tef",
        fr: "/fr/guide/tcf-canada-vs-tef",
        ar: "/ar/guide/tcf-canada-vs-tef",
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/${locale}/guide/tcf-canada-vs-tef`,
    },
  };
}

export default async function TcfVsTefGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const pageUrl = `${SITE_URL}/${locale}/guide/tcf-canada-vs-tef`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LearningResource", "Article"],
        "@id": `${pageUrl}#article`,
        headline: "TCF Canada vs TEF Canada: Which Exam Should You Take?",
        description:
          "Side-by-side comparison of the TCF Canada and TEF Canada French proficiency exams, both recognized by IRCC for Canadian permanent residence and citizenship applications.",
        url: pageUrl,
        datePublished: LAST_UPDATED,
        dateModified: LAST_UPDATED,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: "en",
        learningResourceType: "comparison guide",
        educationalLevel: "A1-C2 CEFR",
        about: [
          {
            "@type": "Thing",
            name: "TCF Canada",
            description:
              "Test de connaissance du français pour le Canada, administered by France Éducation International (FEI).",
          },
          {
            "@type": "Thing",
            name: "TEF Canada",
            description:
              "Test d'évaluation de français pour le Canada, administered by CCI Paris Île-de-France.",
          },
        ],
        isAccessibleForFree: true,
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Does IRCC accept both TCF Canada and TEF Canada?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. IRCC (Immigration, Refugees and Citizenship Canada) accepts both TCF Canada and TEF Canada as equivalent proof of French proficiency for all federal immigration and citizenship programs. Both map to the same CLB/NCLC 1–12 scale. Candidates can choose either one.",
            },
          },
          {
            "@type": "Question",
            name: "Is TCF Canada easier than TEF Canada?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Neither exam is objectively easier — both test the same CEFR proficiency levels. However, candidates often report that TCF Canada's multiple-choice format feels more approachable, while TEF Canada's question styles can be more varied. The right choice depends on your learning style and which format you have had more practice with.",
            },
          },
          {
            "@type": "Question",
            name: "How much do TCF Canada and TEF Canada cost?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Both exams typically cost between CAD 350 and CAD 450 in Canada, depending on the test centre and city. Exact fees vary — check with your local Alliance Française or authorized centre for current pricing.",
            },
          },
          {
            "@type": "Question",
            name: "Can I take both TCF Canada and TEF Canada?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. There is no IRCC rule against taking both exams. Some candidates take both to maximize their chances of hitting the CLB level they need. IRCC will use whichever valid result you submit with your application.",
            },
          },
          {
            "@type": "Question",
            name: "Which French exam should I take for Express Entry?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Either TCF Canada or TEF Canada works equally well for Express Entry. IRCC uses the same CLB/NCLC conversion table for both. Choose based on availability in your city, fee, and which format you have prepared for. Both unlock up to 50 extra CRS points for strong French as a second language.",
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

      <h1>TCF Canada vs TEF Canada: Which Exam Should You Take?</h1>

      <p className="lead">
        Both <strong>TCF Canada</strong> and <strong>TEF Canada</strong> are
        recognized by{" "}
        <a
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof/test-results-meet-level.html"
          target="_blank"
          rel="noopener"
        >
          Immigration, Refugees and Citizenship Canada (IRCC)
        </a>{" "}
        as proof of French proficiency for permanent residence, Express
        Entry, and citizenship applications. They are administered by
        different organizations, use different scoring scales, and are
        offered at different centres — but IRCC maps both to the same
        CLB/NCLC 1–12 benchmarks. This guide compares them side-by-side so
        you can decide which one fits your situation.
      </p>

      <p>
        Last updated: <strong>{LAST_UPDATED}</strong>. All scoring
        thresholds below are from the current IRCC conversion tables.
        Always verify with{" "}
        <a
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof.html"
          target="_blank"
          rel="noopener"
        >
          canada.ca
        </a>{" "}
        before booking your test or submitting an application.
      </p>

      <h2>Quick comparison at a glance</h2>

      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>TCF Canada</th>
            <th>TEF Canada</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Full name</strong>
            </td>
            <td>
              <em>Test de connaissance du français pour le Canada</em>
            </td>
            <td>
              <em>Test d&apos;évaluation de français pour le Canada</em>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Administered by</strong>
            </td>
            <td>
              <a
                href="https://www.france-education-international.fr/test/tcf-canada"
                target="_blank"
                rel="noopener"
              >
                France Éducation International (FEI)
              </a>
            </td>
            <td>
              <a
                href="https://www.lefrancaisdesaffaires.fr/tests-diplomes/tef-test-evaluation-de-francais/tef-canada/"
                target="_blank"
                rel="noopener"
              >
                CCI Paris Île-de-France
              </a>
            </td>
          </tr>
          <tr>
            <td>
              <strong>IRCC recognition</strong>
            </td>
            <td>Yes — all programs</td>
            <td>Yes — all programs</td>
          </tr>
          <tr>
            <td>
              <strong>Sections</strong>
            </td>
            <td>CO, CE, EE, EO (all mandatory)</td>
            <td>CO, CE, EE, EO (all mandatory)</td>
          </tr>
          <tr>
            <td>
              <strong>Format style</strong>
            </td>
            <td>Mostly multiple choice (CO, CE)</td>
            <td>Multiple choice + varied task types</td>
          </tr>
          <tr>
            <td>
              <strong>CO scoring</strong>
            </td>
            <td>100–699 points</td>
            <td>0–360 points</td>
          </tr>
          <tr>
            <td>
              <strong>CE scoring</strong>
            </td>
            <td>100–699 points</td>
            <td>0–300 points</td>
          </tr>
          <tr>
            <td>
              <strong>EE scoring</strong>
            </td>
            <td>0–20 points</td>
            <td>0–450 points</td>
          </tr>
          <tr>
            <td>
              <strong>EO scoring</strong>
            </td>
            <td>0–20 points</td>
            <td>0–450 points</td>
          </tr>
          <tr>
            <td>
              <strong>Total test duration</strong>
            </td>
            <td>~2h 47min</td>
            <td>~3h 10min</td>
          </tr>
          <tr>
            <td>
              <strong>Result validity</strong>
            </td>
            <td>2 years</td>
            <td>2 years</td>
          </tr>
          <tr>
            <td>
              <strong>Typical cost in Canada</strong>
            </td>
            <td>CAD 350–450</td>
            <td>CAD 350–450</td>
          </tr>
          <tr>
            <td>
              <strong>Typical centre types</strong>
            </td>
            <td>Alliance Française, authorized AEC centres</td>
            <td>Alliance Française, authorized CCIP centres</td>
          </tr>
          <tr>
            <td>
              <strong>Result turnaround</strong>
            </td>
            <td>4–6 weeks</td>
            <td>4–6 weeks</td>
          </tr>
        </tbody>
      </table>

      <h2>Scoring: TCF Canada → CLB / NCLC</h2>

      <p>
        TCF Canada uses a 100–699 scale for listening (CO) and reading (CE),
        and a 0–20 scale for writing (EE) and speaking (EO). The official
        IRCC conversion to CLB/NCLC is:
      </p>

      <table>
        <thead>
          <tr>
            <th>CLB / NCLC</th>
            <th>CE</th>
            <th>CO</th>
            <th>EE</th>
            <th>EO</th>
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
        For the full TCF Canada score reference, see our{" "}
        <Link href="/guide/tcf-score-chart">
          TCF Canada Score Chart guide
        </Link>
        .
      </p>

      <h2>Scoring: TEF Canada → CLB / NCLC</h2>

      <p>
        TEF Canada uses completely different numerical scales. Listening
        (CO) is scored out of 360, reading (CE) out of 300, and writing
        (EE) and speaking (EO) each out of 450. The official IRCC
        conversion to CLB/NCLC is:
      </p>

      <table>
        <thead>
          <tr>
            <th>CLB / NCLC</th>
            <th>CE (/300)</th>
            <th>CO (/360)</th>
            <th>EE (/450)</th>
            <th>EO (/450)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>CLB 10</strong>
            </td>
            <td>263+</td>
            <td>316+</td>
            <td>393+</td>
            <td>393+</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 9</strong>
            </td>
            <td>248–262</td>
            <td>298–315</td>
            <td>371–392</td>
            <td>371–392</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 8</strong>
            </td>
            <td>233–247</td>
            <td>280–297</td>
            <td>349–370</td>
            <td>349–370</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 7</strong>
            </td>
            <td>207–232</td>
            <td>249–279</td>
            <td>310–348</td>
            <td>310–348</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 6</strong>
            </td>
            <td>181–206</td>
            <td>217–248</td>
            <td>271–309</td>
            <td>271–309</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 5</strong>
            </td>
            <td>151–180</td>
            <td>181–216</td>
            <td>225–270</td>
            <td>225–270</td>
          </tr>
          <tr>
            <td>
              <strong>CLB 4</strong>
            </td>
            <td>121–150</td>
            <td>145–180</td>
            <td>181–224</td>
            <td>181–224</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Important:</strong> To claim a CLB level for Express Entry
        or any IRCC program, you must meet the minimum in <em>all four</em>{" "}
        sections. Your reported CLB is the lowest skill result.
      </p>

      <h2>Format and content differences</h2>

      <h3>TCF Canada</h3>

      <ul>
        <li>
          <strong>Compréhension Orale (CO)</strong> — 39 multiple-choice
          questions, 35 minutes. Short audio clips (conversations,
          announcements, news, interviews) with four answer options.
        </li>
        <li>
          <strong>Compréhension Écrite (CE)</strong> — 39 multiple-choice
          questions, 60 minutes. Texts of varying length, from SMS-style
          messages (A1) to full articles (C2).
        </li>
        <li>
          <strong>Expression Écrite (EE)</strong> — 3 tasks, 60 minutes.
          Short message, article, and formal letter or argument piece.
        </li>
        <li>
          <strong>Expression Orale (EO)</strong> — 3 tasks, 12 minutes.
          Personal interview, information gathering, and opinion
          expression.
        </li>
      </ul>

      <h3>TEF Canada</h3>

      <ul>
        <li>
          <strong>Compréhension Orale (CO)</strong> — 60 questions, 40
          minutes. More varied task types including true/false and
          matching.
        </li>
        <li>
          <strong>Compréhension Écrite (CE)</strong> — 50 questions, 60
          minutes. Multiple-choice plus some fill-in-the-blank.
        </li>
        <li>
          <strong>Expression Écrite (EE)</strong> — 2 tasks, 60 minutes.
          News article rewrite and argumentative essay.
        </li>
        <li>
          <strong>Expression Orale (EO)</strong> — 2 tasks, 15 minutes.
          Information gathering role-play and opinion persuasion.
        </li>
      </ul>

      <h2>Which exam should you choose?</h2>

      <p>
        For most candidates, the answer is: <strong>pick whichever you can schedule soonest at a nearby centre</strong>. Both are equally valid for IRCC. The practical deciding factors are usually:
      </p>

      <ol>
        <li>
          <strong>Seat availability in your city.</strong> TCF Canada seats
          are extremely scarce in Ottawa, Calgary, and Vancouver — often
          booked 2–3 months in advance. HiTCF provides a{" "}
          <Link href="/seat-monitor">real-time TCF Canada seat monitor</Link>{" "}
          for these three cities. If TCF is sold out, TEF may have a slot
          sooner.
        </li>
        <li>
          <strong>Which format you have prepared for.</strong> Switching
          formats two weeks before the exam is a bad idea. If you have
          been doing TCF-style practice tests, stick with TCF.
        </li>
        <li>
          <strong>Exam centre proximity.</strong> Some Canadian cities
          offer only one of the two. Travelling 4+ hours to a different
          city adds cost and stress — often more than the minor format
          difference is worth.
        </li>
      </ol>

      <p>
        Candidates sometimes ask whether <em>taking both</em> makes sense.
        It can — if you have the budget and time, a second attempt in a
        different format is a legitimate way to hedge against one bad day.
        IRCC will accept whichever valid result you submit.
      </p>

      <h2>How HiTCF helps (and what it does not cover)</h2>

      <p>
        HiTCF is built <strong>exclusively for TCF Canada preparation</strong>.
        It provides 1,306 test sets and 8,397 questions aligned to the
        official TCF Canada format: 42 listening sets with
        sentence-level audio timestamps, 42 reading sets with click-to-look-up
        vocabulary, 702 speaking topic sets with AI evaluation via Azure
        Speech and Grok, and 520 writing task sets with AI feedback on the
        4-criteria TCF rubric.
      </p>

      <p>
        <strong>HiTCF does not cover TEF Canada.</strong> The two exams
        differ enough in format (question styles, task counts, scoring
        scales) that TCF practice is not a substitute for TEF-specific
        preparation. If you are committed to TEF Canada, you will need a
        TEF-specific resource. HiTCF is the right choice if you have
        decided on TCF Canada and want the most complete bank of TCF-style
        practice questions with AI feedback.
      </p>

      <p>
        <Link
          href="/tests"
          className="inline-block rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground no-underline"
        >
          Start practising TCF Canada on HiTCF →
        </Link>
      </p>

      <h2>Frequently asked questions</h2>

      <h3>Does IRCC prefer TCF Canada over TEF Canada?</h3>
      <p>
        No. IRCC treats TCF Canada and TEF Canada as equally valid. Both
        map to the same CLB/NCLC scale, and both unlock the same Express
        Entry CRS points. The choice is purely practical — availability,
        cost, format preference.
      </p>

      <h3>Is TEF Canada the same as TEF?</h3>
      <p>
        No. &quot;TEF&quot; is a family of French proficiency tests
        administered by CCI Paris Île-de-France. TEF Canada is the version
        specifically configured for Canadian immigration (same four skills,
        scored on the Canadian scale, results accepted by IRCC). Other
        versions like TEFAQ (Quebec), TEF Naturalisation (French
        citizenship), and TEF for academic admission exist but are not
        interchangeable for IRCC purposes.
      </p>

      <h3>Which exam is shorter?</h3>
      <p>
        TCF Canada is slightly shorter overall (~2h 47min vs ~3h 10min for
        TEF Canada), but both are full half-day exams. Plan the whole
        morning or afternoon.
      </p>

      <h3>Can I retake either exam?</h3>
      <p>
        Yes. Both exams allow unlimited retakes, though most centres
        require a waiting period (typically 30 days) between attempts.
        There is no limit on how many times you can submit different
        results to IRCC over the validity period.
      </p>

      <h3>Which one gives me more CRS points?</h3>
      <p>
        Neither. Express Entry CRS points are based on CLB level, not on
        which exam you took to get there. CLB 7 in French is CLB 7 in
        French, regardless of whether it came from TCF Canada or TEF
        Canada. Claiming French as your first official language unlocks up
        to 50 extra CRS points for bilingual ability — the same for both
        exams.
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
          href="https://www.lefrancaisdesaffaires.fr/tests-diplomes/tef-test-evaluation-de-francais/tef-canada/"
          target="_blank"
          rel="noopener"
        >
          CCI Paris Île-de-France — TEF Canada
        </a>
        ,{" "}
        <a
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof/test-results-meet-level.html"
          target="_blank"
          rel="noopener"
        >
          IRCC — Test results and CLB levels
        </a>
        . This guide is maintained by HiTCF, an independent TCF Canada
        practice platform. We are not affiliated with IRCC, FEI, or CCIP.
        Verify all thresholds and fees with the official sources before
        booking your exam.
      </p>
    </>
  );
}
