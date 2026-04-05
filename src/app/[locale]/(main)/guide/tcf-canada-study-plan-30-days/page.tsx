import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

const SITE_URL = "https://hitcf.com";
const LAST_UPDATED = "2026-04-05";

type Locale = "en" | "zh" | "fr" | "ar";

const IRCC_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof.html";
const FEI_URL = "https://www.france-education-international.fr/test/tcf-canada";

const IRCC = (label: string) => (
  <a href={IRCC_URL} target="_blank" rel="noopener">
    {label}
  </a>
);
const FEI = (label: string) => (
  <a href={FEI_URL} target="_blank" rel="noopener">
    {label}
  </a>
);

interface WeekDailyRow {
  time: string;
  activity: React.ReactNode;
}

interface Content {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: React.ReactNode;
  lastUpdatedLabel: string;
  lastUpdatedBody: React.ReactNode;
  h2who: string;
  whoList: React.ReactNode[];
  h2expectations: string;
  expectationsIntro: string;
  expectHeaders: [string, string];
  expectRows: Array<[string, string]>;
  expectClosing: React.ReactNode;
  h2weekly: string;
  weeklyHeaders: [string, string, string, string];
  weeklyRows: Array<{
    week: string;
    focus: string;
    time: string;
    output: string;
  }>;
  h2week1: string;
  week1Goal: React.ReactNode;
  week1Day1Title: string;
  week1Day1Body: React.ReactNode;
  week1Day23Title: string;
  week1Day23Body: React.ReactNode;
  week1Day23List: string[];
  week1Day46Title: string;
  week1Day46Body: React.ReactNode;
  week1Day46List: React.ReactNode[];
  week1Day7Title: string;
  week1Day7Body: React.ReactNode;
  h2week2: string;
  week2Goal: React.ReactNode;
  week2DailyIntro: string;
  dailyHeaders: [string, string];
  week2Daily: WeekDailyRow[];
  week2Closing: React.ReactNode;
  h2week3: string;
  week3Goal: React.ReactNode;
  week3DailyIntro: string;
  week3Daily: WeekDailyRow[];
  week3Critical: React.ReactNode;
  h2week4: string;
  week4Goal: React.ReactNode;
  week4Day22Title: string;
  week4Day22Body: React.ReactNode;
  week4Day2324Title: string;
  week4Day2324Body: React.ReactNode;
  week4Day2526Title: string;
  week4Day2526Body: React.ReactNode;
  week4Day27Title: string;
  week4Day27Body: React.ReactNode;
  week4Day2829Title: string;
  week4Day2829Body: React.ReactNode;
  week4Day30Title: string;
  week4Day30Body: React.ReactNode;
  h2help: string;
  helpIntro: React.ReactNode;
  helpList: React.ReactNode[];
  cta: string;
  h2mistakes: string;
  mistake1Title: string;
  mistake1Body: React.ReactNode;
  mistake2Title: string;
  mistake2Body: React.ReactNode;
  mistake3Title: string;
  mistake3Body: React.ReactNode;
  mistake4Title: string;
  mistake4Body: React.ReactNode;
  mistake5Title: string;
  mistake5Body: React.ReactNode;
  h2faq: string;
  faqs: { q: string; a: React.ReactNode }[];
  footnoteBody: React.ReactNode;
}

