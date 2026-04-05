import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

const SITE_URL = "https://hitcf.com";
const LAST_UPDATED = "2026-04-05";

type Locale = "en" | "zh" | "fr" | "ar";

const FEI_URL = "https://www.france-education-international.fr/test/tcf-canada";
const CCIP_URL =
  "https://www.lefrancaisdesaffaires.fr/tests-diplomes/tef-test-evaluation-de-francais/tef-canada/";
const IRCC_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof/test-results-meet-level.html";
const IRCC_ROOT =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof.html";

const FEI = (label: string) => (
  <a href={FEI_URL} target="_blank" rel="noopener">
    {label}
  </a>
);
const CCIP = (label: string) => (
  <a href={CCIP_URL} target="_blank" rel="noopener">
    {label}
  </a>
);
const IRCC = (label: string, url: string = IRCC_URL) => (
  <a href={url} target="_blank" rel="noopener">
    {label}
  </a>
);

interface Content {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: React.ReactNode;
  lastUpdatedLabel: string;
  lastUpdatedBody: React.ReactNode;
  h2quick: string;
  quickHeaders: [string, string, string];
  quickRows: {
    fullName: string;
    administered: string;
    recognition: string;
    sections: string;
    format: string;
    coScoring: string;
    ceScoring: string;
    eeScoring: string;
    eoScoring: string;
    duration: string;
    validity: string;
    cost: string;
    centres: string;
    turnaround: string;
  };
  quickValues: {
    tcfName: React.ReactNode;
    tefName: React.ReactNode;
    tcfAdmin: React.ReactNode;
    tefAdmin: React.ReactNode;
    tcfRecognition: string;
    tefRecognition: string;
    sections: string;
    tcfFormat: string;
    tefFormat: string;
    tcfCoScoring: string;
    tefCoScoring: string;
    tcfCeScoring: string;
    tefCeScoring: string;
    tcfEeScoring: string;
    tefEeScoring: string;
    tcfEoScoring: string;
    tefEoScoring: string;
    tcfDuration: string;
    tefDuration: string;
    validity: string;
    cost: string;
    tcfCentres: string;
    tefCentres: string;
    turnaround: string;
  };
  h2tcfScoring: string;
  tcfScoringIntro: React.ReactNode;
  clbTableHeaders: [string, string, string, string, string];
  tcfChartLinkText: React.ReactNode;
  h2tefScoring: string;
  tefScoringIntro: string;
  tefClbTableHeaders: [string, string, string, string, string];
  allFourNote: React.ReactNode;
  h2format: string;
  tcfFormatTitle: string;
  tcfFormatList: string[];
  tefFormatTitle: string;
  tefFormatList: string[];
  h2choose: string;
  chooseIntro: React.ReactNode;
  chooseList: React.ReactNode[];
  chooseClosing: React.ReactNode;
  h2help: string;
  helpBody1: React.ReactNode;
  helpBody2: React.ReactNode;
  cta: string;
  h2faq: string;
  faqs: { q: string; a: React.ReactNode }[];
  sourcesLabel: string;
  sourcesBody: React.ReactNode;
}

