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
  const title = "TCF Canada 30-Day Study Plan: From B1 to CLB 7 (2026)";
  const description =
    "A realistic 30-day study plan to reach CLB 7 (NCLC 7) on TCF Canada. Day-by-day schedule, weekly milestones, skill-specific practice targets, and honest assessment of what 30 days can and cannot deliver. Last updated " +
    LAST_UPDATED +
    ".";
  return {
    title,
    description,
    keywords: [
      "TCF Canada 30 day study plan",
      "TCF Canada preparation schedule",
      "How to prepare TCF Canada in one month",
      "TCF Canada CLB 7 in 30 days",
      "TCF Canada daily practice plan",
      "TCF Canada one month plan",
      "TCF Canada study timeline",
      "TCF Canada preparation from B1 to B2",
    ],
    alternates: {
      canonical: `/${locale}/guide/tcf-canada-study-plan-30-days`,
      languages: {
        zh: "/zh/guide/tcf-canada-study-plan-30-days",
        en: "/en/guide/tcf-canada-study-plan-30-days",
        fr: "/fr/guide/tcf-canada-study-plan-30-days",
        ar: "/ar/guide/tcf-canada-study-plan-30-days",
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/${locale}/guide/tcf-canada-study-plan-30-days`,
    },
  };
}

export default async function TcfStudyPlan30DaysPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const pageUrl = `${SITE_URL}/${locale}/guide/tcf-canada-study-plan-30-days`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LearningResource", "HowTo", "Article"],
        "@id": `${pageUrl}#howto`,
        name: "How to prepare for TCF Canada in 30 days (B1 → CLB 7)",
        description:
          "A 30-day study plan to go from B1 French (CLB 5-6) to B2 French (CLB 7) on TCF Canada, with daily targets, weekly milestones, and skill-specific practice allocation.",
        url: pageUrl,
        datePublished: LAST_UPDATED,
        dateModified: LAST_UPDATED,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: "en",
        learningResourceType: "study plan",
        totalTime: "P30D",
        educationalLevel: "B1 to B2 CEFR (CLB 5-7)",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Week 1: Diagnostic and foundation",
            text: "Take a full 4-skill diagnostic exam to identify your weakest section. Spend the week building baseline vocabulary (300-500 high-frequency words) and reviewing core B1 grammar (past tenses, conditional, subjunctive intro).",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Week 2: Core receptive skills",
            text: "Focus on Compréhension Orale and Compréhension Écrite. Target 3-4 listening sets and 3-4 reading sets per day, with detailed review of every wrong answer. Aim for 70% accuracy on B1 questions by end of week.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Week 3: Productive skills",
            text: "Shift focus to Expression Écrite and Expression Orale. Complete 2 writing tasks per day with AI feedback, and 2 speaking topics per day with pronunciation scoring. Productive skills need daily practice, not weekly bursts.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Week 4: Mock exams and refinement",
            text: "Take 2 full mock exams under real timing conditions (one at the start of the week, one at the end). Review all 4 sections from both exams in detail. Fill remaining gaps with targeted practice.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Is 30 days enough to prepare for TCF Canada?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It depends on your starting level. 30 days is realistic for someone currently at B1 (CLB 5-6) aiming for CLB 7, or someone at B2 aiming for CLB 8-9. It is not realistic to go from A2 to CLB 7 in 30 days. Productive skills (writing and speaking) improve more slowly than receptive skills and need consistent daily practice.",
            },
          },
          {
            "@type": "Question",
            name: "How many hours per day do I need?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Plan for 1.5 to 2.5 hours of focused practice per day over 30 days, for a total of 45-75 hours. Less than 1 hour per day is unlikely to produce measurable improvement. More than 3 hours per day leads to diminishing returns and burnout by week 3.",
            },
          },
          {
            "@type": "Question",
            name: "What if I can only study on weekends?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Weekend-only study (8-10 hours per weekend) for 4 weekends is not equivalent to daily practice. Language retention requires spacing. If you can only study on weekends, extend the timeline to 8-10 weeks and add 15-20 minutes of daily review on weekdays (vocabulary flashcards, short listening).",
            },
          },
          {
            "@type": "Question",
            name: "What is the best order to tackle the four skills?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Start with Compréhension Orale and Compréhension Écrite — these respond fastest to practice and give you confidence. Add Expression Écrite in week 2-3 with AI-graded drafts. Speaking (Expression Orale) needs daily low-intensity practice throughout all 30 days, not a concentrated block. Never leave speaking until the last week.",
            },
          },
          {
            "@type": "Question",
            name: "Should I take practice exams in exam mode or practice mode?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Mostly practice mode. Use exam mode only for 2-3 full mock exams during the 30 days (baseline in week 1, midpoint in week 3, final in week 4). Practice mode with instant feedback and explanations is where real learning happens. Exam mode measures progress but does not teach.",
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

      <h1>TCF Canada 30-Day Study Plan: From B1 to CLB 7</h1>

      <p className="lead">
        Thirty days is enough time to move from <strong>B1 French (CLB 5-6)</strong>{" "}
        to <strong>B2 French (CLB 7)</strong> on TCF Canada — but only with
        focused daily practice and a plan that balances the four skills.
        This guide gives you a realistic week-by-week schedule, daily
        targets, and honest expectations. It is not a shortcut. If you
        follow it, you will spend about <strong>60 to 70 hours</strong> of
        focused French practice in the next month.
      </p>

      <p>
        Last updated: <strong>{LAST_UPDATED}</strong>. The plan below
        assumes you are already at B1 level (roughly CLB 5-6), can read a
        simple news article with some dictionary lookups, and can hold a
        basic 5-minute conversation in French. If your current level is
        lower, extend the plan to 60-90 days rather than forcing 30.
      </p>

      <h2>Who this plan is for</h2>

      <ul>
        <li>
          <strong>Target audience:</strong> Candidates preparing for{" "}
          <a
            href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof.html"
            target="_blank"
            rel="noopener"
          >
            Canadian Express Entry
          </a>{" "}
          who need CLB 7 in French (minimum for most Federal Skilled
          Worker profiles).
        </li>
        <li>
          <strong>Starting level:</strong> B1 (TCF Canada CO/CE 300-399
          points, EE/EO 6-9 points). If unsure, take a diagnostic set on{" "}
          <Link href="/tests">HiTCF</Link> to confirm.
        </li>
        <li>
          <strong>Target level:</strong> B2 (CO/CE 400-499 points, EE/EO
          10-13 points), corresponding to CLB 7-8.
        </li>
        <li>
          <strong>Daily commitment:</strong> 1.5 to 2.5 hours per day, 6
          days per week. One rest day is built in — skipping it leads to
          week 3 burnout.
        </li>
      </ul>

      <h2>Honest expectations</h2>

      <p>
        Before committing to this plan, understand what 30 days can and
        cannot do:
      </p>

      <table>
        <thead>
          <tr>
            <th>Realistic in 30 days</th>
            <th>Not realistic in 30 days</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>B1 → B2 (CLB 5-6 → CLB 7)</td>
            <td>A2 → B2 (CLB 3 → CLB 7)</td>
          </tr>
          <tr>
            <td>B2 → C1 in 1-2 sections, B2 in the others</td>
            <td>B2 → C1 (CLB 9) in all 4 sections</td>
          </tr>
          <tr>
            <td>
              Reading and listening scores improve 50-100 points
            </td>
            <td>
              Writing and speaking jumping 2 CEFR bands
            </td>
          </tr>
          <tr>
            <td>Familiarity with the exam format and pacing</td>
            <td>Replacing 2+ years of cumulative language exposure</td>
          </tr>
          <tr>
            <td>Hitting CLB 7 if you are borderline B1-B2</td>
            <td>Hitting CLB 9+ from a cold start</td>
          </tr>
        </tbody>
      </table>

      <p>
        If your starting level is below B1, the most effective thing you
        can do in 30 days is delay the exam and keep studying for another
        30-60 days. Expensive retakes are more painful than postponement.
      </p>

      <h2>Weekly structure</h2>

      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th>Focus</th>
            <th>Daily time</th>
            <th>Main output</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Week 1</strong>
            </td>
            <td>Diagnostic + vocabulary + grammar foundation</td>
            <td>~1.5h</td>
            <td>Know your weakest skill. 300 new words reviewed.</td>
          </tr>
          <tr>
            <td>
              <strong>Week 2</strong>
            </td>
            <td>Compréhension Orale + Compréhension Écrite heavy</td>
            <td>~2h</td>
            <td>CO/CE accuracy rising from ~50% to ~70% on B1.</td>
          </tr>
          <tr>
            <td>
              <strong>Week 3</strong>
            </td>
            <td>Expression Écrite + Expression Orale heavy</td>
            <td>~2.5h</td>
            <td>
              1 graded writing per day. 2 speaking topics per day.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Week 4</strong>
            </td>
            <td>Mock exams + targeted review + rest before exam</td>
            <td>~2h</td>
            <td>2 full timed mock exams. Final gap closure.</td>
          </tr>
        </tbody>
      </table>

      <h2>Week 1: Diagnostic and foundation</h2>

      <p>
        <strong>Goal:</strong> Establish a baseline and build vocabulary
        + core grammar.
      </p>

      <h3>Day 1 — Full diagnostic</h3>
      <p>
        Take a complete 4-skill exam on HiTCF in{" "}
        <strong>exam mode</strong> to get your baseline. Do not study
        before this — you want an honest snapshot. Results will show you
        which section is your weakest. This matters: week 2-3 schedules
        shift based on your weakest skill.
      </p>

      <h3>Day 2-3 — Vocabulary sprint</h3>
      <p>
        Load 300-500 high-frequency B1-B2 French words into HiTCF&apos;s
        vocabulary flashcard system. Review 60-100 per day. Focus on:
      </p>
      <ul>
        <li>Connectors (cependant, néanmoins, en revanche, puisque)</li>
        <li>Opinion verbs (estimer, considérer, prétendre, soutenir)</li>
        <li>Abstract nouns for essays (conséquence, enjeu, démarche)</li>
        <li>Common idioms for speaking (en effet, à vrai dire, tout de même)</li>
      </ul>

      <h3>Day 4-6 — Grammar review</h3>
      <p>
        Review these high-impact grammar points (30 min each day):
      </p>
      <ul>
        <li>
          <strong>Subjunctive</strong> (il faut que, bien que, avant que,
          jusqu&apos;à ce que)
        </li>
        <li>
          <strong>Conditional</strong> (si + imparfait → conditionnel présent)
        </li>
        <li>
          <strong>Passive voice</strong> and formal alternatives (on + active,
          reflexive passive)
        </li>
        <li>
          <strong>Pronouns</strong> (y, en, double pronouns: le lui, la leur)
        </li>
        <li>
          <strong>Past tenses distinction</strong> (imparfait vs passé composé
          vs plus-que-parfait)
        </li>
      </ul>

      <h3>Day 7 — Rest</h3>
      <p>
        Do not study. Take a full day off. Watch a French film without
        subtitles if you want passive exposure, but no active study.
        Rest is not a luxury — it is when consolidation happens.
      </p>

      <h2>Week 2: Compréhension Orale + Compréhension Écrite</h2>

      <p>
        <strong>Goal:</strong> Raise CO + CE accuracy from ~50% to ~70%
        on B1 questions. These two sections respond fastest to practice
        and together account for more than half your overall score.
      </p>

      <p>
        Daily plan (2 hours):
      </p>

      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0:00 - 0:15</td>
            <td>
              Vocabulary flashcard review (20 cards, mix of new and due)
            </td>
          </tr>
          <tr>
            <td>0:15 - 0:50</td>
            <td>
              3-4 listening sets (CO) in practice mode, full review of
              every wrong answer using HiTCF&apos;s sentence-level audio
              replay
            </td>
          </tr>
          <tr>
            <td>0:50 - 1:25</td>
            <td>
              3-4 reading sets (CE) in practice mode, focus on scanning
              for keywords before reading full paragraphs
            </td>
          </tr>
          <tr>
            <td>1:25 - 1:45</td>
            <td>
              Wrong-answer notebook review — look at yesterday&apos;s
              mistakes and confirm you now understand them
            </td>
          </tr>
          <tr>
            <td>1:45 - 2:00</td>
            <td>
              Short speaking warm-up: 5 minutes talking to yourself about
              your day in French. No structure, just fluency.
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        By end of week 2, you should see CO/CE practice accuracy rising
        to ~70% on B1 questions and ~50% on B2. If not, stop adding new
        vocabulary and review the fundamental grammar from week 1.
      </p>

      <h2>Week 3: Expression Écrite + Expression Orale</h2>

      <p>
        <strong>Goal:</strong> Write and speak enough to build confidence
        and fluency. Productive skills improve slowly, but 21 days of
        consistent daily practice moves the needle.
      </p>

      <p>
        Daily plan (2.5 hours):
      </p>

      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0:00 - 0:15</td>
            <td>Vocabulary review (continue the week 1-2 pool)</td>
          </tr>
          <tr>
            <td>0:15 - 0:45</td>
            <td>
              1 listening + 1 reading set to maintain receptive skills
              (not letting them slip)
            </td>
          </tr>
          <tr>
            <td>0:45 - 1:15</td>
            <td>
              <strong>1 full writing task</strong> (alternate Tâche 1, 2,
              3 across the week) with AI feedback. Read the corrections
              carefully — the feedback is more valuable than the original
              draft.
            </td>
          </tr>
          <tr>
            <td>1:15 - 1:45</td>
            <td>
              <strong>2 speaking topics</strong> with pronunciation
              scoring. Record yourself, listen back, re-record the same
              topic if your first attempt was below 60% on any dimension.
            </td>
          </tr>
          <tr>
            <td>1:45 - 2:15</td>
            <td>
              Review of writing AI feedback from previous days — rewrite
              one paragraph that scored poorly
            </td>
          </tr>
          <tr>
            <td>2:15 - 2:30</td>
            <td>Wrong-answer notebook review</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Critical:</strong> Do not skip speaking practice even
        once in week 3. Two days off in speaking loses more progress than
        two days off in any other skill.
      </p>

      <h2>Week 4: Mock exams and refinement</h2>

      <p>
        <strong>Goal:</strong> Validate your level under real test
        conditions and close remaining gaps.
      </p>

      <h3>Day 22 — Full mock exam in exam mode</h3>
      <p>
        Take a complete TCF Canada mock under real timing (35 min CO, 60
        min CE, 60 min EE, 12 min EO). No breaks longer than 5 minutes.
        Do not review until the end. This is a dress rehearsal.
      </p>

      <h3>Day 23-24 — Deep review</h3>
      <p>
        Review every wrong answer from the mock exam. Look for patterns:
        are you losing points on B2 reading because of unknown
        vocabulary, or because of question comprehension? The answer
        determines what to study in the remaining days.
      </p>

      <h3>Day 25-26 — Targeted gap filling</h3>
      <p>
        Spend these two days on your weakest area from the mock exam
        results. Use HiTCF&apos;s filter by level and type to generate
        targeted practice sets.
      </p>

      <h3>Day 27 — Second full mock exam</h3>
      <p>
        Take another complete mock. Your score should be 30-60 points
        higher on CO/CE and 1-2 points higher on EE/EO compared to Day
        22. If not, the plan needs more time — postpone the exam.
      </p>

      <h3>Day 28-29 — Final calibration</h3>
      <p>
        Light review only. No new material. Go back to the wrong-answer
        notebook, confirm all previously difficult questions are now
        solid. Re-do 3-5 writing tasks to maintain muscle memory.
      </p>

      <h3>Day 30 — Rest</h3>
      <p>
        No study. Confirm your exam logistics (see the{" "}
        <Link href="/guide/tcf-canada-exam-day">exam day walkthrough</Link>
        ). Pack your documents. Sleep early. Trust the 29 days of work.
      </p>

      <h2>How HiTCF supports this 30-day plan</h2>

      <p>
        HiTCF was built specifically for this kind of structured
        preparation. The features that matter most for a 30-day sprint:
      </p>

      <ul>
        <li>
          <strong>1,306 test sets / 8,397 questions</strong> across A1-C2
          — you will not run out of fresh material at any point in 30
          days, even at 15-20 sets per day.
        </li>
        <li>
          <strong>Sentence-level audio timestamps</strong> — replay any
          sentence of any listening passage independently. Critical for
          week 2 CO drilling.
        </li>
        <li>
          <strong>AI writing feedback on the 4-criteria TCF rubric</strong>{" "}
          — unlimited graded drafts, no waiting for a tutor. Essential
          for week 3.
        </li>
        <li>
          <strong>AI speaking evaluation via Azure Speech + Grok</strong>{" "}
          — 6-dimension scoring (pronunciation, fluency, grammar,
          vocabulary, task completion, sociolinguistic appropriateness)
          matching the real TCF rubric.
        </li>
        <li>
          <strong>Wrong-answer notebook with spaced repetition</strong> —
          mistakes automatically queue for review until mastered.
        </li>
        <li>
          <strong>Speed drill mode by CEFR level</strong> — generate
          B1-only or B2-only sets on demand for targeted practice.
        </li>
        <li>
          <strong>Exam mode with real timing</strong> — for the 2-3
          full mocks in weeks 1 and 4.
        </li>
        <li>
          <strong>7-day free Pro trial on registration</strong> — covers
          week 1 entirely. Subscribe for weeks 2-4 if the format works
          for you.
        </li>
      </ul>

      <p>
        <Link
          href="/tests"
          className="inline-block rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground no-underline"
        >
          Start the 30-day plan with a Week 1 diagnostic →
        </Link>
      </p>

      <h2>Common mistakes that derail the plan</h2>

      <h3>Mistake 1: Skipping the Week 1 diagnostic</h3>
      <p>
        Candidates often want to jump straight into practice to feel
        productive. The diagnostic takes 3 hours but saves 30+ hours of
        mis-targeted effort. Without it, you do not know whether to
        prioritise listening or writing, and you will discover the gap
        too late.
      </p>

      <h3>Mistake 2: Over-focusing on strong skills</h3>
      <p>
        Your TCF Canada score is the <em>minimum</em> of your four skill
        levels for CLB purposes. If you are CLB 8 in reading but CLB 5 in
        speaking, your reported CLB is 5. Spend time on your weakest
        skill, not your strongest. This is counter-intuitive — strong
        skills feel rewarding to practice, weak skills feel
        uncomfortable.
      </p>

      <h3>Mistake 3: Leaving speaking for week 4</h3>
      <p>
        Speaking is the slowest-improving skill. Candidates who leave it
        until the last week consistently underperform. Better: 15-20
        minutes of speaking every single day from Day 3 onwards.
      </p>

      <h3>Mistake 4: Only doing mock exams, never reviewing</h3>
      <p>
        Taking 15 mock exams without detailed review teaches you
        nothing. Taking 5 mock exams and spending 2 hours reviewing each
        teaches you everything. The exam is the measurement, not the
        learning.
      </p>

      <h3>Mistake 5: Studying more than 3 hours per day</h3>
      <p>
        Past 3 hours, retention drops sharply and exhaustion compounds
        across days. If you truly have more time, split it: 2 hours in
        the morning, 1 hour in the evening. But 4 hours in a single
        block does not produce 4 hours of learning.
      </p>

      <h2>Frequently asked questions</h2>

      <h3>Is 30 days enough to prepare for TCF Canada?</h3>
      <p>
        It depends on your starting level. 30 days is realistic for
        someone currently at B1 (CLB 5-6) aiming for CLB 7, or someone at
        B2 aiming for CLB 8-9. It is not realistic to go from A2 to CLB 7
        in 30 days — you would need at least 60-90 days of focused
        practice for that jump.
      </p>

      <h3>How many hours per day do I need?</h3>
      <p>
        Plan for 1.5 to 2.5 hours of focused practice per day over 30
        days, totalling 45-75 hours. Less than 1 hour per day is unlikely
        to produce measurable improvement. More than 3 hours per day
        leads to diminishing returns and burnout by week 3.
      </p>

      <h3>Can I do this plan while working full-time?</h3>
      <p>
        Yes — 2 hours per day is achievable alongside a 40-hour work
        week, but it requires giving up most of your weekday evenings
        and both weekend days. If that is not possible, extend the plan
        to 60 days at 1 hour per day instead.
      </p>

      <h3>What is the best order to tackle the four skills?</h3>
      <p>
        Start with CO and CE (week 2 heavy) because they respond fastest
        to practice and give confidence. Add EE in week 2-3 with daily
        AI-graded drafts. EO needs daily low-intensity practice
        throughout all 30 days — never leave it until the last week.
      </p>

      <h3>Should I also use textbooks or only HiTCF?</h3>
      <p>
        HiTCF covers all four skills with real TCF-format questions and
        AI feedback, which is the core of exam preparation. A textbook
        is useful for systematic grammar review in week 1 if your
        grammar foundation is shaky, but not essential. Recommended
        reference grammars include Grammaire Progressive du Français
        (intermediate) and Bescherelle (verb conjugation).
      </p>

      <h3>What if I score below target on the Day 22 mock?</h3>
      <p>
        Postpone the exam. Extending by 2-3 weeks is almost always
        cheaper than retaking a failed exam — both financially (CAD 350+
        retake fee) and in terms of your Express Entry timeline. One
        extra round of practice is better than two rounds of exams.
      </p>

      <hr />

      <p className="text-sm text-muted-foreground">
        This study plan is a practical framework developed by HiTCF based
        on common candidate profiles, not an official FEI or IRCC
        recommendation. Individual results vary based on starting level,
        language background, and consistency. For the official TCF
        Canada exam format and score interpretation, see{" "}
        <a
          href="https://www.france-education-international.fr/test/tcf-canada"
          target="_blank"
          rel="noopener"
        >
          France Éducation International
        </a>{" "}
        and the HiTCF{" "}
        <Link href="/guide/tcf-score-chart">TCF score chart guide</Link>.
        For Canadian immigration language requirements, see{" "}
        <a
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof.html"
          target="_blank"
          rel="noopener"
        >
          IRCC
        </a>
        .
      </p>
    </>
  );
}