const CONTENT: Record<Locale, Content> = {
  en: {
    metaTitle: "TCF Canada 30-Day Study Plan: From B1 to CLB 7 (2026)",
    metaDescription:
      "A realistic 30-day study plan to reach CLB 7 on TCF Canada. Day-by-day schedule, weekly milestones, skill-specific practice targets, and honest expectations. Last updated " +
      LAST_UPDATED +
      ".",
    h1: "TCF Canada 30-Day Study Plan: From B1 to CLB 7",
    lead: (
      <>
        Thirty days is enough time to move from{" "}
        <strong>B1 French (CLB 5-6)</strong> to{" "}
        <strong>B2 French (CLB 7)</strong> on TCF Canada — but only with
        focused daily practice and a plan that balances the four
        skills. This guide gives you a realistic week-by-week schedule,
        daily targets, and honest expectations. It is not a shortcut.
        If you follow it, you will spend about{" "}
        <strong>60 to 70 hours</strong> of focused French practice in
        the next month.
      </>
    ),
    lastUpdatedLabel: "Last updated",
    lastUpdatedBody: (
      <>
        . The plan below assumes you are already at B1 level (roughly
        CLB 5-6), can read a simple news article with some dictionary
        lookups, and can hold a basic 5-minute conversation in French.
        If your current level is lower, extend the plan to 60-90 days
        rather than forcing 30.
      </>
    ),
    h2who: "Who this plan is for",
    whoList: [
      <>
        <strong>Target audience:</strong> Candidates preparing for{" "}
        {IRCC("Canadian Express Entry")} who need CLB 7 in French
        (minimum for most Federal Skilled Worker profiles).
      </>,
      <>
        <strong>Starting level:</strong> B1 (TCF Canada CO/CE 300-399
        points, EE/EO 6-9 points). If unsure, take a diagnostic set on{" "}
        <Link href="/tests">HiTCF</Link> to confirm.
      </>,
      <>
        <strong>Target level:</strong> B2 (CO/CE 400-499 points, EE/EO
        10-13 points), corresponding to CLB 7-8.
      </>,
      <>
        <strong>Daily commitment:</strong> 1.5 to 2.5 hours per day, 6
        days per week. One rest day is built in — skipping it leads to
        week 3 burnout.
      </>,
    ],
    h2expectations: "Honest expectations",
    expectationsIntro:
      "Before committing to this plan, understand what 30 days can and cannot do:",
    expectHeaders: ["Realistic in 30 days", "Not realistic in 30 days"],
    expectRows: [
      ["B1 → B2 (CLB 5-6 → CLB 7)", "A2 → B2 (CLB 3 → CLB 7)"],
      [
        "B2 → C1 in 1-2 sections, B2 in the others",
        "B2 → C1 (CLB 9) in all 4 sections",
      ],
      [
        "Reading and listening scores improve 50-100 points",
        "Writing and speaking jumping 2 CEFR bands",
      ],
      [
        "Familiarity with the exam format and pacing",
        "Replacing 2+ years of cumulative language exposure",
      ],
      [
        "Hitting CLB 7 if you are borderline B1-B2",
        "Hitting CLB 9+ from a cold start",
      ],
    ],
    expectClosing: (
      <>
        If your starting level is below B1, the most effective thing
        you can do in 30 days is delay the exam and keep studying for
        another 30-60 days. Expensive retakes are more painful than
        postponement.
      </>
    ),
    h2weekly: "Weekly structure",
    weeklyHeaders: ["Week", "Focus", "Daily time", "Main output"],
    weeklyRows: [
      {
        week: "Week 1",
        focus: "Diagnostic + vocabulary + grammar foundation",
        time: "~1.5h",
        output: "Know your weakest skill. 300 new words reviewed.",
      },
      {
        week: "Week 2",
        focus: "Compréhension Orale + Compréhension Écrite heavy",
        time: "~2h",
        output: "CO/CE accuracy rising from ~50% to ~70% on B1.",
      },
      {
        week: "Week 3",
        focus: "Expression Écrite + Expression Orale heavy",
        time: "~2.5h",
        output: "1 graded writing per day. 2 speaking topics per day.",
      },
      {
        week: "Week 4",
        focus: "Mock exams + targeted review + rest before exam",
        time: "~2h",
        output: "2 full timed mock exams. Final gap closure.",
      },
    ],
    h2week1: "Week 1: Diagnostic and foundation",
    week1Goal: (
      <>
        <strong>Goal:</strong> Establish a baseline and build
        vocabulary + core grammar.
      </>
    ),
    week1Day1Title: "Day 1 — Full diagnostic",
    week1Day1Body: (
      <>
        Take a complete 4-skill exam on HiTCF in{" "}
        <strong>exam mode</strong> to get your baseline. Do not study
        before this — you want an honest snapshot. Results will show
        you which section is your weakest. This matters: week 2-3
        schedules shift based on your weakest skill.
      </>
    ),
    week1Day23Title: "Day 2-3 — Vocabulary sprint",
    week1Day23Body: (
      <>
        Load 300-500 high-frequency B1-B2 French words into HiTCF&apos;s
        vocabulary flashcard system. Review 60-100 per day. Focus on:
      </>
    ),
    week1Day23List: [
      "Connectors (cependant, néanmoins, en revanche, puisque)",
      "Opinion verbs (estimer, considérer, prétendre, soutenir)",
      "Abstract nouns for essays (conséquence, enjeu, démarche)",
      "Common idioms for speaking (en effet, à vrai dire, tout de même)",
    ],
    week1Day46Title: "Day 4-6 — Grammar review",
    week1Day46Body: (
      <>Review these high-impact grammar points (30 min each day):</>
    ),
    week1Day46List: [
      <>
        <strong>Subjunctive</strong> (il faut que, bien que, avant que,
        jusqu&apos;à ce que)
      </>,
      <>
        <strong>Conditional</strong> (si + imparfait → conditionnel
        présent)
      </>,
      <>
        <strong>Passive voice</strong> and formal alternatives (on +
        active, reflexive passive)
      </>,
      <>
        <strong>Pronouns</strong> (y, en, double pronouns: le lui, la
        leur)
      </>,
      <>
        <strong>Past tenses distinction</strong> (imparfait vs passé
        composé vs plus-que-parfait)
      </>,
    ],
    week1Day7Title: "Day 7 — Rest",
    week1Day7Body: (
      <>
        Do not study. Take a full day off. Watch a French film without
        subtitles if you want passive exposure, but no active study.
        Rest is not a luxury — it is when consolidation happens.
      </>
    ),
    h2week2: "Week 2: Compréhension Orale + Compréhension Écrite",
    week2Goal: (
      <>
        <strong>Goal:</strong> Raise CO + CE accuracy from ~50% to
        ~70% on B1 questions. These two sections respond fastest to
        practice and together account for more than half your overall
        score.
      </>
    ),
    week2DailyIntro: "Daily plan (2 hours):",
    dailyHeaders: ["Time", "Activity"],
    week2Daily: [
      {
        time: "0:00 - 0:15",
        activity:
          "Vocabulary flashcard review (20 cards, mix of new and due)",
      },
      {
        time: "0:15 - 0:50",
        activity: (
          <>
            3-4 listening sets (CO) in practice mode, full review of
            every wrong answer using HiTCF&apos;s sentence-level audio
            replay
          </>
        ),
      },
      {
        time: "0:50 - 1:25",
        activity:
          "3-4 reading sets (CE) in practice mode, focus on scanning for keywords before reading full paragraphs",
      },
      {
        time: "1:25 - 1:45",
        activity: (
          <>
            Wrong-answer notebook review — look at yesterday&apos;s
            mistakes and confirm you now understand them
          </>
        ),
      },
      {
        time: "1:45 - 2:00",
        activity:
          "Short speaking warm-up: 5 minutes talking to yourself about your day in French. No structure, just fluency.",
      },
    ],
    week2Closing: (
      <>
        By end of week 2, you should see CO/CE practice accuracy
        rising to ~70% on B1 questions and ~50% on B2. If not, stop
        adding new vocabulary and review the fundamental grammar from
        week 1.
      </>
    ),
    h2week3: "Week 3: Expression Écrite + Expression Orale",
    week3Goal: (
      <>
        <strong>Goal:</strong> Write and speak enough to build
        confidence and fluency. Productive skills improve slowly, but
        21 days of consistent daily practice moves the needle.
      </>
    ),
    week3DailyIntro: "Daily plan (2.5 hours):",
    week3Daily: [
      {
        time: "0:00 - 0:15",
        activity: "Vocabulary review (continue the week 1-2 pool)",
      },
      {
        time: "0:15 - 0:45",
        activity:
          "1 listening + 1 reading set to maintain receptive skills (not letting them slip)",
      },
      {
        time: "0:45 - 1:15",
        activity: (
          <>
            <strong>1 full writing task</strong> (alternate Tâche 1, 2,
            3 across the week) with AI feedback. Read the corrections
            carefully — the feedback is more valuable than the original
            draft.
          </>
        ),
      },
      {
        time: "1:15 - 1:45",
        activity: (
          <>
            <strong>2 speaking topics</strong> with pronunciation
            scoring. Record yourself, listen back, re-record the same
            topic if your first attempt was below 60% on any
            dimension.
          </>
        ),
      },
      {
        time: "1:45 - 2:15",
        activity:
          "Review of writing AI feedback from previous days — rewrite one paragraph that scored poorly",
      },
      {
        time: "2:15 - 2:30",
        activity: "Wrong-answer notebook review",
      },
    ],
    week3Critical: (
      <>
        <strong>Critical:</strong> Do not skip speaking practice even
        once in week 3. Two days off in speaking loses more progress
        than two days off in any other skill.
      </>
    ),
    h2week4: "Week 4: Mock exams and refinement",
    week4Goal: (
      <>
        <strong>Goal:</strong> Validate your level under real test
        conditions and close remaining gaps.
      </>
    ),
    week4Day22Title: "Day 22 — Full mock exam in exam mode",
    week4Day22Body: (
      <>
        Take a complete TCF Canada mock under real timing (35 min CO,
        60 min CE, 60 min EE, 12 min EO). No breaks longer than 5
        minutes. Do not review until the end. This is a dress
        rehearsal.
      </>
    ),
    week4Day2324Title: "Day 23-24 — Deep review",
    week4Day2324Body: (
      <>
        Review every wrong answer from the mock exam. Look for
        patterns: are you losing points on B2 reading because of
        unknown vocabulary, or because of question comprehension? The
        answer determines what to study in the remaining days.
      </>
    ),
    week4Day2526Title: "Day 25-26 — Targeted gap filling",
    week4Day2526Body: (
      <>
        Spend these two days on your weakest area from the mock exam
        results. Use HiTCF&apos;s filter by level and type to generate
        targeted practice sets.
      </>
    ),
    week4Day27Title: "Day 27 — Second full mock exam",
    week4Day27Body: (
      <>
        Take another complete mock. Your score should be 30-60 points
        higher on CO/CE and 1-2 points higher on EE/EO compared to
        Day 22. If not, the plan needs more time — postpone the exam.
      </>
    ),
    week4Day2829Title: "Day 28-29 — Final calibration",
    week4Day2829Body: (
      <>
        Light review only. No new material. Go back to the
        wrong-answer notebook, confirm all previously difficult
        questions are now solid. Re-do 3-5 writing tasks to maintain
        muscle memory.
      </>
    ),
    week4Day30Title: "Day 30 — Rest",
    week4Day30Body: (
      <>
        No study. Confirm your exam logistics (see the{" "}
        <Link href="/guide/tcf-canada-exam-day">
          exam day walkthrough
        </Link>
        ). Pack your documents. Sleep early. Trust the 29 days of
        work.
      </>
    ),
    h2help: "How HiTCF supports this 30-day plan",
    helpIntro: (
      <>
        HiTCF was built specifically for this kind of structured
        preparation. The features that matter most for a 30-day
        sprint:
      </>
    ),
    helpList: [
      <>
        <strong>1,306 test sets / 8,397 questions</strong> across A1-C2
        — you will not run out of fresh material at any point in 30
        days, even at 15-20 sets per day.
      </>,
      <>
        <strong>Sentence-level audio timestamps</strong> — replay any
        sentence of any listening passage independently. Critical for
        week 2 CO drilling.
      </>,
      <>
        <strong>
          AI writing feedback on the 4-criteria TCF rubric
        </strong>{" "}
        — unlimited graded drafts, no waiting for a tutor. Essential
        for week 3.
      </>,
      <>
        <strong>
          AI speaking evaluation via Azure Speech + Grok
        </strong>{" "}
        — 6-dimension scoring (pronunciation, fluency, grammar,
        vocabulary, task completion, sociolinguistic appropriateness)
        matching the real TCF rubric.
      </>,
      <>
        <strong>Wrong-answer notebook with spaced repetition</strong>{" "}
        — mistakes automatically queue for review until mastered.
      </>,
      <>
        <strong>Speed drill mode by CEFR level</strong> — generate
        B1-only or B2-only sets on demand for targeted practice.
      </>,
      <>
        <strong>Exam mode with real timing</strong> — for the 2-3
        full mocks in weeks 1 and 4.
      </>,
      <>
        <strong>7-day free Pro trial on registration</strong> —
        covers week 1 entirely. Subscribe for weeks 2-4 if the format
        works for you.
      </>,
    ],
    cta: "Start the 30-day plan with a Week 1 diagnostic →",
    h2mistakes: "Common mistakes that derail the plan",
    mistake1Title: "Mistake 1: Skipping the Week 1 diagnostic",
    mistake1Body: (
      <>
        Candidates often want to jump straight into practice to feel
        productive. The diagnostic takes 3 hours but saves 30+ hours
        of mis-targeted effort. Without it, you do not know whether to
        prioritise listening or writing, and you will discover the gap
        too late.
      </>
    ),
    mistake2Title: "Mistake 2: Over-focusing on strong skills",
    mistake2Body: (
      <>
        Your TCF Canada score is the <em>minimum</em> of your four
        skill levels for CLB purposes. If you are CLB 8 in reading but
        CLB 5 in speaking, your reported CLB is 5. Spend time on your
        weakest skill, not your strongest. This is counter-intuitive —
        strong skills feel rewarding to practice, weak skills feel
        uncomfortable.
      </>
    ),
    mistake3Title: "Mistake 3: Leaving speaking for week 4",
    mistake3Body: (
      <>
        Speaking is the slowest-improving skill. Candidates who leave
        it until the last week consistently underperform. Better:
        15-20 minutes of speaking every single day from Day 3
        onwards.
      </>
    ),
    mistake4Title: "Mistake 4: Only doing mock exams, never reviewing",
    mistake4Body: (
      <>
        Taking 15 mock exams without detailed review teaches you
        nothing. Taking 5 mock exams and spending 2 hours reviewing
        each teaches you everything. The exam is the measurement, not
        the learning.
      </>
    ),
    mistake5Title: "Mistake 5: Studying more than 3 hours per day",
    mistake5Body: (
      <>
        Past 3 hours, retention drops sharply and exhaustion compounds
        across days. If you truly have more time, split it: 2 hours
        in the morning, 1 hour in the evening. But 4 hours in a
        single block does not produce 4 hours of learning.
      </>
    ),
    h2faq: "Frequently asked questions",
    faqs: [
      {
        q: "Is 30 days enough to prepare for TCF Canada?",
        a: (
          <>
            It depends on your starting level. 30 days is realistic
            for someone currently at B1 (CLB 5-6) aiming for CLB 7, or
            someone at B2 aiming for CLB 8-9. It is not realistic to
            go from A2 to CLB 7 in 30 days — you would need at least
            60-90 days of focused practice for that jump.
          </>
        ),
      },
      {
        q: "How many hours per day do I need?",
        a: (
          <>
            Plan for 1.5 to 2.5 hours of focused practice per day over
            30 days, totalling 45-75 hours. Less than 1 hour per day
            is unlikely to produce measurable improvement. More than
            3 hours per day leads to diminishing returns and burnout
            by week 3.
          </>
        ),
      },
      {
        q: "Can I do this plan while working full-time?",
        a: (
          <>
            Yes — 2 hours per day is achievable alongside a 40-hour
            work week, but it requires giving up most of your weekday
            evenings and both weekend days. If that is not possible,
            extend the plan to 60 days at 1 hour per day instead.
          </>
        ),
      },
      {
        q: "What is the best order to tackle the four skills?",
        a: (
          <>
            Start with CO and CE (week 2 heavy) because they respond
            fastest to practice and give confidence. Add EE in week
            2-3 with daily AI-graded drafts. EO needs daily
            low-intensity practice throughout all 30 days — never
            leave it until the last week.
          </>
        ),
      },
      {
        q: "Should I also use textbooks or only HiTCF?",
        a: (
          <>
            HiTCF covers all four skills with real TCF-format
            questions and AI feedback, which is the core of exam
            preparation. A textbook is useful for systematic grammar
            review in week 1 if your grammar foundation is shaky, but
            not essential.
          </>
        ),
      },
      {
        q: "What if I score below target on the Day 22 mock?",
        a: (
          <>
            Postpone the exam. Extending by 2-3 weeks is almost always
            cheaper than retaking a failed exam — both financially and
            in terms of your Express Entry timeline. One extra round
            of practice is better than two rounds of exams.
          </>
        ),
      },
    ],
    footnoteBody: (
      <>
        This study plan is a practical framework developed by HiTCF
        based on common candidate profiles, not an official FEI or
        IRCC recommendation. Individual results vary. For the
        official TCF Canada exam format, see{" "}
        {FEI("France Éducation International")} and the HiTCF{" "}
        <Link href="/guide/tcf-score-chart">TCF score chart guide</Link>
        . For Canadian immigration language requirements, see{" "}
        {IRCC("IRCC")}.
      </>
    ),
  },
  zh: {
    metaTitle: "TCF Canada 30 天备考计划：从 B1 到 CLB 7（2026）",
    metaDescription:
      "现实可行的 30 天 TCF Canada 备考计划。从 B1 到 CLB 7 的日程表、每周里程碑、各科练习目标、诚实的期望管理。更新于 " +
      LAST_UPDATED +
      "。",
    h1: "TCF Canada 30 天备考计划：从 B1 到 CLB 7",
    lead: (
      <>
        30 天足以把 TCF Canada 的法语水平从
        <strong>B1（CLB 5-6）</strong>提升到
        <strong>B2（CLB 7）</strong>
        ——前提是每天有专注练习，并且计划平衡四个科目。本指南给你一份现实的周度日程表、每日目标、以及诚实的期望管理。这不是捷径。照这个计划走，接下来 30 天你会专注练习法语约
        <strong>60 到 70 小时</strong>。
      </>
    ),
    lastUpdatedLabel: "最后更新",
    lastUpdatedBody: (
      <>
        。下面的计划假设你已经处于 B1 水平（约 CLB 5-6），能够借助字典读简单新闻文章，能用法语进行 5 分钟的基本对话。如果你的水平更低，请把计划延长到 60–90 天，而不要强行压缩到 30 天。
      </>
    ),
    h2who: "这个计划适合谁",
    whoList: [
      <>
        <strong>目标读者：</strong>准备{IRCC("加拿大 Express Entry")}
        的申请人，需要法语 CLB 7（绝大多数联邦技术移民的最低要求）。
      </>,
      <>
        <strong>起点水平：</strong>B1（TCF Canada CO/CE 300–399 分，EE/EO 6–9 分）。不确定的话，先在
        <Link href="/tests">HiTCF</Link>上做一套诊断题。
      </>,
      <>
        <strong>目标水平：</strong>B2（CO/CE 400–499 分，EE/EO 10–13 分），对应 CLB 7–8。
      </>,
      <>
        <strong>每日投入：</strong>每天 1.5–2.5 小时，每周 6 天。留出一天休息——不休息的人大都在第 3 周倒下。
      </>,
    ],
    h2expectations: "诚实的期望管理",
    expectationsIntro:
      "开始计划前，先搞清楚 30 天能做到什么、不能做到什么：",
    expectHeaders: ["30 天内可实现", "30 天内不可实现"],
    expectRows: [
      ["B1 → B2（CLB 5-6 → CLB 7）", "A2 → B2（CLB 3 → CLB 7）"],
      [
        "1-2 个科目从 B2 提到 C1，其余保持 B2",
        "四科都从 B2 提到 C1（CLB 9）",
      ],
      ["听力阅读分数提升 50–100 分", "写作口语跨越 2 个 CEFR 等级"],
      ["熟悉考试题型和节奏", "替代 2 年以上的语言积累"],
      ["从 B1-B2 临界点冲到 CLB 7", "从零基础冲到 CLB 9+"],
    ],
    expectClosing: (
      <>
        如果你的起点低于 B1，在 30 天内最明智的选择是推迟考试，再多学 30–60 天。昂贵的重考比推迟更痛苦。
      </>
    ),
    h2weekly: "周度结构",
    weeklyHeaders: ["周", "重点", "每日时间", "主要产出"],
    weeklyRows: [
      {
        week: "第 1 周",
        focus: "诊断 + 词汇 + 语法基础",
        time: "~1.5 小时",
        output: "知道自己最弱的科目。复习 300 个新词。",
      },
      {
        week: "第 2 周",
        focus: "重点突破 CO + CE",
        time: "~2 小时",
        output: "CO/CE 练习正确率从约 50% 升到 70%（B1 题）。",
      },
      {
        week: "第 3 周",
        focus: "重点突破 EE + EO",
        time: "~2.5 小时",
        output: "每天 1 篇 AI 批改写作。每天 2 个口语话题。",
      },
      {
        week: "第 4 周",
        focus: "模考 + 针对性查漏 + 考前休息",
        time: "~2 小时",
        output: "2 次完整模考。查漏补缺。",
      },
    ],
    h2week1: "第 1 周：诊断与打基础",
    week1Goal: (
      <>
        <strong>目标：</strong>建立基线 + 积累词汇和核心语法。
      </>
    ),
    week1Day1Title: "第 1 天 — 完整诊断",
    week1Day1Body: (
      <>
        在 HiTCF 用<strong>考试模式</strong>做一套完整的四科考试，建立基线。这之前不要学习——你需要的是诚实的快照。结果会告诉你哪一科最弱。这一步很关键：第 2、3 周的计划会根据你的最弱科目调整。
      </>
    ),
    week1Day23Title: "第 2–3 天 — 词汇冲刺",
    week1Day23Body: (
      <>
        把 300–500 个 B1–B2 高频法语词加入 HiTCF 的词汇卡片系统。每天复习 60–100 个。重点关注：
      </>
    ),
    week1Day23List: [
      "连接词（cependant、néanmoins、en revanche、puisque）",
      "观点动词（estimer、considérer、prétendre、soutenir）",
      "议论文用的抽象名词（conséquence、enjeu、démarche）",
      "口语常用表达（en effet、à vrai dire、tout de même）",
    ],
    week1Day46Title: "第 4–6 天 — 语法复习",
    week1Day46Body: (
      <>复习这些高价值语法点（每天 30 分钟）：</>
    ),
    week1Day46List: [
      <>
        <strong>虚拟式</strong>（il faut que、bien que、avant que、jusqu&apos;à ce que）
      </>,
      <>
        <strong>条件式</strong>（si + imparfait → conditionnel présent）
      </>,
      <>
        <strong>被动语态</strong>和正式表达（on + 主动句、自反被动）
      </>,
      <>
        <strong>代词</strong>（y、en、双代词：le lui、la leur）
      </>,
      <>
        <strong>过去时态区分</strong>（imparfait vs passé composé vs plus-que-parfait）
      </>,
    ],
    week1Day7Title: "第 7 天 — 休息",
    week1Day7Body: (
      <>
        不学习。休一整天。如果想保持被动输入可以看一部不带字幕的法语电影，但不做主动练习。休息不是奢侈品——巩固就在这一天发生。
      </>
    ),
    h2week2: "第 2 周：CO + CE",
    week2Goal: (
      <>
        <strong>目标：</strong>把 CO + CE 的 B1 题练习正确率从约 50% 提到 70%。这两科对练习反应最快，而且合计占总分的一半以上。
      </>
    ),
    week2DailyIntro: "每日计划（2 小时）：",
    dailyHeaders: ["时间", "活动"],
    week2Daily: [
      {
        time: "0:00 - 0:15",
        activity: "词汇卡片复习（20 张，新词和待复习词混合）",
      },
      {
        time: "0:15 - 0:50",
        activity: (
          <>
            3–4 套 CO 听力在练习模式做，每道错题用 HiTCF 的句子级音频回放完整复盘
          </>
        ),
      },
      {
        time: "0:50 - 1:25",
        activity:
          "3–4 套 CE 阅读在练习模式做，读全文前先扫读关键词",
      },
      {
        time: "1:25 - 1:45",
        activity: "错题本复习——回看昨天的错题，确认现在真的理解了",
      },
      {
        time: "1:45 - 2:00",
        activity:
          "口语热身：用法语对着自己说 5 分钟今天发生的事。不用结构，只练流畅度。",
      },
    ],
    week2Closing: (
      <>
        第 2 周结束时，CO/CE 的 B1 题练习正确率应该达到约 70%，B2 题约 50%。如果没有，停止加新词，回到第 1 周的基础语法重新复习。
      </>
    ),
    h2week3: "第 3 周：EE + EO",
    week3Goal: (
      <>
        <strong>目标：</strong>通过每日写作和口语建立信心和流畅度。产出型技能提升慢，但 21 天的每日坚持能推动指针。
      </>
    ),
    week3DailyIntro: "每日计划（2.5 小时）：",
    week3Daily: [
      {
        time: "0:00 - 0:15",
        activity: "词汇复习（继续第 1-2 周的词池）",
      },
      {
        time: "0:15 - 0:45",
        activity: "1 套听力 + 1 套阅读，维持接收技能（不让它们滑坡）",
      },
      {
        time: "0:45 - 1:15",
        activity: (
          <>
            <strong>1 道完整写作任务</strong>（一周内轮换 Tâche 1、2、3）配 AI 反馈。仔细阅读修改建议——反馈比原稿更有价值。
          </>
        ),
      },
      {
        time: "1:15 - 1:45",
        activity: (
          <>
            <strong>2 个口语话题</strong>配发音评分。录音，回听，如果任一维度低于 60%，就同一话题重录一次。
          </>
        ),
      },
      {
        time: "1:45 - 2:15",
        activity: "复习前几天的写作 AI 反馈——重写一段分数低的段落",
      },
      {
        time: "2:15 - 2:30",
        activity: "错题本复习",
      },
    ],
    week3Critical: (
      <>
        <strong>关键：</strong>第 3 周绝对不能漏一天口语练习。口语停两天损失的进度比其他科目停两天更多。
      </>
    ),
    h2week4: "第 4 周：模考和查漏",
    week4Goal: (
      <>
        <strong>目标：</strong>在真实考试条件下验证水平，补最后的漏洞。
      </>
    ),
    week4Day22Title: "第 22 天 — 考试模式完整模考",
    week4Day22Body: (
      <>
        做一次完整 TCF Canada 模考，严格按真考时长（35 分钟 CO、60 分钟 CE、60 分钟 EE、12 分钟 EO）。中间休息不超过 5 分钟。做完前不要回看。这是正式彩排。
      </>
    ),
    week4Day2324Title: "第 23–24 天 — 深度复盘",
    week4Day2324Body: (
      <>
        逐题复盘模考中的所有错题。找规律：B2 阅读丢分是因为生词还是因为没看懂题目？答案决定剩余几天学什么。
      </>
    ),
    week4Day2526Title: "第 25–26 天 — 针对性补漏",
    week4Day2526Body: (
      <>
        这两天专攻模考结果显示的最弱项。用 HiTCF 的按等级 + 按题型筛选功能生成针对性练习。
      </>
    ),
    week4Day27Title: "第 27 天 — 第二次完整模考",
    week4Day27Body: (
      <>
        再做一次完整模考。CO/CE 分数应该比第 22 天高 30–60 分，EE/EO 高 1–2 分。如果没有，计划需要更长时间——推迟考试。
      </>
    ),
    week4Day2829Title: "第 28–29 天 — 最终校准",
    week4Day2829Body: (
      <>
        只做轻度复习。不学新内容。回看错题本，确认之前的难题现在都掌握了。重做 3–5 道写作任务保持手感。
      </>
    ),
    week4Day30Title: "第 30 天 — 休息",
    week4Day30Body: (
      <>
        不学习。确认考试当天的物流（参见
        <Link href="/guide/tcf-canada-exam-day">
          考试当天完整指南
        </Link>
        ）。整理好证件。早点睡。相信过去 29 天的努力。
      </>
    ),
    h2help: "HiTCF 如何支持这个 30 天计划",
    helpIntro: (
      <>
        HiTCF 就是为这种结构化备考打造的平台。对 30 天冲刺最关键的功能：
      </>
    ),
    helpList: [
      <>
        <strong>1,306 套真题 / 8,397 道题</strong>覆盖 A1–C2，即使每天做 15–20 套，30 天内题目也不会用完。
      </>,
      <>
        <strong>句子级音频时间戳</strong>——听力任意一句都可以单独回放。第 2 周 CO 集训的关键功能。
      </>,
      <>
        <strong>写作 AI 批改（按 TCF 官方 4 维度细则）</strong>——无限次批改，不用等导师。第 3 周的核心功能。
      </>,
      <>
        <strong>口语 AI 评分（Azure Speech + Grok）</strong>——按 TCF 口语 6 维度（发音、流畅度、语法、词汇、任务完成、语用）打分，对标真考评分细则。
      </>,
      <>
        <strong>错题本 + 间隔重复</strong>——错题自动排队，直到掌握。
      </>,
      <>
        <strong>按 CEFR 等级的 Speed Drill 模式</strong>——按需生成纯 B1 或纯 B2 的练习集。
      </>,
      <>
        <strong>考试模式（真实时长）</strong>——第 1 周和第 4 周的 2–3 次完整模考用。
      </>,
      <>
        <strong>注册即送 7 天 Pro 体验</strong>——正好覆盖第 1 周。如果觉得好用，再订阅后三周。
      </>,
    ],
    cta: "从第 1 周诊断开始 30 天计划 →",
    h2mistakes: "会让计划翻车的常见错误",
    mistake1Title: "错误 1：跳过第 1 周的诊断",
    mistake1Body: (
      <>
        很多考生想跳过诊断直接做题，觉得这样更有效率。诊断花 3 小时，能省 30+ 小时的错位努力。没有诊断，你不知道该优先攻听力还是写作，等发现差距时已经太晚。
      </>
    ),
    mistake2Title: "错误 2：过度关注自己的强项",
    mistake2Body: (
      <>
        TCF Canada 的 CLB 等级取四科中的<em>最低值</em>。如果你阅读 CLB 8 但口语 CLB 5，你报告的 CLB 就是 5。练习时间要花在弱项上，不是强项。这反直觉——强项练起来很有成就感，弱项练起来很难受。
      </>
    ),
    mistake3Title: "错误 3：把口语留到第 4 周再练",
    mistake3Body: (
      <>
        口语是提升最慢的科目。把它留到最后一周的考生普遍表现不佳。正确做法：从第 3 天起每天都花 15–20 分钟练口语。
      </>
    ),
    mistake4Title: "错误 4：只做模考不复盘",
    mistake4Body: (
      <>
        做 15 次模考不复盘等于没学到东西。做 5 次模考每次花 2 小时复盘才能学到一切。考试是测量工具，不是学习本身。
      </>
    ),
    mistake5Title: "错误 5：每天学习超过 3 小时",
    mistake5Body: (
      <>
        超过 3 小时后，记忆保持率急剧下降，疲惫跨天累积。如果你真的有更多时间，请分开：早上 2 小时，晚上 1 小时。单次 4 小时连续学习换不来 4 小时的学习效果。
      </>
    ),
    h2faq: "常见问题",
    faqs: [
      {
        q: "30 天够准备 TCF Canada 吗？",
        a: (
          <>
            取决于起点。对目前 B1（CLB 5-6）冲 CLB 7 或 B2 冲 CLB 8-9 的人来说，30 天是现实的。从 A2 冲 CLB 7 不现实——那需要至少 60-90 天的专注练习。
          </>
        ),
      },
      {
        q: "每天需要几小时？",
        a: (
          <>
            计划每天 1.5–2.5 小时专注练习，30 天共 45–75 小时。每天少于 1 小时几乎不会有可测量的进步。每天超过 3 小时会导致边际收益递减，第 3 周就会倦怠。
          </>
        ),
      },
      {
        q: "一边全职工作一边执行这个计划可行吗？",
        a: (
          <>
            可行——每天 2 小时在 40 小时工作周之外是能做到的，但需要牺牲大部分工作日晚上和两天的周末。如果做不到，把计划延长到 60 天每天 1 小时。
          </>
        ),
      },
      {
        q: "四个科目按什么顺序攻？",
        a: (
          <>
            先 CO 和 CE（第 2 周重点），因为它们对练习反应最快，能建立信心。第 2-3 周加入 EE 配 AI 每日批改。EO 需要贯穿整个 30 天的每日低强度练习——绝对不能留到最后一周。
          </>
        ),
      },
      {
        q: "除了 HiTCF 还要用教材吗？",
        a: (
          <>
            HiTCF 覆盖了所有四科的真实 TCF 题型和 AI 反馈，这是备考的核心。如果你语法基础薄弱，第 1 周可以配一本系统的语法教材，但不是必需。
          </>
        ),
      },
      {
        q: "第 22 天模考没达标怎么办？",
        a: (
          <>
            推迟考试。多等 2-3 周几乎总是比考砸了重考便宜——无论财务上还是 Express Entry 时间线上。多一轮练习好过多考一次。
          </>
        ),
      },
    ],
    footnoteBody: (
      <>
        本学习计划是 HiTCF 基于常见考生画像开发的实用框架，不是 FEI 或 IRCC 的官方推荐。个人效果因人而异。TCF Canada 官方考试形式请参考
        {FEI("France Éducation International")}
        和 HiTCF
        <Link href="/guide/tcf-score-chart">
          TCF 分数对照表
        </Link>
        。加拿大移民语言要求请参考
        {IRCC("IRCC")}
        。
      </>
    ),
  },
  fr: {
    metaTitle:
      "Plan d'étude TCF Canada en 30 jours : de B1 à CLB 7 (2026)",
    metaDescription:
      "Plan d'étude réaliste de 30 jours pour atteindre CLB 7 au TCF Canada. Calendrier jour par jour, jalons hebdomadaires, objectifs par compétence, attentes honnêtes. Mis à jour le " +
      LAST_UPDATED +
      ".",
    h1: "Plan d'étude TCF Canada en 30 jours : de B1 à CLB 7",
    lead: (
      <>
        Trente jours suffisent pour passer du niveau{" "}
        <strong>B1 français (CLB 5-6)</strong> au niveau{" "}
        <strong>B2 français (CLB 7)</strong> au TCF Canada — mais
        seulement avec une pratique quotidienne concentrée et un plan
        équilibrant les quatre compétences. Ce guide donne un
        calendrier hebdomadaire réaliste, des objectifs quotidiens et
        des attentes honnêtes. Ce n&apos;est pas un raccourci. Si vous
        le suivez, vous passerez environ{" "}
        <strong>60 à 70 heures</strong> de pratique concentrée du
        français dans le mois à venir.
      </>
    ),
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdatedBody: (
      <>
        . Le plan ci-dessous suppose que vous êtes déjà au niveau B1
        (environ CLB 5-6), que vous pouvez lire un article de presse
        simple avec quelques recherches de vocabulaire, et que vous
        pouvez tenir une conversation de base de 5 minutes en
        français. Si votre niveau actuel est inférieur, étendez le
        plan à 60-90 jours plutôt que de le compresser à 30.
      </>
    ),
    h2who: "À qui s'adresse ce plan",
    whoList: [
      <>
        <strong>Public cible :</strong> Candidats préparant{" "}
        {IRCC("Entrée express canadienne")} qui ont besoin du niveau
        CLB 7 en français (minimum pour la plupart des profils de
        travailleurs qualifiés fédéraux).
      </>,
      <>
        <strong>Niveau de départ :</strong> B1 (TCF Canada CO/CE
        300-399 points, EE/EO 6-9 points). En cas de doute, faites un
        test diagnostique sur <Link href="/tests">HiTCF</Link> pour
        confirmer.
      </>,
      <>
        <strong>Niveau cible :</strong> B2 (CO/CE 400-499 points, EE/EO
        10-13 points), correspondant à CLB 7-8.
      </>,
      <>
        <strong>Engagement quotidien :</strong> 1,5 à 2,5 heures par
        jour, 6 jours par semaine. Un jour de repos est intégré —
        sauter le jour de repos mène à l&apos;épuisement en semaine 3.
      </>,
    ],
    h2expectations: "Attentes honnêtes",
    expectationsIntro:
      "Avant de vous engager dans ce plan, comprenez ce que 30 jours peuvent et ne peuvent pas faire :",
    expectHeaders: [
      "Réaliste en 30 jours",
      "Non réaliste en 30 jours",
    ],
    expectRows: [
      ["B1 → B2 (CLB 5-6 → CLB 7)", "A2 → B2 (CLB 3 → CLB 7)"],
      [
        "B2 → C1 dans 1-2 compétences, B2 dans les autres",
        "B2 → C1 (CLB 9) dans les 4 compétences",
      ],
      [
        "Amélioration de 50-100 points en lecture et écoute",
        "Saut de 2 bandes CECRL en écriture et oral",
      ],
      [
        "Familiarité avec le format et le rythme de l'examen",
        "Remplacer 2+ années d'exposition linguistique cumulée",
      ],
      [
        "Atteindre CLB 7 si vous êtes limite B1-B2",
        "Atteindre CLB 9+ depuis un départ à froid",
      ],
    ],
    expectClosing: (
      <>
        Si votre niveau de départ est inférieur à B1, la chose la plus
        efficace à faire en 30 jours est de reporter l&apos;examen et
        de continuer à étudier pendant 30 à 60 jours supplémentaires.
        Les reprises coûteuses sont plus pénibles que le report.
      </>
    ),
    h2weekly: "Structure hebdomadaire",
    weeklyHeaders: [
      "Semaine",
      "Focus",
      "Temps quotidien",
      "Résultat principal",
    ],
    weeklyRows: [
      {
        week: "Semaine 1",
        focus: "Diagnostic + vocabulaire + base grammaticale",
        time: "~1,5h",
        output: "Connaître votre compétence la plus faible. 300 nouveaux mots révisés.",
      },
      {
        week: "Semaine 2",
        focus: "CO + CE en priorité",
        time: "~2h",
        output: "Précision CO/CE passant de ~50% à ~70% sur B1.",
      },
      {
        week: "Semaine 3",
        focus: "EE + EO en priorité",
        time: "~2,5h",
        output: "1 rédaction corrigée par jour. 2 sujets oraux par jour.",
      },
      {
        week: "Semaine 4",
        focus: "Examens blancs + révision ciblée + repos",
        time: "~2h",
        output: "2 examens blancs complets chronométrés. Dernière fermeture des lacunes.",
      },
    ],
    h2week1: "Semaine 1 : Diagnostic et fondations",
    week1Goal: (
      <>
        <strong>Objectif :</strong> Établir une référence et construire
        le vocabulaire + la grammaire de base.
      </>
    ),
    week1Day1Title: "Jour 1 — Diagnostic complet",
    week1Day1Body: (
      <>
        Passez un examen complet de 4 compétences sur HiTCF en{" "}
        <strong>mode examen</strong> pour obtenir votre référence.
        N&apos;étudiez pas avant — vous voulez un instantané honnête.
        Les résultats vous montreront quelle section est la plus
        faible. C&apos;est important : les plannings des semaines 2-3
        s&apos;ajustent selon votre compétence la plus faible.
      </>
    ),
    week1Day23Title: "Jours 2-3 — Sprint de vocabulaire",
    week1Day23Body: (
      <>
        Chargez 300-500 mots français B1-B2 fréquents dans le système
        de cartes de vocabulaire de HiTCF. Révisez 60-100 par jour.
        Concentrez-vous sur :
      </>
    ),
    week1Day23List: [
      "Connecteurs (cependant, néanmoins, en revanche, puisque)",
      "Verbes d'opinion (estimer, considérer, prétendre, soutenir)",
      "Noms abstraits pour les essais (conséquence, enjeu, démarche)",
      "Expressions idiomatiques courantes pour l'oral (en effet, à vrai dire, tout de même)",
    ],
    week1Day46Title: "Jours 4-6 — Révision grammaticale",
    week1Day46Body: (
      <>Révisez ces points de grammaire à fort impact (30 min par jour) :</>
    ),
    week1Day46List: [
      <>
        <strong>Subjonctif</strong> (il faut que, bien que, avant que,
        jusqu&apos;à ce que)
      </>,
      <>
        <strong>Conditionnel</strong> (si + imparfait → conditionnel
        présent)
      </>,
      <>
        <strong>Voix passive</strong> et alternatives formelles (on +
        actif, passif réflexif)
      </>,
      <>
        <strong>Pronoms</strong> (y, en, doubles pronoms : le lui, la
        leur)
      </>,
      <>
        <strong>Distinction des temps du passé</strong> (imparfait vs
        passé composé vs plus-que-parfait)
      </>,
    ],
    week1Day7Title: "Jour 7 — Repos",
    week1Day7Body: (
      <>
        N&apos;étudiez pas. Prenez une journée complète de repos.
        Regardez un film français sans sous-titres si vous voulez une
        exposition passive, mais pas d&apos;étude active. Le repos
        n&apos;est pas un luxe — c&apos;est là que se produit la
        consolidation.
      </>
    ),
    h2week2: "Semaine 2 : CO + CE",
    week2Goal: (
      <>
        <strong>Objectif :</strong> Augmenter la précision CO + CE de
        ~50% à ~70% sur les questions B1. Ces deux sections répondent
        le plus rapidement à la pratique et représentent ensemble plus
        de la moitié de votre score global.
      </>
    ),
    week2DailyIntro: "Plan quotidien (2 heures) :",
    dailyHeaders: ["Temps", "Activité"],
    week2Daily: [
      {
        time: "0:00 - 0:15",
        activity:
          "Révision des cartes de vocabulaire (20 cartes, mélange de nouvelles et dues)",
      },
      {
        time: "0:15 - 0:50",
        activity: (
          <>
            3-4 séries d&apos;écoute (CO) en mode entraînement, révision
            complète de chaque mauvaise réponse avec le rejeu audio
            phrase par phrase de HiTCF
          </>
        ),
      },
      {
        time: "0:50 - 1:25",
        activity:
          "3-4 séries de lecture (CE) en mode entraînement, focus sur le balayage des mots-clés avant la lecture complète",
      },
      {
        time: "1:25 - 1:45",
        activity:
          "Révision du carnet de mauvaises réponses — regardez les erreurs d'hier et confirmez que vous les comprenez maintenant",
      },
      {
        time: "1:45 - 2:00",
        activity:
          "Court échauffement oral : 5 minutes à vous parler à vous-même de votre journée en français. Pas de structure, juste de la fluidité.",
      },
    ],
    week2Closing: (
      <>
        À la fin de la semaine 2, la précision CO/CE devrait monter à
        ~70% sur les questions B1 et ~50% sur B2. Sinon, arrêtez
        d&apos;ajouter de nouveaux mots et révisez la grammaire
        fondamentale de la semaine 1.
      </>
    ),
    h2week3: "Semaine 3 : EE + EO",
    week3Goal: (
      <>
        <strong>Objectif :</strong> Écrire et parler suffisamment pour
        construire confiance et fluidité. Les compétences productives
        progressent lentement, mais 21 jours de pratique quotidienne
        cohérente font bouger l&apos;aiguille.
      </>
    ),
    week3DailyIntro: "Plan quotidien (2,5 heures) :",
    week3Daily: [
      {
        time: "0:00 - 0:15",
        activity: "Révision du vocabulaire (continuer le corpus des semaines 1-2)",
      },
      {
        time: "0:15 - 0:45",
        activity:
          "1 série d'écoute + 1 série de lecture pour maintenir les compétences réceptives",
      },
      {
        time: "0:45 - 1:15",
        activity: (
          <>
            <strong>1 tâche complète d&apos;écriture</strong> (alternez
            Tâche 1, 2, 3 sur la semaine) avec rétroaction IA. Lisez
            les corrections attentivement — la rétroaction est plus
            précieuse que le brouillon original.
          </>
        ),
      },
      {
        time: "1:15 - 1:45",
        activity: (
          <>
            <strong>2 sujets oraux</strong> avec notation de
            prononciation. Enregistrez-vous, réécoutez, refaites le
            même sujet si votre première tentative était en dessous de
            60% sur une dimension.
          </>
        ),
      },
      {
        time: "1:45 - 2:15",
        activity:
          "Révision de la rétroaction IA d'écriture des jours précédents — réécrire un paragraphe faiblement noté",
      },
      {
        time: "2:15 - 2:30",
        activity: "Révision du carnet de mauvaises réponses",
      },
    ],
    week3Critical: (
      <>
        <strong>Critique :</strong> Ne sautez pas la pratique orale
        même une seule fois en semaine 3. Deux jours sans pratique
        orale font perdre plus de progrès que deux jours sans pratique
        dans n&apos;importe quelle autre compétence.
      </>
    ),
    h2week4: "Semaine 4 : Examens blancs et ajustement",
    week4Goal: (
      <>
        <strong>Objectif :</strong> Valider votre niveau en conditions
        d&apos;examen réelles et combler les dernières lacunes.
      </>
    ),
    week4Day22Title: "Jour 22 — Examen blanc complet en mode examen",
    week4Day22Body: (
      <>
        Passez un examen blanc TCF Canada complet en temps réel (35
        min CO, 60 min CE, 60 min EE, 12 min EO). Pas de pause plus
        longue que 5 minutes. Ne révisez pas avant la fin. C&apos;est
        une répétition générale.
      </>
    ),
    week4Day2324Title: "Jours 23-24 — Révision approfondie",
    week4Day2324Body: (
      <>
        Révisez chaque mauvaise réponse de l&apos;examen blanc.
        Cherchez des schémas : perdez-vous des points en lecture B2
        par vocabulaire inconnu ou par incompréhension de la question
        ? La réponse détermine quoi étudier dans les jours restants.
      </>
    ),
    week4Day2526Title: "Jours 25-26 — Comblement ciblé des lacunes",
    week4Day2526Body: (
      <>
        Passez ces deux jours sur votre point le plus faible des
        résultats de l&apos;examen blanc. Utilisez le filtre par
        niveau et type de HiTCF pour générer des séries
        d&apos;entraînement ciblées.
      </>
    ),
    week4Day27Title: "Jour 27 — Deuxième examen blanc complet",
    week4Day27Body: (
      <>
        Passez un autre examen blanc complet. Votre score devrait être
        supérieur de 30-60 points en CO/CE et 1-2 points en EE/EO
        comparé au jour 22. Sinon, le plan nécessite plus de temps —
        reportez l&apos;examen.
      </>
    ),
    week4Day2829Title: "Jours 28-29 — Calibrage final",
    week4Day2829Body: (
      <>
        Révision légère uniquement. Pas de nouveau contenu. Retournez
        au carnet de mauvaises réponses, confirmez que toutes les
        questions précédemment difficiles sont maintenant solides.
        Refaites 3-5 tâches d&apos;écriture pour maintenir la mémoire
        musculaire.
      </>
    ),
    week4Day30Title: "Jour 30 — Repos",
    week4Day30Body: (
      <>
        Pas d&apos;étude. Confirmez votre logistique d&apos;examen
        (voir le{" "}
        <Link href="/guide/tcf-canada-exam-day">
          guide du jour d&apos;examen
        </Link>
        ). Préparez vos documents. Couchez-vous tôt. Faites confiance
        aux 29 jours de travail.
      </>
    ),
    h2help: "Comment HiTCF soutient ce plan de 30 jours",
    helpIntro: (
      <>
        HiTCF a été construit spécifiquement pour ce type de
        préparation structurée. Les fonctionnalités les plus
        importantes pour un sprint de 30 jours :
      </>
    ),
    helpList: [
      <>
        <strong>1 306 séries de tests / 8 397 questions</strong> de A1
        à C2 — vous ne manquerez jamais de matériel frais en 30 jours,
        même à 15-20 séries par jour.
      </>,
      <>
        <strong>Horodatages audio phrase par phrase</strong> —
        réécoutez n&apos;importe quelle phrase indépendamment. Crucial
        pour l&apos;entraînement CO de la semaine 2.
      </>,
      <>
        <strong>
          Rétroaction IA d&apos;écriture selon la grille TCF des 4
          critères
        </strong>{" "}
        — brouillons corrigés illimités, pas d&apos;attente pour un
        tuteur. Essentiel pour la semaine 3.
      </>,
      <>
        <strong>
          Évaluation IA de l&apos;oral via Azure Speech + Grok
        </strong>{" "}
        — notation sur 6 dimensions (prononciation, fluidité,
        grammaire, vocabulaire, achèvement de la tâche, adéquation
        sociolinguistique) correspondant à la vraie grille TCF.
      </>,
      <>
        <strong>
          Carnet de mauvaises réponses avec répétition espacée
        </strong>{" "}
        — les erreurs sont automatiquement mises en file
        d&apos;attente pour révision jusqu&apos;à la maîtrise.
      </>,
      <>
        <strong>Mode Speed Drill par niveau CECRL</strong> — générez
        des séries uniquement B1 ou uniquement B2 à la demande pour un
        entraînement ciblé.
      </>,
      <>
        <strong>Mode examen avec temps réel</strong> — pour les 2-3
        examens blancs complets des semaines 1 et 4.
      </>,
      <>
        <strong>Essai Pro gratuit de 7 jours à l&apos;inscription</strong>{" "}
        — couvre entièrement la semaine 1. Abonnez-vous pour les
        semaines 2-4 si le format vous convient.
      </>,
    ],
    cta: "Commencer le plan de 30 jours avec un diagnostic de Semaine 1 →",
    h2mistakes: "Erreurs fréquentes qui font dérailler le plan",
    mistake1Title: "Erreur 1 : Sauter le diagnostic de la semaine 1",
    mistake1Body: (
      <>
        Les candidats veulent souvent sauter directement à
        l&apos;entraînement pour se sentir productifs. Le diagnostic
        prend 3 heures mais économise 30+ heures d&apos;efforts mal
        ciblés. Sans lui, vous ne savez pas s&apos;il faut prioriser
        l&apos;écoute ou l&apos;écriture, et vous découvrez
        l&apos;écart trop tard.
      </>
    ),
    mistake2Title: "Erreur 2 : Se concentrer sur les compétences fortes",
    mistake2Body: (
      <>
        Votre score TCF Canada est le <em>minimum</em> de vos quatre
        niveaux de compétences pour les besoins CLB. Si vous êtes
        CLB 8 en lecture mais CLB 5 en oral, votre CLB rapporté est
        5. Passez du temps sur votre compétence la plus faible, pas
        la plus forte. C&apos;est contre-intuitif — les compétences
        fortes sont gratifiantes à pratiquer, les faibles sont
        inconfortables.
      </>
    ),
    mistake3Title: "Erreur 3 : Laisser l'oral pour la semaine 4",
    mistake3Body: (
      <>
        L&apos;oral est la compétence qui progresse le plus lentement.
        Les candidats qui la laissent pour la dernière semaine
        sous-performent systématiquement. Mieux : 15-20 minutes
        d&apos;oral chaque jour à partir du jour 3.
      </>
    ),
    mistake4Title: "Erreur 4 : Ne faire que des examens blancs sans réviser",
    mistake4Body: (
      <>
        Faire 15 examens blancs sans révision détaillée ne vous
        apprend rien. Faire 5 examens blancs et passer 2 heures à
        réviser chacun vous apprend tout. L&apos;examen est la mesure,
        pas l&apos;apprentissage.
      </>
    ),
    mistake5Title: "Erreur 5 : Étudier plus de 3 heures par jour",
    mistake5Body: (
      <>
        Au-delà de 3 heures, la rétention chute brusquement et
        l&apos;épuisement s&apos;accumule. Si vous avez vraiment plus
        de temps, divisez : 2 heures le matin, 1 heure le soir. Mais
        4 heures d&apos;affilée ne produisent pas 4 heures
        d&apos;apprentissage.
      </>
    ),
    h2faq: "Questions fréquentes",
    faqs: [
      {
        q: "30 jours suffisent-ils pour préparer le TCF Canada ?",
        a: (
          <>
            Cela dépend du niveau de départ. 30 jours est réaliste pour
            quelqu&apos;un actuellement B1 (CLB 5-6) visant CLB 7, ou
            quelqu&apos;un B2 visant CLB 8-9. Il n&apos;est pas
            réaliste de passer de A2 à CLB 7 en 30 jours — cela
            nécessiterait au moins 60-90 jours de pratique concentrée.
          </>
        ),
      },
      {
        q: "Combien d'heures par jour ai-je besoin ?",
        a: (
          <>
            Prévoyez 1,5 à 2,5 heures de pratique concentrée par jour
            sur 30 jours, totalisant 45-75 heures. Moins d&apos;une
            heure par jour est peu susceptible de produire une
            amélioration mesurable. Plus de 3 heures par jour mène à
            des rendements décroissants et à l&apos;épuisement en
            semaine 3.
          </>
        ),
      },
      {
        q: "Puis-je faire ce plan en travaillant à temps plein ?",
        a: (
          <>
            Oui — 2 heures par jour est réalisable en parallèle
            d&apos;une semaine de travail de 40 heures, mais cela
            nécessite d&apos;abandonner la plupart de vos soirées de
            semaine et les deux jours du week-end. Si ce n&apos;est
            pas possible, étendez le plan à 60 jours à 1 heure par
            jour.
          </>
        ),
      },
      {
        q: "Quel est le meilleur ordre pour aborder les quatre compétences ?",
        a: (
          <>
            Commencez par CO et CE (semaine 2 en priorité) car elles
            répondent le plus rapidement à la pratique et donnent
            confiance. Ajoutez EE en semaine 2-3 avec des brouillons
            corrigés par IA quotidiennement. EO nécessite une pratique
            quotidienne de faible intensité tout au long des 30 jours
            — ne la laissez jamais pour la dernière semaine.
          </>
        ),
      },
      {
        q: "Devrais-je aussi utiliser des manuels ou uniquement HiTCF ?",
        a: (
          <>
            HiTCF couvre les quatre compétences avec de vraies
            questions au format TCF et une rétroaction IA, ce qui est
            le cœur de la préparation. Un manuel est utile pour une
            révision grammaticale systématique en semaine 1 si votre
            base grammaticale est fragile, mais pas essentiel.
          </>
        ),
      },
      {
        q: "Que faire si je suis en dessous de l'objectif au jour 22 ?",
        a: (
          <>
            Reportez l&apos;examen. Prolonger de 2-3 semaines est
            presque toujours moins cher que reprendre un examen raté
            — financièrement et en termes de calendrier Entrée
            express. Un tour de pratique supplémentaire vaut mieux
            que deux tours d&apos;examens.
          </>
        ),
      },
    ],
    footnoteBody: (
      <>
        Ce plan d&apos;étude est un cadre pratique développé par HiTCF
        basé sur des profils de candidats courants, pas une
        recommandation officielle de FEI ou IRCC. Les résultats
        individuels varient. Pour le format officiel de
        l&apos;examen TCF Canada, consultez{" "}
        {FEI("France Éducation International")} et le{" "}
        <Link href="/guide/tcf-score-chart">
          Tableau des scores TCF Canada
        </Link>{" "}
        de HiTCF. Pour les exigences linguistiques
        d&apos;immigration canadienne, consultez {IRCC("IRCC")}.
      </>
    ),
  },
  ar: {
    metaTitle: "خطة دراسة TCF Canada لمدة 30 يومًا: من B1 إلى CLB 7 (2026)",
    metaDescription:
      "خطة دراسة واقعية لمدة 30 يومًا للوصول إلى CLB 7 في TCF Canada. جدول يومي، معالم أسبوعية، أهداف خاصة بكل مهارة، وتوقعات صادقة. آخر تحديث " +
      LAST_UPDATED +
      ".",
    h1: "خطة دراسة TCF Canada لمدة 30 يومًا: من B1 إلى CLB 7",
    lead: (
      <>
        ثلاثون يومًا وقت كافٍ للانتقال من{" "}
        <strong>الفرنسية B1 (CLB 5-6)</strong> إلى{" "}
        <strong>الفرنسية B2 (CLB 7)</strong> في TCF Canada — ولكن فقط مع ممارسة يومية مركزة وخطة توازن بين المهارات الأربع. يقدم هذا الدليل جدولًا أسبوعيًا واقعيًا، وأهدافًا يومية، وتوقعات صادقة. ليس هذا اختصارًا. إذا اتبعته، ستقضي حوالي
        <strong>60 إلى 70 ساعة</strong> من الممارسة المركزة للفرنسية في الشهر المقبل.
      </>
    ),
    lastUpdatedLabel: "آخر تحديث",
    lastUpdatedBody: (
      <>
        . تفترض الخطة أدناه أنك بالفعل في مستوى B1 (تقريبًا CLB 5-6)، ويمكنك قراءة مقال إخباري بسيط مع بعض عمليات البحث في القاموس، وإجراء محادثة أساسية لمدة 5 دقائق بالفرنسية. إذا كان مستواك الحالي أقل، مدد الخطة إلى 60-90 يومًا بدلاً من ضغطها في 30.
      </>
    ),
    h2who: "لمن هذه الخطة",
    whoList: [
      <>
        <strong>الجمهور المستهدف:</strong> المرشحون الذين يستعدون لـ{" "}
        {IRCC("Express Entry الكندية")} ويحتاجون CLB 7 بالفرنسية (الحد الأدنى لمعظم ملفات العمال المهرة الفيدراليين).
      </>,
      <>
        <strong>مستوى البداية:</strong> B1 (TCF Canada CO/CE 300-399 نقطة، EE/EO 6-9 نقاط). إذا لم تكن متأكدًا، خذ مجموعة تشخيصية على
        <Link href="/tests">HiTCF</Link> للتأكيد.
      </>,
      <>
        <strong>المستوى المستهدف:</strong> B2 (CO/CE 400-499 نقطة، EE/EO 10-13 نقطة)، مقابل CLB 7-8.
      </>,
      <>
        <strong>الالتزام اليومي:</strong> 1.5 إلى 2.5 ساعة يوميًا، 6 أيام في الأسبوع. تم تضمين يوم راحة واحد — تخطيه يؤدي إلى الإرهاق في الأسبوع الثالث.
      </>,
    ],
    h2expectations: "توقعات صادقة",
    expectationsIntro: "قبل الالتزام بهذه الخطة، افهم ما يمكن وما لا يمكن لـ 30 يومًا تحقيقه:",
    expectHeaders: [
      "واقعي في 30 يومًا",
      "غير واقعي في 30 يومًا",
    ],
    expectRows: [
      ["B1 → B2 (CLB 5-6 → CLB 7)", "A2 → B2 (CLB 3 → CLB 7)"],
      [
        "B2 → C1 في مهارة أو مهارتين، B2 في البقية",
        "B2 → C1 (CLB 9) في جميع المهارات الأربع",
      ],
      [
        "تحسن 50-100 نقطة في القراءة والاستماع",
        "قفز مهارتي الكتابة والتحدث درجتين من CEFR",
      ],
      [
        "الإلمام بصيغة الاختبار وإيقاعه",
        "استبدال أكثر من سنتين من التعرض اللغوي التراكمي",
      ],
      [
        "الوصول إلى CLB 7 إذا كنت على حدود B1-B2",
        "الوصول إلى CLB 9+ من بداية باردة",
      ],
    ],
    expectClosing: (
      <>
        إذا كان مستوى البداية لديك أقل من B1، فإن أكثر شيء فعال يمكنك فعله في 30 يومًا هو تأجيل الاختبار ومواصلة الدراسة لمدة 30-60 يومًا أخرى. إعادة الاختبارات المكلفة أكثر إيلامًا من التأجيل.
      </>
    ),
    h2weekly: "الهيكل الأسبوعي",
    weeklyHeaders: [
      "الأسبوع",
      "التركيز",
      "الوقت اليومي",
      "المخرج الرئيسي",
    ],
    weeklyRows: [
      {
        week: "الأسبوع 1",
        focus: "تشخيص + مفردات + أساس قواعدي",
        time: "~1.5 ساعة",
        output: "معرفة أضعف مهاراتك. مراجعة 300 كلمة جديدة.",
      },
      {
        week: "الأسبوع 2",
        focus: "تركيز مكثف على CO + CE",
        time: "~2 ساعة",
        output: "دقة CO/CE ترتفع من ~50٪ إلى ~70٪ على B1.",
      },
      {
        week: "الأسبوع 3",
        focus: "تركيز مكثف على EE + EO",
        time: "~2.5 ساعة",
        output: "مهمة كتابية مصححة واحدة يوميًا. موضوعان شفويان يوميًا.",
      },
      {
        week: "الأسبوع 4",
        focus: "اختبارات تجريبية + مراجعة مستهدفة + راحة قبل الاختبار",
        time: "~2 ساعة",
        output: "اختباران تجريبيان كاملان. إغلاق الفجوات النهائية.",
      },
    ],
    h2week1: "الأسبوع 1: التشخيص والأساسات",
    week1Goal: (
      <>
        <strong>الهدف:</strong> إنشاء خط أساس وبناء المفردات + القواعد الأساسية.
      </>
    ),
    week1Day1Title: "اليوم 1 — تشخيص كامل",
    week1Day1Body: (
      <>
        خذ امتحانًا كاملاً للمهارات الأربع على HiTCF في
        <strong>وضع الاختبار</strong> للحصول على خط الأساس. لا تدرس قبل هذا — تريد لقطة صادقة. ستظهر النتائج القسم الأضعف لديك. هذا مهم: جداول الأسبوع 2-3 تتغير بناءً على أضعف مهاراتك.
      </>
    ),
    week1Day23Title: "اليوم 2-3 — سباق المفردات",
    week1Day23Body: (
      <>
        قم بتحميل 300-500 كلمة فرنسية B1-B2 عالية التردد في نظام بطاقات المفردات في HiTCF. راجع 60-100 يوميًا. ركز على:
      </>
    ),
    week1Day23List: [
      "أدوات الربط (cependant، néanmoins، en revanche، puisque)",
      "أفعال الرأي (estimer، considérer، prétendre، soutenir)",
      "الأسماء المجردة للمقالات (conséquence، enjeu، démarche)",
      "التعابير الشائعة للتحدث (en effet، à vrai dire، tout de même)",
    ],
    week1Day46Title: "اليوم 4-6 — مراجعة القواعد",
    week1Day46Body: (
      <>راجع نقاط القواعد عالية التأثير (30 دقيقة يوميًا):</>
    ),
    week1Day46List: [
      <>
        <strong>Subjonctif</strong> (il faut que، bien que، avant que، jusqu&apos;à ce que)
      </>,
      <>
        <strong>Conditionnel</strong> (si + imparfait → conditionnel présent)
      </>,
      <>
        <strong>صيغة المبني للمجهول</strong> والبدائل الرسمية (on + نشط، passif réflexif)
      </>,
      <>
        <strong>الضمائر</strong> (y، en، الضمائر المزدوجة: le lui، la leur)
      </>,
      <>
        <strong>تمييز أزمنة الماضي</strong> (imparfait vs passé composé vs plus-que-parfait)
      </>,
    ],
    week1Day7Title: "اليوم 7 — راحة",
    week1Day7Body: (
      <>
        لا تدرس. خذ يوم راحة كامل. شاهد فيلمًا فرنسيًا بدون ترجمة إذا كنت تريد تعرضًا سلبيًا، ولكن لا دراسة نشطة. الراحة ليست ترفًا — هي حين يحدث التوحيد.
      </>
    ),
    h2week2: "الأسبوع 2: CO + CE",
    week2Goal: (
      <>
        <strong>الهدف:</strong> رفع دقة CO + CE من ~50٪ إلى ~70٪ على أسئلة B1. هذان القسمان يستجيبان للممارسة بأسرع ما يمكن وتشكلان معًا أكثر من نصف درجتك الإجمالية.
      </>
    ),
    week2DailyIntro: "الخطة اليومية (ساعتان):",
    dailyHeaders: ["الوقت", "النشاط"],
    week2Daily: [
      {
        time: "0:00 - 0:15",
        activity: "مراجعة بطاقات المفردات (20 بطاقة، مزيج من الجديدة والمستحقة)",
      },
      {
        time: "0:15 - 0:50",
        activity: (
          <>
            3-4 مجموعات استماع (CO) في وضع التدريب، مراجعة كاملة لكل إجابة خاطئة باستخدام إعادة تشغيل الصوت على مستوى الجملة في HiTCF
          </>
        ),
      },
      {
        time: "0:50 - 1:25",
        activity: "3-4 مجموعات قراءة (CE) في وضع التدريب، ركز على المسح السريع للكلمات الرئيسية قبل قراءة الفقرات الكاملة",
      },
      {
        time: "1:25 - 1:45",
        activity: "مراجعة دفتر الإجابات الخاطئة — انظر إلى أخطاء الأمس وتأكد من أنك فهمتها الآن",
      },
      {
        time: "1:45 - 2:00",
        activity: "إحماء شفوي قصير: 5 دقائق تتحدث فيها لنفسك عن يومك بالفرنسية. لا هيكل، فقط الطلاقة.",
      },
    ],
    week2Closing: (
      <>
        بحلول نهاية الأسبوع الثاني، يجب أن ترى دقة تدريب CO/CE ترتفع إلى ~70٪ على أسئلة B1 و ~50٪ على B2. إذا لم تفعل، توقف عن إضافة مفردات جديدة وراجع القواعد الأساسية من الأسبوع 1.
      </>
    ),
    h2week3: "الأسبوع 3: EE + EO",
    week3Goal: (
      <>
        <strong>الهدف:</strong> الكتابة والتحدث بما يكفي لبناء الثقة والطلاقة. المهارات الإنتاجية تتحسن ببطء، ولكن 21 يومًا من الممارسة اليومية المتسقة تحرك المؤشر.
      </>
    ),
    week3DailyIntro: "الخطة اليومية (2.5 ساعة):",
    week3Daily: [
      {
        time: "0:00 - 0:15",
        activity: "مراجعة المفردات (مواصلة مجموعة الأسبوع 1-2)",
      },
      {
        time: "0:15 - 0:45",
        activity: "مجموعة استماع واحدة + مجموعة قراءة واحدة للحفاظ على المهارات المستقبلة",
      },
      {
        time: "0:45 - 1:15",
        activity: (
          <>
            <strong>مهمة كتابية كاملة واحدة</strong> (بالتناوب بين Tâche 1 و 2 و 3 عبر الأسبوع) مع ملاحظات AI. اقرأ التصحيحات بعناية — الملاحظات أكثر قيمة من المسودة الأصلية.
          </>
        ),
      },
      {
        time: "1:15 - 1:45",
        activity: (
          <>
            <strong>موضوعان شفويان</strong> مع تقييم النطق. سجل نفسك، استمع مرة أخرى، أعد تسجيل نفس الموضوع إذا كانت محاولتك الأولى أقل من 60٪ في أي بعد.
          </>
        ),
      },
      {
        time: "1:45 - 2:15",
        activity: "مراجعة ملاحظات AI للكتابة من الأيام السابقة — أعد كتابة فقرة سجلت درجة ضعيفة",
      },
      {
        time: "2:15 - 2:30",
        activity: "مراجعة دفتر الإجابات الخاطئة",
      },
    ],
    week3Critical: (
      <>
        <strong>حاسم:</strong> لا تتخطَ ممارسة التحدث حتى ولو مرة واحدة في الأسبوع الثالث. يومان بدون ممارسة التحدث يفقدان تقدمًا أكثر من يومين بدون ممارسة في أي مهارة أخرى.
      </>
    ),
    h2week4: "الأسبوع 4: الاختبارات التجريبية والتحسين",
    week4Goal: (
      <>
        <strong>الهدف:</strong> التحقق من مستواك في ظروف الاختبار الحقيقية وسد الفجوات المتبقية.
      </>
    ),
    week4Day22Title: "اليوم 22 — اختبار تجريبي كامل في وضع الاختبار",
    week4Day22Body: (
      <>
        خذ اختبارًا تجريبيًا كاملاً لـ TCF Canada تحت التوقيت الحقيقي (35 دقيقة CO، 60 دقيقة CE، 60 دقيقة EE، 12 دقيقة EO). لا توجد فترات راحة أطول من 5 دقائق. لا تراجع حتى النهاية. هذا بروفة كاملة.
      </>
    ),
    week4Day2324Title: "اليوم 23-24 — مراجعة عميقة",
    week4Day2324Body: (
      <>
        راجع كل إجابة خاطئة من الاختبار التجريبي. ابحث عن الأنماط: هل تخسر نقاطًا في قراءة B2 بسبب مفردات غير معروفة، أم بسبب فهم الأسئلة؟ الإجابة تحدد ما يجب دراسته في الأيام المتبقية.
      </>
    ),
    week4Day2526Title: "اليوم 25-26 — ملء الفجوات المستهدف",
    week4Day2526Body: (
      <>
        اقضِ هذين اليومين على أضعف منطقة لديك من نتائج الاختبار التجريبي. استخدم فلتر HiTCF حسب المستوى والنوع لإنشاء مجموعات تدريب مستهدفة.
      </>
    ),
    week4Day27Title: "اليوم 27 — اختبار تجريبي كامل ثانٍ",
    week4Day27Body: (
      <>
        خذ اختبارًا تجريبيًا كاملاً آخر. يجب أن تكون درجتك أعلى بـ 30-60 نقطة في CO/CE وبـ 1-2 نقطة في EE/EO مقارنة باليوم 22. إذا لم تكن، الخطة تحتاج إلى مزيد من الوقت — أجل الاختبار.
      </>
    ),
    week4Day2829Title: "اليوم 28-29 — المعايرة النهائية",
    week4Day2829Body: (
      <>
        مراجعة خفيفة فقط. لا مواد جديدة. ارجع إلى دفتر الإجابات الخاطئة، تأكد من أن جميع الأسئلة الصعبة سابقًا أصبحت الآن صلبة. أعد عمل 3-5 مهام كتابية للحفاظ على الذاكرة العضلية.
      </>
    ),
    week4Day30Title: "اليوم 30 — راحة",
    week4Day30Body: (
      <>
        لا دراسة. تأكد من لوجستيات الاختبار (انظر
        <Link href="/guide/tcf-canada-exam-day">
          دليل يوم الاختبار
        </Link>
        ). احزم مستنداتك. نم مبكرًا. ثق بعمل الـ 29 يومًا.
      </>
    ),
    h2help: "كيف تدعم HiTCF خطة 30 يومًا هذه",
    helpIntro: (
      <>
        تم بناء HiTCF خصيصًا لهذا النوع من التحضير المنظم. الميزات الأكثر أهمية لسباق 30 يومًا:
      </>
    ),
    helpList: [
      <>
        <strong>1,306 مجموعة اختبار / 8,397 سؤالاً</strong> من A1 إلى C2 — لن تنفد المواد الجديدة في أي وقت خلال 30 يومًا، حتى بمعدل 15-20 مجموعة يوميًا.
      </>,
      <>
        <strong>توقيتات صوتية على مستوى الجملة</strong> — أعد تشغيل أي جملة من أي فقرة استماع بشكل مستقل. حاسم لتدريب CO في الأسبوع 2.
      </>,
      <>
        <strong>ملاحظات AI للكتابة على معايير TCF الأربعة</strong> — مسودات مصححة غير محدودة، لا انتظار لمعلم. ضروري للأسبوع 3.
      </>,
      <>
        <strong>تقييم AI للتحدث عبر Azure Speech + Grok</strong> — تقييم 6 أبعاد (النطق، الطلاقة، القواعد، المفردات، إنجاز المهمة، الملاءمة الاجتماعية اللغوية) مطابق لمعايير TCF الحقيقية.
      </>,
      <>
        <strong>دفتر الإجابات الخاطئة مع التكرار المتباعد</strong> — تُدرج الأخطاء تلقائيًا للمراجعة حتى الإتقان.
      </>,
      <>
        <strong>وضع Speed Drill حسب مستوى CEFR</strong> — أنشئ مجموعات B1 فقط أو B2 فقط عند الطلب للتدريب المستهدف.
      </>,
      <>
        <strong>وضع الاختبار بالتوقيت الحقيقي</strong> — للاختبارات التجريبية الكاملة 2-3 في الأسبوعين 1 و 4.
      </>,
      <>
        <strong>نسخة Pro تجريبية مجانية لمدة 7 أيام عند التسجيل</strong> — تغطي الأسبوع 1 بالكامل. اشترك للأسابيع 2-4 إذا كان التنسيق يناسبك.
      </>,
    ],
    cta: "ابدأ خطة الـ 30 يومًا بتشخيص الأسبوع 1 ←",
    h2mistakes: "الأخطاء الشائعة التي تعطل الخطة",
    mistake1Title: "الخطأ 1: تخطي تشخيص الأسبوع 1",
    mistake1Body: (
      <>
        غالبًا ما يرغب المرشحون في القفز مباشرة إلى الممارسة ليشعروا بالإنتاجية. التشخيص يستغرق 3 ساعات ولكنه يوفر 30+ ساعة من الجهد المستهدف بشكل خاطئ. بدونه، لا تعرف ما إذا كنت ستحدد الأولوية للاستماع أم للكتابة، وستكتشف الفجوة بعد فوات الأوان.
      </>
    ),
    mistake2Title: "الخطأ 2: التركيز المفرط على المهارات القوية",
    mistake2Body: (
      <>
        درجة TCF Canada الخاصة بك هي <em>الحد الأدنى</em> من مستويات مهاراتك الأربع لأغراض CLB. إذا كنت CLB 8 في القراءة ولكن CLB 5 في التحدث، فإن CLB المُبلَّغ عنه هو 5. اقضِ الوقت على أضعف مهاراتك، وليس الأقوى. هذا عكس الحدس — المهارات القوية تبدو مُجزية للممارسة، الضعيفة تبدو غير مريحة.
      </>
    ),
    mistake3Title: "الخطأ 3: ترك التحدث للأسبوع 4",
    mistake3Body: (
      <>
        التحدث هو أبطأ المهارات تحسنًا. المرشحون الذين يتركونه للأسبوع الأخير يؤدون باستمرار دون المستوى. أفضل: 15-20 دقيقة من التحدث كل يوم ابتداءً من اليوم 3.
      </>
    ),
    mistake4Title: "الخطأ 4: إجراء اختبارات تجريبية فقط دون مراجعة",
    mistake4Body: (
      <>
        إجراء 15 اختبارًا تجريبيًا دون مراجعة مفصلة لا يعلمك شيئًا. إجراء 5 اختبارات تجريبية وقضاء ساعتين في مراجعة كل منها يعلمك كل شيء. الاختبار هو القياس، وليس التعلم.
      </>
    ),
    mistake5Title: "الخطأ 5: الدراسة لأكثر من 3 ساعات يوميًا",
    mistake5Body: (
      <>
        بعد 3 ساعات، ينخفض الاحتفاظ بشكل حاد ويتراكم الإرهاق عبر الأيام. إذا كان لديك حقًا المزيد من الوقت، قسمه: ساعتان في الصباح، ساعة في المساء. لكن 4 ساعات في كتلة واحدة لا تنتج 4 ساعات من التعلم.
      </>
    ),
    h2faq: "الأسئلة الشائعة",
    faqs: [
      {
        q: "هل 30 يومًا كافية للتحضير لـ TCF Canada؟",
        a: (
          <>
            يعتمد على مستوى البداية. 30 يومًا واقعي لشخص حاليًا في B1 (CLB 5-6) يستهدف CLB 7، أو شخص في B2 يستهدف CLB 8-9. ليس من الواقعي الانتقال من A2 إلى CLB 7 في 30 يومًا — ستحتاج إلى 60-90 يومًا على الأقل من الممارسة المركزة لتلك القفزة.
          </>
        ),
      },
      {
        q: "كم ساعة في اليوم أحتاج؟",
        a: (
          <>
            خطط لـ 1.5 إلى 2.5 ساعة من الممارسة المركزة في اليوم على مدار 30 يومًا، بإجمالي 45-75 ساعة. أقل من ساعة واحدة في اليوم من غير المرجح أن ينتج تحسنًا قابلًا للقياس. أكثر من 3 ساعات في اليوم يؤدي إلى عوائد متناقصة وإرهاق بحلول الأسبوع 3.
          </>
        ),
      },
      {
        q: "هل يمكنني تنفيذ هذه الخطة أثناء العمل بدوام كامل؟",
        a: (
          <>
            نعم — 2 ساعة يوميًا قابل للتحقيق جنبًا إلى جنب مع أسبوع عمل 40 ساعة، لكنه يتطلب التخلي عن معظم أمسيات أيام الأسبوع وكلا يومي عطلة نهاية الأسبوع. إذا لم يكن ذلك ممكنًا، مدد الخطة إلى 60 يومًا بساعة واحدة في اليوم بدلاً من ذلك.
          </>
        ),
      },
      {
        q: "ما هو أفضل ترتيب لمعالجة المهارات الأربع؟",
        a: (
          <>
            ابدأ بـ CO و CE (الأسبوع 2 مكثف) لأنهما يستجيبان بأسرع ما يمكن للممارسة ويمنحان الثقة. أضف EE في الأسبوع 2-3 مع مسودات مصححة بواسطة AI يوميًا. EO يحتاج إلى ممارسة يومية منخفضة الكثافة طوال الـ 30 يومًا — لا تتركه أبدًا للأسبوع الأخير.
          </>
        ),
      },
      {
        q: "هل يجب أن أستخدم الكتب المدرسية أيضًا أم HiTCF فقط؟",
        a: (
          <>
            يغطي HiTCF جميع المهارات الأربع بأسئلة تنسيق TCF حقيقية وملاحظات AI، وهو جوهر التحضير للاختبار. الكتاب المدرسي مفيد لمراجعة القواعد المنهجية في الأسبوع 1 إذا كان أساس القواعد الخاص بك متزعزعًا، ولكنه ليس ضروريًا.
          </>
        ),
      },
      {
        q: "ماذا لو سجلت أقل من الهدف في اختبار اليوم 22؟",
        a: (
          <>
            أجل الاختبار. التمديد لمدة 2-3 أسابيع دائمًا تقريبًا أرخص من إعادة اختبار فاشل — ماليًا ومن حيث الجدول الزمني لـ Express Entry. جولة تدريب إضافية أفضل من جولتي اختبارات.
          </>
        ),
      },
    ],
    footnoteBody: (
      <>
        خطة الدراسة هذه إطار عملي طورته HiTCF بناءً على ملفات المرشحين الشائعة، وليست توصية رسمية من FEI أو IRCC. تختلف النتائج الفردية. للحصول على صيغة اختبار TCF Canada الرسمية، انظر
        {FEI("France Éducation International")}
        و{" "}
        <Link href="/guide/tcf-score-chart">
          جدول درجات TCF Canada
        </Link>
        {" "}من HiTCF. لمتطلبات اللغة للهجرة الكندية، انظر
        {IRCC("IRCC")}
        .
      </>
    ),
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale) in CONTENT ? (locale as Locale) : "en"];
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: [
      "TCF Canada 30 day study plan",
      "TCF Canada preparation schedule",
      "TCF Canada CLB 7 in 30 days",
      "TCF Canada daily practice plan",
      "TCF Canada one month plan",
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
      title: c.metaTitle,
      description: c.metaDescription,
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
  const c = CONTENT[(locale as Locale) in CONTENT ? (locale as Locale) : "en"];
  const pageUrl = `${SITE_URL}/${locale}/guide/tcf-canada-study-plan-30-days`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LearningResource", "HowTo", "Article"],
        "@id": `${pageUrl}#howto`,
        name: c.metaTitle,
        description: c.metaDescription,
        url: pageUrl,
        datePublished: LAST_UPDATED,
        dateModified: LAST_UPDATED,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: locale,
        learningResourceType: "study plan",
        totalTime: "P30D",
        educationalLevel: "B1 to B2 CEFR (CLB 5-7)",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: c.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>{c.h1}</h1>
      <p className="lead">{c.lead}</p>
      <p>
        {c.lastUpdatedLabel}: <strong>{LAST_UPDATED}</strong>
        {c.lastUpdatedBody}
      </p>

      <h2>{c.h2who}</h2>
      <ul>
        {c.whoList.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{c.h2expectations}</h2>
      <p>{c.expectationsIntro}</p>
      <table>
        <thead>
          <tr>
            {c.expectHeaders.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.expectRows.map((row, i) => (
            <tr key={i}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{c.expectClosing}</p>

      <h2>{c.h2weekly}</h2>
      <table>
        <thead>
          <tr>
            {c.weeklyHeaders.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.weeklyRows.map((row, i) => (
            <tr key={i}>
              <td><strong>{row.week}</strong></td>
              <td>{row.focus}</td>
              <td>{row.time}</td>
              <td>{row.output}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{c.h2week1}</h2>
      <p>{c.week1Goal}</p>

      <h3>{c.week1Day1Title}</h3>
      <p>{c.week1Day1Body}</p>

      <h3>{c.week1Day23Title}</h3>
      <p>{c.week1Day23Body}</p>
      <ul>
        {c.week1Day23List.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h3>{c.week1Day46Title}</h3>
      <p>{c.week1Day46Body}</p>
      <ul>
        {c.week1Day46List.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h3>{c.week1Day7Title}</h3>
      <p>{c.week1Day7Body}</p>

      <h2>{c.h2week2}</h2>
      <p>{c.week2Goal}</p>
      <p>{c.week2DailyIntro}</p>
      <table>
        <thead>
          <tr>
            {c.dailyHeaders.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.week2Daily.map((row, i) => (
            <tr key={i}>
              <td>{row.time}</td>
              <td>{row.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{c.week2Closing}</p>

      <h2>{c.h2week3}</h2>
      <p>{c.week3Goal}</p>
      <p>{c.week3DailyIntro}</p>
      <table>
        <thead>
          <tr>
            {c.dailyHeaders.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.week3Daily.map((row, i) => (
            <tr key={i}>
              <td>{row.time}</td>
              <td>{row.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{c.week3Critical}</p>

      <h2>{c.h2week4}</h2>
      <p>{c.week4Goal}</p>

      <h3>{c.week4Day22Title}</h3>
      <p>{c.week4Day22Body}</p>

      <h3>{c.week4Day2324Title}</h3>
      <p>{c.week4Day2324Body}</p>

      <h3>{c.week4Day2526Title}</h3>
      <p>{c.week4Day2526Body}</p>

      <h3>{c.week4Day27Title}</h3>
      <p>{c.week4Day27Body}</p>

      <h3>{c.week4Day2829Title}</h3>
      <p>{c.week4Day2829Body}</p>

      <h3>{c.week4Day30Title}</h3>
      <p>{c.week4Day30Body}</p>

      <h2>{c.h2help}</h2>
      <p>{c.helpIntro}</p>
      <ul>
        {c.helpList.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <p>
        <Link
          href="/tests"
          className="inline-block rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground no-underline"
        >
          {c.cta}
        </Link>
      </p>

      <h2>{c.h2mistakes}</h2>

      <h3>{c.mistake1Title}</h3>
      <p>{c.mistake1Body}</p>

      <h3>{c.mistake2Title}</h3>
      <p>{c.mistake2Body}</p>

      <h3>{c.mistake3Title}</h3>
      <p>{c.mistake3Body}</p>

      <h3>{c.mistake4Title}</h3>
      <p>{c.mistake4Body}</p>

      <h3>{c.mistake5Title}</h3>
      <p>{c.mistake5Body}</p>

      <h2>{c.h2faq}</h2>
      {c.faqs.map((f, i) => (
        <div key={i}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <hr />

      <p className="text-sm text-muted-foreground">{c.footnoteBody}</p>
    </>
  );
}