const CONTENT: Record<Locale, Content> = {
  en: {
    metaTitle: "TCF Canada vs TEF Canada: Which Exam Should You Take? (2026)",
    metaDescription:
      "Side-by-side comparison of TCF Canada and TEF Canada for Canadian PR, Express Entry, and QSW. Covers scoring, format, cost, availability, and how each maps to CLB/NCLC levels. Last updated " +
      LAST_UPDATED +
      ".",
    h1: "TCF Canada vs TEF Canada: Which Exam Should You Take?",
    lead: (
      <>
        Both <strong>TCF Canada</strong> and <strong>TEF Canada</strong>{" "}
        are recognized by {IRCC("Immigration, Refugees and Citizenship Canada (IRCC)")}{" "}
        as proof of French proficiency for permanent residence, Express
        Entry, and citizenship applications. They are administered by
        different organizations, use different scoring scales, and are
        offered at different centres — but IRCC maps both to the same
        CLB/NCLC 1–12 benchmarks. This guide compares them side-by-side
        so you can decide which one fits your situation.
      </>
    ),
    lastUpdatedLabel: "Last updated",
    lastUpdatedBody: (
      <>
        . All scoring thresholds below are from the current IRCC
        conversion tables. Always verify with{" "}
        {IRCC("canada.ca", IRCC_ROOT)} before booking your test or
        submitting an application.
      </>
    ),
    h2quick: "Quick comparison at a glance",
    quickHeaders: ["Feature", "TCF Canada", "TEF Canada"],
    quickRows: {
      fullName: "Full name",
      administered: "Administered by",
      recognition: "IRCC recognition",
      sections: "Sections",
      format: "Format style",
      coScoring: "CO scoring",
      ceScoring: "CE scoring",
      eeScoring: "EE scoring",
      eoScoring: "EO scoring",
      duration: "Total test duration",
      validity: "Result validity",
      cost: "Typical cost in Canada",
      centres: "Typical centre types",
      turnaround: "Result turnaround",
    },
    quickValues: {
      tcfName: <em>Test de connaissance du français pour le Canada</em>,
      tefName: <em>Test d&apos;évaluation de français pour le Canada</em>,
      tcfAdmin: FEI("France Éducation International (FEI)"),
      tefAdmin: CCIP("CCI Paris Île-de-France"),
      tcfRecognition: "Yes — all programs",
      tefRecognition: "Yes — all programs",
      sections: "CO, CE, EE, EO (all mandatory)",
      tcfFormat: "Mostly multiple choice (CO, CE)",
      tefFormat: "Multiple choice + varied task types",
      tcfCoScoring: "100–699 points",
      tefCoScoring: "0–360 points",
      tcfCeScoring: "100–699 points",
      tefCeScoring: "0–300 points",
      tcfEeScoring: "0–20 points",
      tefEeScoring: "0–450 points",
      tcfEoScoring: "0–20 points",
      tefEoScoring: "0–450 points",
      tcfDuration: "~2h 47min",
      tefDuration: "~3h 10min",
      validity: "2 years",
      cost: "CAD 350–450",
      tcfCentres: "Alliance Française, authorized AEC centres",
      tefCentres: "Alliance Française, authorized CCIP centres",
      turnaround: "4–6 weeks",
    },
    h2tcfScoring: "Scoring: TCF Canada → CLB / NCLC",
    tcfScoringIntro: (
      <>
        TCF Canada uses a 100–699 scale for listening (CO) and reading
        (CE), and a 0–20 scale for writing (EE) and speaking (EO). The
        official IRCC conversion to CLB/NCLC is:
      </>
    ),
    clbTableHeaders: ["CLB / NCLC", "CE", "CO", "EE", "EO"],
    tcfChartLinkText: (
      <>
        For the full TCF Canada score reference, see our{" "}
        <Link href="/guide/tcf-score-chart">
          TCF Canada Score Chart guide
        </Link>
        .
      </>
    ),
    h2tefScoring: "Scoring: TEF Canada → CLB / NCLC",
    tefScoringIntro:
      "TEF Canada uses completely different numerical scales. Listening (CO) is scored out of 360, reading (CE) out of 300, and writing (EE) and speaking (EO) each out of 450. The official IRCC conversion to CLB/NCLC is:",
    tefClbTableHeaders: [
      "CLB / NCLC",
      "CE (/300)",
      "CO (/360)",
      "EE (/450)",
      "EO (/450)",
    ],
    allFourNote: (
      <>
        <strong>Important:</strong> To claim a CLB level for Express
        Entry or any IRCC program, you must meet the minimum in{" "}
        <em>all four</em> sections. Your reported CLB is the lowest
        skill result.
      </>
    ),
    h2format: "Format and content differences",
    tcfFormatTitle: "TCF Canada",
    tcfFormatList: [
      "Compréhension Orale (CO) — 39 multiple-choice questions, 35 minutes. Short audio clips (conversations, announcements, news, interviews) with four answer options.",
      "Compréhension Écrite (CE) — 39 multiple-choice questions, 60 minutes. Texts of varying length, from SMS-style messages (A1) to full articles (C2).",
      "Expression Écrite (EE) — 3 tasks, 60 minutes. Short message, article, and formal letter or argument piece.",
      "Expression Orale (EO) — 3 tasks, 12 minutes. Personal interview, information gathering, and opinion expression.",
    ],
    tefFormatTitle: "TEF Canada",
    tefFormatList: [
      "Compréhension Orale (CO) — 60 questions, 40 minutes. More varied task types including true/false and matching.",
      "Compréhension Écrite (CE) — 50 questions, 60 minutes. Multiple-choice plus some fill-in-the-blank.",
      "Expression Écrite (EE) — 2 tasks, 60 minutes. News article rewrite and argumentative essay.",
      "Expression Orale (EO) — 2 tasks, 15 minutes. Information gathering role-play and opinion persuasion.",
    ],
    h2choose: "Which exam should you choose?",
    chooseIntro: (
      <>
        For most candidates, the answer is:{" "}
        <strong>
          pick whichever you can schedule soonest at a nearby centre
        </strong>
        . Both are equally valid for IRCC. The practical deciding factors
        are usually:
      </>
    ),
    chooseList: [
      <>
        <strong>Seat availability in your city.</strong> TCF Canada
        seats are extremely scarce in Ottawa, Calgary, and Vancouver —
        often booked 2–3 months in advance. HiTCF provides a{" "}
        <Link href="/seat-monitor">real-time TCF Canada seat monitor</Link>{" "}
        for these three cities. If TCF is sold out, TEF may have a slot
        sooner.
      </>,
      <>
        <strong>Which format you have prepared for.</strong> Switching
        formats two weeks before the exam is a bad idea. If you have
        been doing TCF-style practice tests, stick with TCF.
      </>,
      <>
        <strong>Exam centre proximity.</strong> Some Canadian cities
        offer only one of the two. Travelling 4+ hours to a different
        city adds cost and stress — often more than the minor format
        difference is worth.
      </>,
    ],
    chooseClosing: (
      <>
        Candidates sometimes ask whether <em>taking both</em> makes
        sense. It can — if you have the budget and time, a second
        attempt in a different format is a legitimate way to hedge
        against one bad day. IRCC will accept whichever valid result you
        submit.
      </>
    ),
    h2help: "How HiTCF helps (and what it does not cover)",
    helpBody1: (
      <>
        HiTCF is built{" "}
        <strong>exclusively for TCF Canada preparation</strong>. It
        provides 1,306 test sets and 8,397 questions aligned to the
        official TCF Canada format: 42 listening sets with
        sentence-level audio timestamps, 42 reading sets with
        click-to-lookup vocabulary, 702 speaking topic sets with AI
        evaluation via Azure Speech and Grok, and 520 writing task sets
        with AI feedback on the 4-criteria TCF rubric.
      </>
    ),
    helpBody2: (
      <>
        <strong>HiTCF does not cover TEF Canada.</strong> The two exams
        differ enough in format (question styles, task counts, scoring
        scales) that TCF practice is not a substitute for TEF-specific
        preparation. If you are committed to TEF Canada, you will need
        a TEF-specific resource. HiTCF is the right choice if you have
        decided on TCF Canada and want the most complete bank of
        TCF-style practice questions with AI feedback.
      </>
    ),
    cta: "Start practising TCF Canada on HiTCF →",
    h2faq: "Frequently asked questions",
    faqs: [
      {
        q: "Does IRCC prefer TCF Canada over TEF Canada?",
        a: (
          <>
            No. IRCC treats TCF Canada and TEF Canada as equally valid.
            Both map to the same CLB/NCLC scale, and both unlock the
            same Express Entry CRS points. The choice is purely
            practical — availability, cost, format preference.
          </>
        ),
      },
      {
        q: "Is TEF Canada the same as TEF?",
        a: (
          <>
            No. &quot;TEF&quot; is a family of French proficiency tests
            administered by CCI Paris Île-de-France. TEF Canada is the
            version specifically configured for Canadian immigration.
            Other versions like TEFAQ (Quebec), TEF Naturalisation
            (French citizenship), and TEF for academic admission exist
            but are not interchangeable for IRCC purposes.
          </>
        ),
      },
      {
        q: "Which exam is shorter?",
        a: (
          <>
            TCF Canada is slightly shorter overall (~2h 47min vs ~3h
            10min for TEF Canada), but both are full half-day exams.
            Plan the whole morning or afternoon.
          </>
        ),
      },
      {
        q: "Can I retake either exam?",
        a: (
          <>
            Yes. Both exams allow unlimited retakes, though most centres
            require a waiting period (typically 30 days) between
            attempts. There is no limit on how many times you can submit
            different results to IRCC over the validity period.
          </>
        ),
      },
      {
        q: "Which one gives me more CRS points?",
        a: (
          <>
            Neither. Express Entry CRS points are based on CLB level,
            not on which exam you took to get there. CLB 7 in French is
            CLB 7 in French, regardless of whether it came from TCF
            Canada or TEF Canada. Claiming French as your first official
            language unlocks up to 50 extra CRS points for bilingual
            ability — the same for both exams.
          </>
        ),
      },
    ],
    sourcesLabel: "Sources",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")},{" "}
        {CCIP("CCI Paris Île-de-France — TEF Canada")},{" "}
        {IRCC("IRCC — Test results and CLB levels")}. This guide is
        maintained by HiTCF, an independent TCF Canada practice
        platform. We are not affiliated with IRCC, FEI, or CCIP. Verify
        all thresholds and fees with the official sources before
        booking your exam.
      </>
    ),
  },
  zh: {
    metaTitle:
      "TCF Canada 还是 TEF Canada？两个法语考试完整对比（2026）",
    metaDescription:
      "TCF Canada 与 TEF Canada 并排对比：评分、题型、费用、考点、CLB/NCLC 换算。用于加拿大永居、Express Entry、QSW 申请的决策参考。更新于 " +
      LAST_UPDATED +
      "。",
    h1: "TCF Canada 还是 TEF Canada？到底该考哪个？",
    lead: (
      <>
        <strong>TCF Canada</strong> 和 <strong>TEF Canada</strong> 都被
        {IRCC("加拿大移民、难民及公民部（IRCC）")}
        认可，可作为永久居民、Express Entry 和入籍申请的法语能力证明。两者由不同机构管理，评分尺度不同，考点也不同——但 IRCC 都对照到同一个 CLB/NCLC 1–12 级量表。本页把两者并排对比，帮你决定哪个更适合你。
      </>
    ),
    lastUpdatedLabel: "最后更新",
    lastUpdatedBody: (
      <>
        。以下所有分数阈值来自 IRCC 现行对照表。报名考试或提交申请前，请务必在
        {IRCC("canada.ca", IRCC_ROOT)}核实最新数据。
      </>
    ),
    h2quick: "快速对比一览",
    quickHeaders: ["项目", "TCF Canada", "TEF Canada"],
    quickRows: {
      fullName: "全称",
      administered: "管理方",
      recognition: "IRCC 认可",
      sections: "科目",
      format: "题型风格",
      coScoring: "听力（CO）分值",
      ceScoring: "阅读（CE）分值",
      eeScoring: "写作（EE）分值",
      eoScoring: "口语（EO）分值",
      duration: "总时长",
      validity: "成绩有效期",
      cost: "加拿大典型费用",
      centres: "主要考点类型",
      turnaround: "出分周期",
    },
    quickValues: {
      tcfName: <em>Test de connaissance du français pour le Canada</em>,
      tefName: <em>Test d&apos;évaluation de français pour le Canada</em>,
      tcfAdmin: FEI("法国国际教育研究中心（FEI）"),
      tefAdmin: CCIP("巴黎大区工商会（CCIP）"),
      tcfRecognition: "是 — 全部项目",
      tefRecognition: "是 — 全部项目",
      sections: "CO、CE、EE、EO（全部必考）",
      tcfFormat: "以选择题为主（CO、CE）",
      tefFormat: "选择题 + 多种题型混合",
      tcfCoScoring: "100–699 分",
      tefCoScoring: "0–360 分",
      tcfCeScoring: "100–699 分",
      tefCeScoring: "0–300 分",
      tcfEeScoring: "0–20 分",
      tefEeScoring: "0–450 分",
      tcfEoScoring: "0–20 分",
      tefEoScoring: "0–450 分",
      tcfDuration: "约 2 小时 47 分",
      tefDuration: "约 3 小时 10 分",
      validity: "2 年",
      cost: "CAD 350–450",
      tcfCentres: "Alliance Française、AEC 授权考点",
      tefCentres: "Alliance Française、CCIP 授权考点",
      turnaround: "4–6 周",
    },
    h2tcfScoring: "评分对照：TCF Canada → CLB / NCLC",
    tcfScoringIntro: (
      <>
        TCF Canada 的听力（CO）和阅读（CE）使用 100–699 分制，写作（EE）和口语（EO）使用 0–20 分制。IRCC 官方对照到 CLB/NCLC 如下：
      </>
    ),
    clbTableHeaders: ["CLB / NCLC", "CE", "CO", "EE", "EO"],
    tcfChartLinkText: (
      <>
        TCF Canada 完整分数参考请看
        <Link href="/guide/tcf-score-chart">
          TCF Canada 分数对照表
        </Link>
        。
      </>
    ),
    h2tefScoring: "评分对照：TEF Canada → CLB / NCLC",
    tefScoringIntro:
      "TEF Canada 使用完全不同的分数体系。听力（CO）满分 360、阅读（CE）满分 300、写作（EE）和口语（EO）各自满分 450。IRCC 官方对照到 CLB/NCLC 如下：",
    tefClbTableHeaders: [
      "CLB / NCLC",
      "CE (/300)",
      "CO (/360)",
      "EE (/450)",
      "EO (/450)",
    ],
    allFourNote: (
      <>
        <strong>重要：</strong>申请 Express Entry 或任何 IRCC 项目时，要达到某个 CLB 级别必须
        <em>四科全部</em>达标。报告的 CLB 等级取四科中的最低值。
      </>
    ),
    h2format: "题型和内容差异",
    tcfFormatTitle: "TCF Canada",
    tcfFormatList: [
      "听力（CO）— 39 道选择题，35 分钟。短音频（对话、通知、新闻、采访），每题四选一。",
      "阅读（CE）— 39 道选择题，60 分钟。文本长度不一，从 A1 的短信到 C2 的长文。",
      "写作（EE）— 3 个任务，60 分钟。短消息、文章、正式信件或议论文。",
      "口语（EO）— 3 个任务，12 分钟。自我介绍、信息收集、观点表达。",
    ],
    tefFormatTitle: "TEF Canada",
    tefFormatList: [
      "听力（CO）— 60 道题，40 分钟。题型更多样，含判断题和配对题。",
      "阅读（CE）— 50 道题，60 分钟。选择题加部分填空题。",
      "写作（EE）— 2 个任务，60 分钟。新闻改写和论证文。",
      "口语（EO）— 2 个任务，15 分钟。信息收集角色扮演和观点劝说。",
    ],
    h2choose: "该选哪个？",
    chooseIntro: (
      <>
        对大多数人来说答案是：
        <strong>能在附近考点最快排到位就考哪个</strong>。两者对 IRCC 等价。实际决策因素通常是：
      </>
    ),
    chooseList: [
      <>
        <strong>本地考位情况。</strong>渥太华、卡尔加里、温哥华的 TCF Canada 考位极其紧张，通常要提前 2–3 个月预约。HiTCF 为这三个城市提供
        <Link href="/seat-monitor">实时 TCF Canada 考位监控</Link>
        。如果 TCF 约不到，TEF 可能还有名额。
      </>,
      <>
        <strong>你准备的是哪种题型。</strong>考前两周换题型是个坏主意。如果你一直在做 TCF 风格的模拟题，就坚持考 TCF。
      </>,
      <>
        <strong>考点距离。</strong>有些加拿大城市只有两者之一的考点。为了考试跨城市 4+ 小时通勤，代价往往比题型差异本身更大。
      </>,
    ],
    chooseClosing: (
      <>
        有人会问<em>两个都考</em>行不行。行——如果预算和时间允许，用不同题型再考一次是合理的对冲策略。IRCC 会接受你提交的任一有效成绩。
      </>
    ),
    h2help: "HiTCF 能帮到你什么（以及帮不到什么）",
    helpBody1: (
      <>
        HiTCF 是
        <strong>专为 TCF Canada 备考打造的平台</strong>。提供 1,306 套真题、8,397 道题目，完全按照 TCF Canada 官方题型设计：42 套听力真题带句子级时间戳、42 套阅读真题带点击查词、702 套口语真题带 Azure Speech + Grok AI 评分、520 套写作真题带 4 维度官方评分细则 AI 批改。
      </>
    ),
    helpBody2: (
      <>
        <strong>HiTCF 不覆盖 TEF Canada。</strong>两个考试在题型、任务数、评分体系上差异较大，TCF 的练习无法替代 TEF 专项准备。如果你确定要考 TEF Canada，需要找 TEF 专属资源。如果你选择了 TCF Canada 并希望拥有最完整的 TCF 真题库和 AI 反馈，HiTCF 是最佳选择。
      </>
    ),
    cta: "在 HiTCF 开始 TCF Canada 练习 →",
    h2faq: "常见问题",
    faqs: [
      {
        q: "IRCC 是否更偏好 TCF Canada？",
        a: (
          <>
            不。IRCC 把 TCF Canada 和 TEF Canada 视为完全等效。两者都对照到同一个 CLB/NCLC 量表，也都能解锁同样的 Express Entry CRS 加分。选哪个完全看实际情况——考位、费用、题型偏好。
          </>
        ),
      },
      {
        q: "TEF Canada 和普通 TEF 一样吗？",
        a: (
          <>
            不一样。&quot;TEF&quot; 是巴黎大区工商会（CCIP）管理的一整套法语考试系列。TEF Canada 是专为加拿大移民设计的版本，其他版本如 TEFAQ（魁北克）、TEF Naturalisation（法国入籍）、TEF 学术录取用等，用途不同、互不通用。
          </>
        ),
      },
      {
        q: "哪个考试时间更短？",
        a: (
          <>
            TCF Canada 略短（约 2h 47min vs TEF Canada 约 3h 10min），但都是半天的正式考试。安排时请留出整个上午或下午。
          </>
        ),
      },
      {
        q: "两个考试都能重考吗？",
        a: (
          <>
            可以。两者都允许无限次重考，但大多数考点要求两次尝试之间间隔（通常 30 天）。在成绩有效期内提交多少次不同成绩给 IRCC 没有限制。
          </>
        ),
      },
      {
        q: "哪个能拿更多 CRS 分？",
        a: (
          <>
            都不会。Express Entry 的 CRS 分基于 CLB 级别，不看你考的是哪个考试。CLB 7 就是 CLB 7，不管来自 TCF Canada 还是 TEF Canada。把法语作为第一官方语言申报最多可获 50 分双语加分——两个考试都一样。
          </>
        ),
      },
    ],
    sourcesLabel: "来源",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")}、
        {CCIP("CCI Paris Île-de-France — TEF Canada")}、
        {IRCC("IRCC — 考试成绩与 CLB 等级")}
        。本页由 HiTCF 独立维护，HiTCF 与 IRCC、FEI、CCIP 无任何隶属关系。报名考试前请对照官方最新要求核实所有阈值与费用。
      </>
    ),
  },
  fr: {
    metaTitle:
      "TCF Canada ou TEF Canada : lequel passer ? Comparatif 2026",
    metaDescription:
      "Comparaison côte à côte du TCF Canada et du TEF Canada pour la résidence permanente canadienne, l'Entrée express et le PEQ. Notation, format, coût, disponibilité et correspondance CLB/NCLC. Mis à jour le " +
      LAST_UPDATED +
      ".",
    h1: "TCF Canada ou TEF Canada : lequel passer ?",
    lead: (
      <>
        Le <strong>TCF Canada</strong> et le <strong>TEF Canada</strong>{" "}
        sont tous deux reconnus par{" "}
        {IRCC("Immigration, Réfugiés et Citoyenneté Canada (IRCC)")}{" "}
        comme preuves de compétence en français pour la résidence
        permanente, l&apos;Entrée express et les demandes de citoyenneté.
        Ils sont administrés par des organismes différents, utilisent
        des échelles de notation différentes et sont offerts dans des
        centres différents — mais IRCC les convertit tous les deux sur
        la même échelle CLB/NCLC de 1 à 12. Ce guide les compare côte à
        côte pour vous aider à choisir.
      </>
    ),
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdatedBody: (
      <>
        . Tous les seuils de notation ci-dessous proviennent des
        tableaux de conversion IRCC en vigueur. Vérifiez toujours auprès
        de {IRCC("canada.ca", IRCC_ROOT)} avant de réserver votre test
        ou de soumettre une demande.
      </>
    ),
    h2quick: "Comparaison rapide",
    quickHeaders: ["Caractéristique", "TCF Canada", "TEF Canada"],
    quickRows: {
      fullName: "Nom complet",
      administered: "Administré par",
      recognition: "Reconnaissance IRCC",
      sections: "Épreuves",
      format: "Style de format",
      coScoring: "Notation CO",
      ceScoring: "Notation CE",
      eeScoring: "Notation EE",
      eoScoring: "Notation EO",
      duration: "Durée totale",
      validity: "Validité des résultats",
      cost: "Coût typique au Canada",
      centres: "Types de centres",
      turnaround: "Délai de résultats",
    },
    quickValues: {
      tcfName: <em>Test de connaissance du français pour le Canada</em>,
      tefName: <em>Test d&apos;évaluation de français pour le Canada</em>,
      tcfAdmin: FEI("France Éducation International (FEI)"),
      tefAdmin: CCIP("CCI Paris Île-de-France"),
      tcfRecognition: "Oui — tous les programmes",
      tefRecognition: "Oui — tous les programmes",
      sections: "CO, CE, EE, EO (toutes obligatoires)",
      tcfFormat: "Principalement QCM (CO, CE)",
      tefFormat: "QCM + tâches variées",
      tcfCoScoring: "100–699 points",
      tefCoScoring: "0–360 points",
      tcfCeScoring: "100–699 points",
      tefCeScoring: "0–300 points",
      tcfEeScoring: "0–20 points",
      tefEeScoring: "0–450 points",
      tcfEoScoring: "0–20 points",
      tefEoScoring: "0–450 points",
      tcfDuration: "~2h 47min",
      tefDuration: "~3h 10min",
      validity: "2 ans",
      cost: "350–450 CAD",
      tcfCentres: "Alliance Française, centres AEC agréés",
      tefCentres: "Alliance Française, centres CCIP agréés",
      turnaround: "4–6 semaines",
    },
    h2tcfScoring: "Notation : TCF Canada → CLB / NCLC",
    tcfScoringIntro: (
      <>
        Le TCF Canada utilise une échelle de 100 à 699 pour
        l&apos;écoute (CO) et la lecture (CE), et une échelle de 0 à 20
        pour la rédaction (EE) et l&apos;oral (EO). La conversion
        officielle IRCC vers CLB/NCLC est :
      </>
    ),
    clbTableHeaders: ["CLB / NCLC", "CE", "CO", "EE", "EO"],
    tcfChartLinkText: (
      <>
        Pour la référence complète des scores TCF Canada, voir notre{" "}
        <Link href="/guide/tcf-score-chart">
          Tableau des scores TCF Canada
        </Link>
        .
      </>
    ),
    h2tefScoring: "Notation : TEF Canada → CLB / NCLC",
    tefScoringIntro:
      "Le TEF Canada utilise des échelles numériques complètement différentes. L'écoute (CO) est notée sur 360, la lecture (CE) sur 300, et la rédaction (EE) et l'oral (EO) chacun sur 450. La conversion officielle IRCC vers CLB/NCLC est :",
    tefClbTableHeaders: [
      "CLB / NCLC",
      "CE (/300)",
      "CO (/360)",
      "EE (/450)",
      "EO (/450)",
    ],
    allFourNote: (
      <>
        <strong>Important :</strong> Pour prétendre à un niveau CLB pour
        l&apos;Entrée express ou tout programme IRCC, vous devez
        atteindre le minimum dans <em>les quatre</em> compétences. Le
        CLB rapporté est le résultat de votre compétence la plus faible.
      </>
    ),
    h2format: "Différences de format et de contenu",
    tcfFormatTitle: "TCF Canada",
    tcfFormatList: [
      "Compréhension Orale (CO) — 39 questions à choix multiples, 35 minutes. Courts extraits audio (conversations, annonces, nouvelles, entretiens) avec quatre options de réponse.",
      "Compréhension Écrite (CE) — 39 questions à choix multiples, 60 minutes. Textes de longueurs variables, du message de type SMS (A1) à l'article complet (C2).",
      "Expression Écrite (EE) — 3 tâches, 60 minutes. Message court, article et lettre formelle ou argumentaire.",
      "Expression Orale (EO) — 3 tâches, 12 minutes. Entretien personnel, recherche d'information et expression d'opinion.",
    ],
    tefFormatTitle: "TEF Canada",
    tefFormatList: [
      "Compréhension Orale (CO) — 60 questions, 40 minutes. Types de tâches plus variés incluant vrai/faux et appariement.",
      "Compréhension Écrite (CE) — 50 questions, 60 minutes. QCM plus quelques textes à trous.",
      "Expression Écrite (EE) — 2 tâches, 60 minutes. Réécriture d'article de presse et essai argumentatif.",
      "Expression Orale (EO) — 2 tâches, 15 minutes. Jeu de rôle de recherche d'information et persuasion d'opinion.",
    ],
    h2choose: "Quel examen choisir ?",
    chooseIntro: (
      <>
        Pour la plupart des candidats, la réponse est :{" "}
        <strong>
          choisissez celui que vous pouvez passer le plus tôt dans un
          centre proche
        </strong>
        . Les deux sont également valides pour IRCC. Les facteurs
        pratiques déterminants sont généralement :
      </>
    ),
    chooseList: [
      <>
        <strong>La disponibilité des places dans votre ville.</strong>{" "}
        Les places TCF Canada sont extrêmement rares à Ottawa, Calgary
        et Vancouver — souvent réservées 2 à 3 mois à l&apos;avance.
        HiTCF propose un{" "}
        <Link href="/seat-monitor">
          moniteur de places TCF Canada en temps réel
        </Link>{" "}
        pour ces trois villes. Si le TCF est complet, le TEF peut avoir
        un créneau plus tôt.
      </>,
      <>
        <strong>Le format pour lequel vous vous êtes préparé.</strong>{" "}
        Changer de format deux semaines avant l&apos;examen est une
        mauvaise idée. Si vous avez fait des tests de style TCF, restez
        sur le TCF.
      </>,
      <>
        <strong>La proximité du centre d&apos;examen.</strong>{" "}
        Certaines villes canadiennes n&apos;offrent que l&apos;un des
        deux. Voyager 4 heures ou plus vers une autre ville ajoute coût
        et stress — souvent plus que la différence de format ne le
        justifie.
      </>,
    ],
    chooseClosing: (
      <>
        Les candidats demandent parfois si <em>passer les deux</em> a
        du sens. Cela peut — si vous avez le budget et le temps, une
        seconde tentative dans un format différent est une stratégie
        légitime pour se protéger contre une mauvaise journée. IRCC
        acceptera tout résultat valide que vous soumettez.
      </>
    ),
    h2help: "Comment HiTCF aide (et ce qu&apos;il ne couvre pas)",
    helpBody1: (
      <>
        HiTCF est conçu{" "}
        <strong>exclusivement pour la préparation au TCF Canada</strong>.
        Il propose 1 306 séries de tests et 8 397 questions alignées sur
        le format officiel du TCF Canada : 42 séries d&apos;écoute avec
        horodatages phrase par phrase, 42 séries de lecture avec
        recherche de vocabulaire au clic, 702 séries de sujets oraux
        avec évaluation IA via Azure Speech et Grok, et 520 séries de
        tâches écrites avec rétroaction IA sur la grille officielle des
        4 critères TCF.
      </>
    ),
    helpBody2: (
      <>
        <strong>HiTCF ne couvre pas le TEF Canada.</strong> Les deux
        examens diffèrent suffisamment par leur format (types de
        questions, nombre de tâches, échelles de notation) pour que la
        préparation TCF ne remplace pas une préparation spécifique au
        TEF. Si vous êtes décidé à passer le TEF Canada, vous aurez
        besoin d&apos;une ressource TEF dédiée. HiTCF est le bon choix
        si vous avez décidé de passer le TCF Canada et voulez la
        banque la plus complète de questions d&apos;entraînement TCF
        avec rétroaction IA.
      </>
    ),
    cta: "Commencer à s'entraîner au TCF Canada sur HiTCF →",
    h2faq: "Questions fréquentes",
    faqs: [
      {
        q: "IRCC préfère-t-il le TCF Canada au TEF Canada ?",
        a: (
          <>
            Non. IRCC traite le TCF Canada et le TEF Canada comme
            également valides. Les deux correspondent à la même échelle
            CLB/NCLC, et les deux débloquent les mêmes points CRS
            d&apos;Entrée express. Le choix est purement pratique —
            disponibilité, coût, préférence de format.
          </>
        ),
      },
      {
        q: "Le TEF Canada est-il identique au TEF ?",
        a: (
          <>
            Non. &quot;TEF&quot; désigne une famille de tests de
            compétence en français administrés par la CCI Paris
            Île-de-France. Le TEF Canada est la version configurée
            spécifiquement pour l&apos;immigration canadienne. D&apos;autres
            versions comme le TEFAQ (Québec), le TEF Naturalisation
            (citoyenneté française) et le TEF pour admission
            universitaire existent mais ne sont pas interchangeables
            pour IRCC.
          </>
        ),
      },
      {
        q: "Quel examen est le plus court ?",
        a: (
          <>
            Le TCF Canada est légèrement plus court au total (~2h 47min
            contre ~3h 10min pour le TEF Canada), mais les deux sont des
            examens d&apos;une demi-journée complète. Prévoyez toute la
            matinée ou l&apos;après-midi.
          </>
        ),
      },
      {
        q: "Puis-je repasser l&apos;un ou l&apos;autre ?",
        a: (
          <>
            Oui. Les deux examens permettent un nombre illimité de
            nouvelles tentatives, bien que la plupart des centres
            exigent un délai d&apos;attente (généralement 30 jours)
            entre deux tentatives. Il n&apos;y a pas de limite au
            nombre de résultats différents que vous pouvez soumettre à
            IRCC pendant la période de validité.
          </>
        ),
      },
      {
        q: "Lequel donne plus de points CRS ?",
        a: (
          <>
            Aucun. Les points CRS d&apos;Entrée express sont basés sur
            le niveau CLB, pas sur l&apos;examen passé pour l&apos;atteindre.
            Un CLB 7 en français reste CLB 7, qu&apos;il vienne du TCF
            Canada ou du TEF Canada. Déclarer le français comme
            première langue officielle débloque jusqu&apos;à 50 points
            CRS supplémentaires pour le bilinguisme — identique pour
            les deux examens.
          </>
        ),
      },
    ],
    sourcesLabel: "Sources",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")},{" "}
        {CCIP("CCI Paris Île-de-France — TEF Canada")},{" "}
        {IRCC("IRCC — Résultats de test et niveaux CLB")}. Ce guide est
        maintenu par HiTCF, plateforme de préparation indépendante au
        TCF Canada. Nous ne sommes affiliés ni à IRCC, ni à FEI, ni à
        CCIP. Vérifiez tous les seuils et frais auprès des sources
        officielles avant de réserver votre examen.
      </>
    ),
  },
  ar: {
    metaTitle: "TCF Canada أم TEF Canada: أي اختبار تختار؟ (2026)",
    metaDescription:
      "مقارنة جنبًا إلى جنب بين TCF Canada و TEF Canada للإقامة الدائمة الكندية و Express Entry و QSW. تغطي التصحيح والتنسيق والتكلفة والتوفر وكيف يرتبط كل منهما بمستويات CLB/NCLC. آخر تحديث " +
      LAST_UPDATED +
      ".",
    h1: "TCF Canada أم TEF Canada: أي اختبار تختار؟",
    lead: (
      <>
        كل من <strong>TCF Canada</strong> و <strong>TEF Canada</strong>{" "}
        معترف بهما من قبل{" "}
        {IRCC("وزارة الهجرة واللاجئين والمواطنة الكندية (IRCC)")} كإثبات للكفاءة في اللغة الفرنسية لطلبات الإقامة الدائمة و Express Entry والمواطنة. تتم إدارتهما من قبل منظمات مختلفة، يستخدمان مقاييس درجات مختلفة، ويُقدَّمان في مراكز مختلفة — لكن IRCC يطابقهما مع نفس معايير CLB/NCLC من 1 إلى 12. هذا الدليل يقارنهما جنبًا إلى جنب لتقرر أيهما يناسب وضعك.
      </>
    ),
    lastUpdatedLabel: "آخر تحديث",
    lastUpdatedBody: (
      <>
        . جميع عتبات التصحيح أدناه من جداول التحويل الحالية لـ IRCC.
        تحقق دائمًا من {IRCC("canada.ca", IRCC_ROOT)} قبل حجز اختبارك أو تقديم طلب.
      </>
    ),
    h2quick: "مقارنة سريعة",
    quickHeaders: ["الميزة", "TCF Canada", "TEF Canada"],
    quickRows: {
      fullName: "الاسم الكامل",
      administered: "تديره",
      recognition: "اعتراف IRCC",
      sections: "الأقسام",
      format: "نمط التنسيق",
      coScoring: "تصحيح CO",
      ceScoring: "تصحيح CE",
      eeScoring: "تصحيح EE",
      eoScoring: "تصحيح EO",
      duration: "المدة الإجمالية",
      validity: "صلاحية النتائج",
      cost: "التكلفة النموذجية في كندا",
      centres: "أنواع المراكز النموذجية",
      turnaround: "مدة ظهور النتائج",
    },
    quickValues: {
      tcfName: <em>Test de connaissance du français pour le Canada</em>,
      tefName: <em>Test d&apos;évaluation de français pour le Canada</em>,
      tcfAdmin: FEI("France Éducation International (FEI)"),
      tefAdmin: CCIP("غرفة تجارة باريس إيل دو فرانس"),
      tcfRecognition: "نعم — جميع البرامج",
      tefRecognition: "نعم — جميع البرامج",
      sections: "CO و CE و EE و EO (جميعها إلزامية)",
      tcfFormat: "اختيار من متعدد في الغالب (CO و CE)",
      tefFormat: "اختيار من متعدد + أنواع مهام متنوعة",
      tcfCoScoring: "100–699 نقطة",
      tefCoScoring: "0–360 نقطة",
      tcfCeScoring: "100–699 نقطة",
      tefCeScoring: "0–300 نقطة",
      tcfEeScoring: "0–20 نقطة",
      tefEeScoring: "0–450 نقطة",
      tcfEoScoring: "0–20 نقطة",
      tefEoScoring: "0–450 نقطة",
      tcfDuration: "~2س 47د",
      tefDuration: "~3س 10د",
      validity: "سنتان",
      cost: "350–450 دولار كندي",
      tcfCentres: "Alliance Française، مراكز AEC المعتمدة",
      tefCentres: "Alliance Française، مراكز CCIP المعتمدة",
      turnaround: "4–6 أسابيع",
    },
    h2tcfScoring: "التصحيح: TCF Canada ← CLB / NCLC",
    tcfScoringIntro: (
      <>
        يستخدم TCF Canada مقياس 100–699 للاستماع (CO) والقراءة (CE)، ومقياس 0–20 للكتابة (EE) والتحدث (EO). التحويل الرسمي لـ IRCC إلى CLB/NCLC هو:
      </>
    ),
    clbTableHeaders: ["CLB / NCLC", "CE", "CO", "EE", "EO"],
    tcfChartLinkText: (
      <>
        للمرجع الكامل لدرجات TCF Canada، راجع{" "}
        <Link href="/guide/tcf-score-chart">
          جدول درجات TCF Canada
        </Link>
        .
      </>
    ),
    h2tefScoring: "التصحيح: TEF Canada ← CLB / NCLC",
    tefScoringIntro:
      "يستخدم TEF Canada مقاييس رقمية مختلفة تمامًا. يتم تصحيح الاستماع (CO) على 360، والقراءة (CE) على 300، والكتابة (EE) والتحدث (EO) كل منهما على 450. التحويل الرسمي لـ IRCC إلى CLB/NCLC هو:",
    tefClbTableHeaders: [
      "CLB / NCLC",
      "CE (/300)",
      "CO (/360)",
      "EE (/450)",
      "EO (/450)",
    ],
    allFourNote: (
      <>
        <strong>هام:</strong> للمطالبة بمستوى CLB لـ Express Entry أو أي برنامج IRCC، يجب أن تستوفي الحد الأدنى في <em>جميع الأقسام الأربعة</em>. CLB المُبلَّغ عنه هو نتيجة أضعف مهارة لديك.
      </>
    ),
    h2format: "اختلافات التنسيق والمحتوى",
    tcfFormatTitle: "TCF Canada",
    tcfFormatList: [
      "Compréhension Orale (CO) — 39 سؤال اختيار من متعدد، 35 دقيقة. مقاطع صوتية قصيرة (محادثات، إعلانات، أخبار، مقابلات) مع أربعة خيارات للإجابة.",
      "Compréhension Écrite (CE) — 39 سؤال اختيار من متعدد، 60 دقيقة. نصوص بأطوال متفاوتة، من رسائل نمط SMS (A1) إلى مقالات كاملة (C2).",
      "Expression Écrite (EE) — 3 مهام، 60 دقيقة. رسالة قصيرة، مقال، ورسالة رسمية أو قطعة حجاج.",
      "Expression Orale (EO) — 3 مهام، 12 دقيقة. مقابلة شخصية، جمع معلومات، والتعبير عن رأي.",
    ],
    tefFormatTitle: "TEF Canada",
    tefFormatList: [
      "Compréhension Orale (CO) — 60 سؤال، 40 دقيقة. أنواع مهام أكثر تنوعًا بما في ذلك صح/خطأ والتطابق.",
      "Compréhension Écrite (CE) — 50 سؤال، 60 دقيقة. اختيار من متعدد بالإضافة إلى بعض ملء الفراغات.",
      "Expression Écrite (EE) — مهمتان، 60 دقيقة. إعادة كتابة مقال إخباري ومقال حجاجي.",
      "Expression Orale (EO) — مهمتان، 15 دقيقة. لعب دور لجمع المعلومات وإقناع الرأي.",
    ],
    h2choose: "أي اختبار تختار؟",
    chooseIntro: (
      <>
        بالنسبة لمعظم المرشحين، الإجابة هي:{" "}
        <strong>اختر الاختبار الذي يمكنك حجزه في أقرب وقت في مركز قريب</strong>
        . كلاهما صالح بالتساوي لـ IRCC. العوامل العملية الحاسمة عادة هي:
      </>
    ),
    chooseList: [
      <>
        <strong>توفر المقاعد في مدينتك.</strong> مقاعد TCF Canada نادرة للغاية في أوتاوا وكالجاري وفانكوفر — غالبًا ما يتم حجزها قبل 2–3 أشهر. توفر HiTCF{" "}
        <Link href="/seat-monitor">
          مراقب مقاعد TCF Canada في الوقت الحقيقي
        </Link>{" "}
        لهذه المدن الثلاث. إذا كان TCF ممتلئًا، فقد يكون TEF لديه فسحة أقرب.
      </>,
      <>
        <strong>التنسيق الذي استعددت له.</strong> تغيير التنسيقات قبل أسبوعين من الامتحان فكرة سيئة. إذا كنت تقوم باختبارات على نمط TCF، فالتزم بـ TCF.
      </>,
      <>
        <strong>قرب مركز الاختبار.</strong> بعض المدن الكندية تقدم واحدًا فقط من الاثنين. السفر 4+ ساعات إلى مدينة مختلفة يضيف تكلفة وتوترًا — غالبًا أكثر مما يستحقه الاختلاف الطفيف في التنسيق.
      </>,
    ],
    chooseClosing: (
      <>
        يسأل المرشحون أحيانًا ما إذا كان <em>إجراء كليهما</em> منطقيًا. يمكن — إذا كان لديك الميزانية والوقت، فإن محاولة ثانية بتنسيق مختلف هي استراتيجية مشروعة للتحوط من يوم سيء. ستقبل IRCC أي نتيجة صالحة تقدمها.
      </>
    ),
    h2help: "كيف تساعد HiTCF (وما لا تغطيه)",
    helpBody1: (
      <>
        تم بناء HiTCF <strong>حصريًا لتحضير TCF Canada</strong>. يوفر 1,306 مجموعة اختبار و 8,397 سؤالاً متوافقة مع تنسيق TCF Canada الرسمي: 42 مجموعة استماع مع توقيتات صوتية على مستوى الجملة، و 42 مجموعة قراءة مع البحث في المفردات بالنقر، و 702 مجموعة مواضيع شفوية مع تقييم AI عبر Azure Speech و Grok، و 520 مجموعة مهام كتابية مع ملاحظات AI على معايير TCF الرسمية الأربعة.
      </>
    ),
    helpBody2: (
      <>
        <strong>HiTCF لا يغطي TEF Canada.</strong> الاختباران يختلفان بما فيه الكفاية في التنسيق (أنماط الأسئلة، عدد المهام، مقاييس التصحيح) بحيث لا يكون تدريب TCF بديلاً عن التحضير الخاص بـ TEF. إذا كنت ملتزمًا بـ TEF Canada، فستحتاج إلى مورد خاص بـ TEF. HiTCF هو الخيار الصحيح إذا قررت TCF Canada وتريد أكثر بنك كامل من أسئلة التدريب على نمط TCF مع ملاحظات AI.
      </>
    ),
    cta: "ابدأ التدريب على TCF Canada على HiTCF ←",
    h2faq: "الأسئلة الشائعة",
    faqs: [
      {
        q: "هل تفضل IRCC TCF Canada على TEF Canada؟",
        a: (
          <>
            لا. تعامل IRCC TCF Canada و TEF Canada على أنهما متساويان في الصلاحية. كلاهما يرتبط بنفس مقياس CLB/NCLC، وكلاهما يفتح نفس نقاط CRS لـ Express Entry. الاختيار عملي بحت — التوفر، التكلفة، تفضيل التنسيق.
          </>
        ),
      },
      {
        q: "هل TEF Canada هو نفسه TEF؟",
        a: (
          <>
            لا. &quot;TEF&quot; هو عائلة من اختبارات الكفاءة في اللغة الفرنسية تديرها غرفة تجارة باريس إيل دو فرانس. TEF Canada هو الإصدار المُكوَّن خصيصًا للهجرة الكندية. توجد إصدارات أخرى مثل TEFAQ (كيبيك) و TEF Naturalisation (الجنسية الفرنسية) و TEF للقبول الأكاديمي لكنها غير قابلة للتبادل لأغراض IRCC.
          </>
        ),
      },
      {
        q: "أي اختبار أقصر؟",
        a: (
          <>
            TCF Canada أقصر قليلاً بشكل عام (~2س 47د مقابل ~3س 10د لـ TEF Canada)، لكن كلاهما اختبارات نصف يوم كاملة. خطط لكل الصباح أو بعد الظهر.
          </>
        ),
      },
      {
        q: "هل يمكنني إعادة أي من الاختبارين؟",
        a: (
          <>
            نعم. يسمح كلا الاختبارين بإعادة غير محدودة، على الرغم من أن معظم المراكز تتطلب فترة انتظار (عادة 30 يومًا) بين المحاولات. لا يوجد حد لعدد المرات التي يمكنك فيها تقديم نتائج مختلفة إلى IRCC خلال فترة الصلاحية.
          </>
        ),
      },
      {
        q: "أيهما يعطيني نقاط CRS أكثر؟",
        a: (
          <>
            لا يوجد. تستند نقاط CRS لـ Express Entry إلى مستوى CLB، وليس على الاختبار الذي أجريته للوصول إليه. CLB 7 في الفرنسية هو CLB 7 بغض النظر عما إذا كان مصدره TCF Canada أو TEF Canada. إعلان الفرنسية كلغتك الرسمية الأولى يفتح ما يصل إلى 50 نقطة CRS إضافية للقدرة ثنائية اللغة — نفس الشيء لكلا الاختبارين.
          </>
        ),
      },
    ],
    sourcesLabel: "المصادر",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")}،{" "}
        {CCIP("CCI Paris Île-de-France — TEF Canada")}،{" "}
        {IRCC("IRCC — نتائج الاختبار ومستويات CLB")}. هذا الدليل تتم صيانته بواسطة HiTCF، منصة تحضير مستقلة لـ TCF Canada. نحن لسنا تابعين لـ IRCC أو FEI أو CCIP. تحقق من جميع العتبات والرسوم مع المصادر الرسمية قبل حجز اختبارك.
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
      title: c.metaTitle,
      description: c.metaDescription,
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
  const c = CONTENT[(locale as Locale) in CONTENT ? (locale as Locale) : "en"];
  const pageUrl = `${SITE_URL}/${locale}/guide/tcf-canada-vs-tef`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LearningResource", "Article"],
        "@id": `${pageUrl}#article`,
        headline: c.metaTitle,
        description: c.metaDescription,
        url: pageUrl,
        datePublished: LAST_UPDATED,
        dateModified: LAST_UPDATED,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: locale,
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
        mainEntity: c.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
        })),
      },
    ],
  };

  const q = c.quickValues;
  const qr = c.quickRows;

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

      <h2>{c.h2quick}</h2>
      <table>
        <thead>
          <tr>
            {c.quickHeaders.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>{qr.fullName}</strong></td>
            <td>{q.tcfName}</td>
            <td>{q.tefName}</td>
          </tr>
          <tr>
            <td><strong>{qr.administered}</strong></td>
            <td>{q.tcfAdmin}</td>
            <td>{q.tefAdmin}</td>
          </tr>
          <tr>
            <td><strong>{qr.recognition}</strong></td>
            <td>{q.tcfRecognition}</td>
            <td>{q.tefRecognition}</td>
          </tr>
          <tr>
            <td><strong>{qr.sections}</strong></td>
            <td>{q.sections}</td>
            <td>{q.sections}</td>
          </tr>
          <tr>
            <td><strong>{qr.format}</strong></td>
            <td>{q.tcfFormat}</td>
            <td>{q.tefFormat}</td>
          </tr>
          <tr>
            <td><strong>{qr.coScoring}</strong></td>
            <td>{q.tcfCoScoring}</td>
            <td>{q.tefCoScoring}</td>
          </tr>
          <tr>
            <td><strong>{qr.ceScoring}</strong></td>
            <td>{q.tcfCeScoring}</td>
            <td>{q.tefCeScoring}</td>
          </tr>
          <tr>
            <td><strong>{qr.eeScoring}</strong></td>
            <td>{q.tcfEeScoring}</td>
            <td>{q.tefEeScoring}</td>
          </tr>
          <tr>
            <td><strong>{qr.eoScoring}</strong></td>
            <td>{q.tcfEoScoring}</td>
            <td>{q.tefEoScoring}</td>
          </tr>
          <tr>
            <td><strong>{qr.duration}</strong></td>
            <td>{q.tcfDuration}</td>
            <td>{q.tefDuration}</td>
          </tr>
          <tr>
            <td><strong>{qr.validity}</strong></td>
            <td>{q.validity}</td>
            <td>{q.validity}</td>
          </tr>
          <tr>
            <td><strong>{qr.cost}</strong></td>
            <td>{q.cost}</td>
            <td>{q.cost}</td>
          </tr>
          <tr>
            <td><strong>{qr.centres}</strong></td>
            <td>{q.tcfCentres}</td>
            <td>{q.tefCentres}</td>
          </tr>
          <tr>
            <td><strong>{qr.turnaround}</strong></td>
            <td>{q.turnaround}</td>
            <td>{q.turnaround}</td>
          </tr>
        </tbody>
      </table>

      <h2>{c.h2tcfScoring}</h2>
      <p>{c.tcfScoringIntro}</p>

      <table>
        <thead>
          <tr>
            {c.clbTableHeaders.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>CLB 10</strong></td><td>549+</td><td>549+</td><td>16+</td><td>16+</td></tr>
          <tr><td><strong>CLB 9</strong></td><td>524–548</td><td>523–548</td><td>14–15</td><td>14–15</td></tr>
          <tr><td><strong>CLB 8</strong></td><td>499–523</td><td>503–522</td><td>12–13</td><td>12–13</td></tr>
          <tr><td><strong>CLB 7</strong></td><td>453–498</td><td>458–502</td><td>10–11</td><td>10–11</td></tr>
          <tr><td><strong>CLB 6</strong></td><td>406–452</td><td>398–457</td><td>7–9</td><td>7–9</td></tr>
          <tr><td><strong>CLB 5</strong></td><td>375–405</td><td>369–397</td><td>6</td><td>6</td></tr>
          <tr><td><strong>CLB 4</strong></td><td>342–374</td><td>331–368</td><td>4–5</td><td>4–5</td></tr>
        </tbody>
      </table>

      <p>{c.tcfChartLinkText}</p>

      <h2>{c.h2tefScoring}</h2>
      <p>{c.tefScoringIntro}</p>

      <table>
        <thead>
          <tr>
            {c.tefClbTableHeaders.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>CLB 10</strong></td><td>263+</td><td>316+</td><td>393+</td><td>393+</td></tr>
          <tr><td><strong>CLB 9</strong></td><td>248–262</td><td>298–315</td><td>371–392</td><td>371–392</td></tr>
          <tr><td><strong>CLB 8</strong></td><td>233–247</td><td>280–297</td><td>349–370</td><td>349–370</td></tr>
          <tr><td><strong>CLB 7</strong></td><td>207–232</td><td>249–279</td><td>310–348</td><td>310–348</td></tr>
          <tr><td><strong>CLB 6</strong></td><td>181–206</td><td>217–248</td><td>271–309</td><td>271–309</td></tr>
          <tr><td><strong>CLB 5</strong></td><td>151–180</td><td>181–216</td><td>225–270</td><td>225–270</td></tr>
          <tr><td><strong>CLB 4</strong></td><td>121–150</td><td>145–180</td><td>181–224</td><td>181–224</td></tr>
        </tbody>
      </table>

      <p>{c.allFourNote}</p>

      <h2>{c.h2format}</h2>

      <h3>{c.tcfFormatTitle}</h3>
      <ul>
        {c.tcfFormatList.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h3>{c.tefFormatTitle}</h3>
      <ul>
        {c.tefFormatList.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{c.h2choose}</h2>
      <p>{c.chooseIntro}</p>
      <ol>
        {c.chooseList.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
      <p>{c.chooseClosing}</p>

      <h2>{c.h2help}</h2>
      <p>{c.helpBody1}</p>
      <p>{c.helpBody2}</p>

      <p>
        <Link
          href="/tests"
          className="inline-block rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground no-underline"
        >
          {c.cta}
        </Link>
      </p>

      <h2>{c.h2faq}</h2>
      {c.faqs.map((f, i) => (
        <div key={i}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <hr />

      <p className="text-sm text-muted-foreground">
        {c.sourcesLabel}: {c.sourcesBody}
      </p>
    </>
  );
}
