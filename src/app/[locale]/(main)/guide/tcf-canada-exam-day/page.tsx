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
  const title = "TCF Canada Exam Day: Complete Walkthrough (2026)";
  const description =
    "Everything you need to know about TCF Canada exam day: what to bring, arrival timing, check-in process, section order, breaks, common mistakes, and when results arrive. Last updated " +
    LAST_UPDATED +
    ".";
  return {
    title,
    description,
    keywords: [
      "TCF Canada exam day",
      "TCF Canada what to bring",
      "TCF Canada check in",
      "TCF Canada test procedure",
      "TCF Canada exam rules",
      "TCF Canada results timeline",
      "TCF Canada breaks",
      "TCF Canada test centre procedure",
    ],
    alternates: {
      canonical: `/${locale}/guide/tcf-canada-exam-day`,
      languages: {
        zh: "/zh/guide/tcf-canada-exam-day",
        en: "/en/guide/tcf-canada-exam-day",
        fr: "/fr/guide/tcf-canada-exam-day",
        ar: "/ar/guide/tcf-canada-exam-day",
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/${locale}/guide/tcf-canada-exam-day`,
    },
  };
}

export default async function TcfExamDayGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const pageUrl = `${SITE_URL}/${locale}/guide/tcf-canada-exam-day`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LearningResource", "HowTo"],
        "@id": `${pageUrl}#howto`,
        name: "How to prepare for TCF Canada exam day",
        description:
          "Step-by-step guide to what to bring, when to arrive, and what to expect on TCF Canada exam day at authorized centres in Canada.",
        url: pageUrl,
        datePublished: LAST_UPDATED,
        dateModified: LAST_UPDATED,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: "en",
        learningResourceType: "procedural guide",
        totalTime: "PT4H",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Check your confirmation email",
            text: "Review the confirmation email from your test centre 48 hours before the exam. Confirm the exact address, arrival time, and required documents.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Pack required documents",
            text: "Bring your valid photo ID (passport or government-issued ID matching the name on your registration) and your printed confirmation email.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Arrive 30 to 45 minutes early",
            text: "Arrive at the centre at least 30 minutes before the scheduled start time to allow for check-in, ID verification, and locker assignment.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Complete the four sections in order",
            text: "Take the four mandatory sections in the order scheduled by the centre, typically Compréhension Orale (CO), Compréhension Écrite (CE), Expression Écrite (EE), then Expression Orale (EO).",
          },
          {
            "@type": "HowToStep",
            position: 5,
            name: "Wait 4 to 6 weeks for results",
            text: "Official results are typically available 4 to 6 weeks after the exam date. You will receive an email with instructions to download your score report from the candidate portal.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What do I need to bring to TCF Canada exam day?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You must bring a valid photo ID (passport or government-issued ID matching the name on your registration) and your printed confirmation email. Do not bring electronic devices, notes, or personal belongings into the exam room — centres typically provide lockers outside the room.",
            },
          },
          {
            "@type": "Question",
            name: "How early should I arrive for TCF Canada?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Arrive at the test centre at least 30 minutes before your scheduled start time, ideally 45 minutes. Check-in and ID verification can take time, especially at busy centres. Late arrivals may be refused entry without refund.",
            },
          },
          {
            "@type": "Question",
            name: "In what order are the TCF Canada sections given?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The four sections are typically given in this order: Compréhension Orale (CO, listening, 35 minutes), Compréhension Écrite (CE, reading, 60 minutes), Expression Écrite (EE, writing, 60 minutes), and Expression Orale (EO, speaking, 12 minutes). Exact order and timing may vary by centre.",
            },
          },
          {
            "@type": "Question",
            name: "Are there breaks during TCF Canada?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Short breaks between sections are offered at most centres, but policies vary. Longer breaks (more than 10 minutes) are uncommon. Plan to stay focused for approximately 3 hours total, including section changeovers.",
            },
          },
          {
            "@type": "Question",
            name: "When will I get my TCF Canada results?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Official TCF Canada results are typically available 4 to 6 weeks after the exam date. You will receive an email from France Éducation International when your score report is ready to download from the candidate portal. The original paper certificate is mailed separately.",
            },
          },
          {
            "@type": "Question",
            name: "Can I take TCF Canada on a computer or is it paper?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "TCF Canada is offered in both paper-based and computer-based (CBT) formats, depending on the test centre. The content and scoring are identical — only the delivery format differs. Alliance Française centres in Ottawa, Calgary, and Vancouver currently offer computer-based TCF Canada.",
            },
          },
          {
            "@type": "Question",
            name: "What happens if I fail TCF Canada?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "There is no 'pass' or 'fail' on TCF Canada — you receive a CEFR level (A1 to C2) and a CLB/NCLC equivalent for each of the four skills. If your level is lower than what your immigration program requires, you can retake the exam. Most centres require a 30-day waiting period between attempts.",
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

      <h1>TCF Canada Exam Day: Complete Walkthrough</h1>

      <p className="lead">
        After months of preparation, the TCF Canada exam itself is a
        surprisingly short event — around 3 hours of focused testing at
        an authorized centre. But the logistics of exam day trip up more
        candidates than the questions do. This guide walks you through
        what to bring, when to arrive, what happens during the exam, and
        what to expect afterwards. All information here is general — your
        specific centre&apos;s rules in the confirmation email always take
        precedence.
      </p>

      <p>
        Last updated: <strong>{LAST_UPDATED}</strong>. TCF Canada is
        administered by{" "}
        <a
          href="https://www.france-education-international.fr/test/tcf-canada"
          target="_blank"
          rel="noopener"
        >
          France Éducation International (FEI)
        </a>{" "}
        through a global network of authorized centres, including
        Alliance Française locations in most major Canadian cities.
      </p>

      <h2>48 hours before the exam</h2>

      <ul>
        <li>
          <strong>Re-read your confirmation email.</strong> Verify the
          exact centre address (some cities have multiple campuses), the
          scheduled arrival time (not the exam start time — arrival is
          usually 30 minutes earlier), and the list of required documents.
        </li>
        <li>
          <strong>Check your photo ID.</strong> The name on your ID must
          match <em>exactly</em> the name on your registration. If you
          booked under your maiden name but your current passport shows
          your married name, contact the centre immediately. Mismatches
          are a common reason candidates are turned away at the door.
        </li>
        <li>
          <strong>Plan your route.</strong> If you have not been to the
          centre before, do a dry run the day before. Downtown parking in
          cities like Ottawa or Vancouver can eat 15 minutes on test day.
        </li>
        <li>
          <strong>Light final review only.</strong> Do not cram new
          material. A 30-minute review of your weakest skill is
          productive; a 4-hour marathon will leave you exhausted for the
          exam itself.
        </li>
      </ul>

      <h2>What to bring</h2>

      <table>
        <thead>
          <tr>
            <th>Required</th>
            <th>Allowed</th>
            <th>Not allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Valid photo ID (passport or government-issued)</td>
            <td>Water bottle (clear, label-free at strict centres)</td>
            <td>Phone, smartwatch, any electronic device</td>
          </tr>
          <tr>
            <td>Printed confirmation email</td>
            <td>Small snack (stored outside the room)</td>
            <td>Notes, books, dictionaries</td>
          </tr>
          <tr>
            <td>Two black or blue pens (paper-based centres)</td>
            <td>Lip balm, tissues</td>
            <td>Earplugs (unless pre-approved accommodation)</td>
          </tr>
          <tr>
            <td></td>
            <td>Warm layer (exam rooms are often cold)</td>
            <td>Hats or hoods that obscure your face during ID check</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td>Backpacks or bags inside the exam room</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Phones:</strong> Every candidate we talk to underestimates
        how strict centres are about phones. Most centres require phones
        to be powered off (not silent) and stored in a locker outside the
        exam room. A phone buzzing in your pocket during the listening
        section has ended careers. Leave it in the locker.
      </p>

      <h2>Arrival and check-in</h2>

      <p>
        Arrive <strong>30 to 45 minutes</strong> before the scheduled
        exam start time. Check-in typically involves:
      </p>

      <ol>
        <li>
          <strong>Signing in at the reception desk.</strong> The
          invigilator will verify your ID against the candidate list.
          They may take a photo of you for the score report.
        </li>
        <li>
          <strong>Locker assignment.</strong> You store your phone,
          wallet, backpack, and anything else not explicitly allowed in
          the exam room.
        </li>
        <li>
          <strong>Seating.</strong> You will be assigned a specific seat
          or computer station. Paper-based candidates find their answer
          sheet already placed; computer-based candidates log in with a
          provided username and code.
        </li>
        <li>
          <strong>Instructions briefing.</strong> The invigilator reads
          the exam rules in French (and sometimes English). This is
          listening practice in itself — pay attention.
        </li>
      </ol>

      <h2>The four sections in order</h2>

      <p>
        Exact scheduling varies, but the standard order at most Canadian
        centres is:
      </p>

      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Duration</th>
            <th>Format</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>1. Compréhension Orale (CO)</strong> — Listening
            </td>
            <td>35 min</td>
            <td>39 multiple-choice questions</td>
            <td>
              Audio plays once only. No replays. Scratch paper usually
              provided.
            </td>
          </tr>
          <tr>
            <td>
              <strong>2. Compréhension Écrite (CE)</strong> — Reading
            </td>
            <td>60 min</td>
            <td>39 multiple-choice questions</td>
            <td>
              Questions get harder from A1 (Q1) through C2 (Q39). Skip
              and return if you get stuck on B2/C1.
            </td>
          </tr>
          <tr>
            <td>
              <strong>3. Expression Écrite (EE)</strong> — Writing
            </td>
            <td>60 min</td>
            <td>3 writing tasks</td>
            <td>
              Tâche 1: short message (~60 words). Tâche 2: article
              (~120 words). Tâche 3: argumentative (~180 words).
            </td>
          </tr>
          <tr>
            <td>
              <strong>4. Expression Orale (EO)</strong> — Speaking
            </td>
            <td>12 min</td>
            <td>3 speaking tasks with an examiner</td>
            <td>
              Face-to-face (or video call at some centres). Recorded for
              grading. No preparation time between tasks.
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Breaks:</strong> Centres usually offer short breaks
        between sections, but they are not guaranteed and are typically
        under 10 minutes. Do not plan to eat a full meal mid-exam. A
        granola bar and water between CE and EE is realistic; a cafeteria
        visit is not.
      </p>

      <h2>During the exam: common mistakes</h2>

      <h3>1. Spending too long on one hard question</h3>

      <p>
        TCF Canada rewards breadth, not depth. If you spend 5 minutes on
        Q18 of reading while 21 easier questions remain, you are trading
        1 possible correct answer for up to 21 abandoned ones. Skip
        anything you cannot answer in 90 seconds and come back if time
        permits. This is the single most common strategy mistake.
      </p>

      <h3>2. Second-guessing on the bubble sheet (paper-based)</h3>

      <p>
        Research on standardized testing shows candidates change correct
        answers to wrong ones more often than the reverse. Trust your
        first instinct unless you have a specific reason to doubt it.
      </p>

      <h3>3. Writing too little (or too much) on EE</h3>

      <p>
        The suggested word counts for Expression Écrite tasks are not
        decorative. Under-writing is penalized more heavily than
        over-writing, but both hurt. Aim for exactly the target length ±
        10%. Practice this on HiTCF&apos;s{" "}
        <Link href="/tests?type=writing">writing task bank</Link> until
        you can hit the word count without consciously counting.
      </p>

      <h3>4. Freezing on EO Tâche 2 or 3</h3>

      <p>
        The hardest speaking task for most candidates is Tâche 2
        (information gathering) or Tâche 3 (opinion persuasion). If you
        blank, speak about <em>the topic in general terms</em> rather
        than staying silent. Examiners grade your range, fluency, and
        task completion — saying something imperfect beats saying
        nothing.
      </p>

      <h2>After the exam</h2>

      <ul>
        <li>
          <strong>Immediately:</strong> You walk out with nothing — no
          paper, no audio recording, no provisional score. Your answer
          sheets and recordings go to FEI for grading.
        </li>
        <li>
          <strong>Week 1–2:</strong> Your file reaches FEI&apos;s central
          processing in France.
        </li>
        <li>
          <strong>Week 4–6:</strong> You receive an email from FEI
          notifying you that your attestation (score report) is ready.
          Log into the candidate portal with the credentials from your
          registration, download the PDF, and verify all four scores and
          personal details.
        </li>
        <li>
          <strong>Week 6–10:</strong> The original paper attestation
          arrives by mail at the address you registered. This is the
          document IRCC accepts for Express Entry, along with the digital
          PDF verification.
        </li>
      </ul>

      <p>
        Your results are valid for <strong>2 years</strong> from the
        exam date. Plan your Express Entry profile submission
        accordingly.
      </p>

      <h2>How HiTCF prepares you for exam day</h2>

      <p>
        The best thing you can do the day before TCF Canada is{" "}
        <em>not be surprised by anything</em>. HiTCF&apos;s{" "}
        <strong>exam mode</strong> mirrors the real test conditions:
      </p>

      <ul>
        <li>
          <strong>Timed sections</strong> — 35 min CO, 60 min CE, 60 min
          EE, 12 min EO, matching the official durations.
        </li>
        <li>
          <strong>Single-play listening audio</strong> — just like the
          real exam, audio clips in exam mode cannot be replayed.
        </li>
        <li>
          <strong>Difficulty ramp from A1 to C2</strong> — questions
          follow the real TCF Canada ordering (easy first, hardest last),
          so you learn when to skip.
        </li>
        <li>
          <strong>AI evaluation for EE and EO</strong> — writing is
          scored on the official 4-criteria rubric; speaking is scored
          by Azure Speech pronunciation assessment + Grok evaluation
          across the 6 TCF speaking dimensions.
        </li>
        <li>
          <strong>Sentence-level audio replay for post-exam review</strong>{" "}
          — practice mode lets you replay any sentence in isolation, so
          you can learn from every listening mistake.
        </li>
      </ul>

      <p>
        HiTCF hosts <strong>1,306 test sets</strong> and{" "}
        <strong>8,397 questions</strong> across all four skills: 42
        listening sets, 42 reading sets, 702 speaking topic sets, and
        520 writing task sets. New users get a 7-day Pro trial — no
        credit card required.
      </p>

      <p>
        <Link
          href="/tests"
          className="inline-block rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground no-underline"
        >
          Start practising in exam mode →
        </Link>
      </p>

      <h2>Frequently asked questions</h2>

      <h3>Can I reschedule my TCF Canada exam?</h3>
      <p>
        Rescheduling policies are set by each individual centre, not by
        FEI centrally. Most Alliance Française centres allow one
        reschedule with 7–14 days notice for an admin fee. Cancellations
        closer to the exam date are usually not refundable. Always check
        your centre&apos;s terms at booking.
      </p>

      <h3>Can I take TCF Canada in Canada?</h3>
      <p>
        Yes. TCF Canada is offered at authorized centres across Canada,
        including Alliance Française locations in Ottawa, Calgary,
        Vancouver, Toronto, Montreal, and other major cities. Seats in
        the Ottawa, Calgary, and Vancouver centres fill quickly — HiTCF
        provides a{" "}
        <Link href="/seat-monitor">real-time seat availability monitor</Link>{" "}
        for these three cities, updated every 15 seconds.
      </p>

      <h3>Is the TCF Canada speaking section with a human or AI?</h3>
      <p>
        A human examiner conducts the speaking section. At some centres
        this is done face-to-face in a separate room; at others, by
        video call. The conversation is recorded for grading by trained
        evaluators at FEI.
      </p>

      <h3>Do I need to prepare for the speaking section in advance?</h3>
      <p>
        Absolutely yes. The 12-minute EO section is the shortest but
        also the most performance-dependent. Prepare sample topics for
        each Tâche (1: introduction, 2: information gathering, 3: opinion
        persuasion) and rehearse them aloud. HiTCF provides 702 speaking
        topic sets with AI evaluation that mirrors the 6-dimension TCF
        rubric (pronunciation, fluency, grammar, vocabulary, task
        completion, sociolinguistic appropriateness).
      </p>

      <h3>What happens if I am sick on exam day?</h3>
      <p>
        Centre policies vary. Some allow a medical deferral with a
        doctor&apos;s note; others require full re-registration. Contact
        your centre the moment you know you cannot attend. Do not simply
        not show up — that typically forfeits the full fee.
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
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof.html"
          target="_blank"
          rel="noopener"
        >
          IRCC — Language requirements
        </a>
        . Specific check-in procedures, break policies, and rescheduling
        terms are set by individual test centres — always confirm with
        your centre before exam day. This guide is maintained by HiTCF,
        an independent TCF Canada practice platform with no affiliation
        to FEI or IRCC.
      </p>
    </>
  );
}
