import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

const SITE_URL = "https://hitcf.com";
const LAST_UPDATED = "2026-04-05";

type Locale = "en" | "zh" | "fr" | "ar";

interface Content {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: React.ReactNode;
  lastUpdatedLabel: string;
  lastUpdatedSuffix: React.ReactNode;
  h2scoring: string;
  scoringIntro: string;
  scoringTable: {
    headers: [string, string, string, string, string];
    co: string;
    ce: string;
    ee: string;
    eo: string;
    format: string;
    questions: string;
    duration: string;
    score: string;
  };
  scoringNote: React.ReactNode;
  h2cefr: string;
  cefrIntro: string;
  cefrTable: {
    headers: [string, string, string];
    c2: string;
    c1: string;
    b2: string;
    b1: string;
    a2: string;
    a1: string;
  };
  h2clb: string;
  clbIntro: React.ReactNode;
  clbTable: {
    headers: [string, string, string, string, string];
  };
  clbNote: React.ReactNode;
  h2pr: string;
  prFswTitle: string;
  prFswBody: React.ReactNode;
  prQswTitle: string;
  prQswBody: React.ReactNode;
  prCitizenshipTitle: string;
  prCitizenshipBody: React.ReactNode;
  h2help: string;
  helpIntro: React.ReactNode;
  helpList: string[];
  helpClosing: React.ReactNode;
  cta: string;
  h2faq: string;
  faqs: { q: string; a: React.ReactNode }[];
  sourcesLabel: string;
  sourcesBody: React.ReactNode;
}

const FEI_URL = "https://www.france-education-international.fr/test/tcf-canada";
const IRCC_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof/test-results-meet-level.html";

const FEI = (label: string) => (
  <a href={FEI_URL} target="_blank" rel="noopener">
    {label}
  </a>
);
const IRCC = (label: string) => (
  <a href={IRCC_URL} target="_blank" rel="noopener">
    {label}
  </a>
);

const CONTENT: Record<Locale, Content> = {
  en: {
    metaTitle: "TCF Canada Score Chart: CEFR, CLB and NCLC Conversion (2026)",
    metaDescription:
      "Complete TCF Canada score conversion: raw scores to CEFR levels (A1–C2) and to CLB / NCLC for Canadian PR, Express Entry, QSW, and PEQ. Official IRCC table, last updated " +
      LAST_UPDATED +
      ".",
    h1: "TCF Canada Score Chart: CEFR, CLB and NCLC Conversion",
    lead: (
      <>
        The <strong>TCF Canada</strong> (
        <em>Test de connaissance du français pour le Canada</em>) is the
        French proficiency exam recognized by {IRCC("Immigration, Refugees and Citizenship Canada (IRCC)")}{" "}
        for permanent residence and citizenship applications. It is
        administered by {FEI("France Éducation International (FEI)")}. This
        page shows the complete score conversion between TCF Canada raw
        scores, CEFR levels (A1 through C2), and the Canadian Language
        Benchmarks (CLB) / Niveaux de compétence linguistique canadiens
        (NCLC) 1–12 scale.
      </>
    ),
    lastUpdatedLabel: "Last updated",
    lastUpdatedSuffix: (
      <>
        . Source tables below are published by IRCC and FEI. HiTCF is an
        independent third-party practice platform and is not affiliated
        with IRCC or FEI.
      </>
    ),
    h2scoring: "How TCF Canada is scored",
    scoringIntro:
      "TCF Canada has four mandatory sections, each scored independently:",
    scoringTable: {
      headers: ["Section", "Format", "Questions", "Duration", "Score range"],
      co: "Compréhension Orale (CO) — Listening",
      ce: "Compréhension Écrite (CE) — Reading",
      ee: "Expression Écrite (EE) — Writing",
      eo: "Expression Orale (EO) — Speaking",
      format: "",
      questions: "",
      duration: "",
      score: "",
    },
    scoringNote: (
      <>
        There is <strong>no overall total</strong>. Each skill is reported
        separately and mapped to its own CEFR level. To qualify for a
        given CLB level (for Express Entry or PEQ), you must reach the
        minimum score in <em>every</em> skill.
      </>
    ),
    h2cefr: "TCF Canada score → CEFR level",
    cefrIntro:
      "The raw CO/CE score maps to CEFR as follows (published by FEI). The EE/EO mapping uses the 0–20 scale directly.",
    cefrTable: {
      headers: ["CEFR level", "CO / CE (points)", "EE / EO (points)"],
      c2: "C2 — Mastery",
      c1: "C1 — Advanced",
      b2: "B2 — Upper intermediate",
      b1: "B1 — Intermediate",
      a2: "A2 — Elementary",
      a1: "A1 — Beginner",
    },
    h2clb: "TCF Canada score → CLB / NCLC (official IRCC table)",
    clbIntro: (
      <>
        This is the table IRCC uses for Express Entry and all federal
        immigration programs. See the{" "}
        {IRCC("official IRCC language testing reference")} for the
        authoritative current version.
      </>
    ),
    clbTable: {
      headers: [
        "CLB / NCLC",
        "CE (Reading)",
        "CO (Listening)",
        "EE (Writing)",
        "EO (Speaking)",
      ],
    },
    clbNote: (
      <>
        <strong>Note:</strong> CLB (Canadian Language Benchmarks) and
        NCLC (Niveaux de compétence linguistique canadiens) are the same
        scale applied to English and French respectively. NCLC 7 = CLB 7.
        Every CLB threshold above applies to TCF Canada regardless of the
        term used.
      </>
    ),
    h2pr: "What score do you need for Canadian PR?",
    prFswTitle: "Express Entry — Federal Skilled Worker (FSW)",
    prFswBody: (
      <>
        You need a minimum of{" "}
        <strong>CLB 7 in all four skills</strong> in either English or
        French to be eligible for the Federal Skilled Worker Program.
        Claiming French as your <em>first</em> official language and
        English as your second unlocks up to{" "}
        <strong>50 extra CRS points</strong> for bilingual ability — a
        major advantage for candidates with a French background.
      </>
    ),
    prQswTitle: "Quebec Skilled Worker (QSW) / PEQ",
    prQswBody: (
      <>
        Quebec programs require a minimum of{" "}
        <strong>NCLC 7 in oral skills</strong> (CO + EO). For some
        streams, NCLC 5 in written skills (CE + EE) is sufficient. The
        Programme de l&apos;expérience québécoise (PEQ) also accepts
        NCLC 7 in oral comprehension and production.
      </>
    ),
    prCitizenshipTitle: "Canadian citizenship",
    prCitizenshipBody: (
      <>
        Citizenship requires{" "}
        <strong>CLB 4 in speaking and listening</strong> (EO and CO).
        Writing and reading are not tested for citizenship applications,
        but demonstrated proficiency through education or employment is
        considered.
      </>
    ),
    h2help: "How HiTCF helps you hit these benchmarks",
    helpIntro: (
      <>
        HiTCF offers <strong>1,306 test sets</strong> and{" "}
        <strong>8,397 questions</strong> covering every CEFR level from
        A1 through C2:
      </>
    ),
    helpList: [
      "42 listening test sets (1,638 CO questions) with sentence-level audio timestamps generated by OpenAI Whisper — every sentence can be replayed independently.",
      "42 reading test sets (1,638 CE questions) with click-to-lookup vocabulary and full explanations for every answer.",
      "702 speaking topic sets (3,536 EO tasks across Tâche 1, 2, and 3) with AI evaluation powered by Azure Speech pronunciation scoring and Grok language modelling, graded on the 6-dimension TCF rubric.",
      "520 writing task sets (1,540 EE tasks) with AI feedback on the official 4-criteria TCF grading rubric.",
    ],
    helpClosing: (
      <>
        Every practice question shows an estimated CEFR level and the
        corresponding CLB/NCLC band, so you can track exactly where you
        stand against the benchmarks above. New users receive a 7-day
        Pro trial on registration — no credit card required.
      </>
    ),
    cta: "Start practising now →",
    h2faq: "Frequently asked questions",
    faqs: [
      {
        q: "What TCF Canada score do I need for CLB 7?",
        a: (
          <>
            CLB 7 requires:{" "}
            <strong>Compréhension Écrite 453–498 points</strong>,{" "}
            <strong>Compréhension Orale 458–502 points</strong>,{" "}
            <strong>Expression Écrite 10–11 points</strong>, and{" "}
            <strong>Expression Orale 10–11 points</strong>. CLB 7 is the
            minimum French proficiency required for most Express Entry
            federal skilled worker programs and for full bilingual points
            on CRS.
          </>
        ),
      },
      {
        q: "Is NCLC the same as CLB?",
        a: (
          <>
            Yes. NCLC is the French-language equivalent of CLB, using the
            same 1–12 scale. NCLC 7 = CLB 7. IRCC reports both terms
            interchangeably depending on whether the test was in French
            (NCLC) or English (CLB).
          </>
        ),
      },
      {
        q: "How is TCF Canada different from TCF?",
        a: (
          <>
            TCF Canada is a special version of the Test de Connaissance
            du Français designed specifically for the Canadian
            immigration and citizenship context. All four skills (CO,
            CE, EE, EO) are mandatory, scored with the Canadian scale,
            and recognized by IRCC. The regular TCF tests vary by
            version and are used for other purposes (academic admission,
            visa applications, etc.).
          </>
        ),
      },
      {
        q: "How long are TCF Canada scores valid?",
        a: (
          <>
            TCF Canada scores are valid for{" "}
            <strong>two years</strong> from the date of the exam. After
            two years, you must retake the test to submit a new Express
            Entry profile or other IRCC application.
          </>
        ),
      },
      {
        q: "Where can I take TCF Canada in Canada?",
        a: (
          <>
            TCF Canada is offered at accredited Alliance Française
            centres in Ottawa, Calgary, Vancouver, Toronto, Montreal,
            and several other Canadian cities. Seats are limited and
            fill quickly — HiTCF provides a{" "}
            <Link href="/seat-monitor">real-time seat monitor</Link> for
            Ottawa, Calgary, and Vancouver that refreshes every 15
            seconds.
          </>
        ),
      },
    ],
    sourcesLabel: "Sources",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")},{" "}
        {IRCC("IRCC — Test results and CLB levels")}. This page is
        maintained by HiTCF, an independent TCF Canada practice
        platform. We are not affiliated with IRCC or FEI. Please verify
        with the official sources for the most up-to-date thresholds
        before submitting your application.
      </>
    ),
  },
  zh: {
    metaTitle: "TCF Canada 分数对照表：CEFR、CLB 与 NCLC 完整换算（2026）",
    metaDescription:
      "TCF Canada 成绩完整换算：原始分到 CEFR 等级（A1–C2），再到 CLB / NCLC，用于加拿大永居、Express Entry、QSW、PEQ 申请。IRCC 官方对照表，更新于 " +
      LAST_UPDATED +
      "。",
    h1: "TCF Canada 分数对照表：CEFR、CLB 与 NCLC 完整换算",
    lead: (
      <>
        <strong>TCF Canada</strong>（
        <em>Test de connaissance du français pour le Canada</em>）是被
        {IRCC("加拿大移民、难民及公民部（IRCC）")}认可的法语水平考试，用于永久居民与入籍申请，由
        {FEI("法国国际教育研究中心（France Éducation International，FEI）")}
        管理。本页提供 TCF Canada 原始分、CEFR 等级（A1 到 C2）以及加拿大语言基准（CLB）/ 法语水平（NCLC）1–12 级之间的完整对照。
      </>
    ),
    lastUpdatedLabel: "最后更新",
    lastUpdatedSuffix: (
      <>
        。下文所有分数表出自 IRCC 与 FEI 的官方发布。HiTCF 是独立的第三方练习平台，与 IRCC、FEI 无隶属关系。
      </>
    ),
    h2scoring: "TCF Canada 怎么算分",
    scoringIntro: "TCF Canada 有四个必考科目，每科独立评分：",
    scoringTable: {
      headers: ["科目", "题型", "题数", "时长", "分数区间"],
      co: "Compréhension Orale (CO) — 听力",
      ce: "Compréhension Écrite (CE) — 阅读",
      ee: "Expression Écrite (EE) — 写作",
      eo: "Expression Orale (EO) — 口语",
      format: "",
      questions: "",
      duration: "",
      score: "",
    },
    scoringNote: (
      <>
        TCF Canada <strong>没有总分</strong>。每科独立报告，独立对照到 CEFR 等级。要符合某个 CLB 级别（用于 Express Entry 或 PEQ），你必须
        <em>每一科</em>都达到最低分数。
      </>
    ),
    h2cefr: "TCF Canada 原始分 → CEFR 等级",
    cefrIntro:
      "听力（CO）和阅读（CE）原始分按下表对照 CEFR 等级（FEI 官方）。写作（EE）和口语（EO）直接使用 0–20 分的等级对照。",
    cefrTable: {
      headers: ["CEFR 等级", "CO / CE（分）", "EE / EO（分）"],
      c2: "C2 — 精通",
      c1: "C1 — 高级",
      b2: "B2 — 中高级",
      b1: "B1 — 中级",
      a2: "A2 — 初级",
      a1: "A1 — 入门",
    },
    h2clb: "TCF Canada 原始分 → CLB / NCLC（IRCC 官方表）",
    clbIntro: (
      <>
        这是 IRCC 在 Express Entry 以及所有联邦移民项目中使用的官方对照表。完整最新版本请参考
        {IRCC("IRCC 官方语言测试指引")}。
      </>
    ),
    clbTable: {
      headers: [
        "CLB / NCLC",
        "CE（阅读）",
        "CO（听力）",
        "EE（写作）",
        "EO（口语）",
      ],
    },
    clbNote: (
      <>
        <strong>注：</strong>CLB（加拿大语言基准）和 NCLC（加拿大法语水平基准）是同一个 1–12 级量表，分别用于英语和法语。NCLC 7 = CLB 7。上表所有 CLB 阈值对 TCF Canada 同样有效。
      </>
    ),
    h2pr: "加拿大移民需要多少分？",
    prFswTitle: "Express Entry — 联邦技术移民（FSW）",
    prFswBody: (
      <>
        联邦技术移民要求英语或法语四个科目至少{" "}
        <strong>全部达到 CLB 7</strong>。如果申报法语为
        <em>第一官方语言</em>、英语为第二官方语言，双语能力最多可获
        <strong>50 分额外 CRS 加分</strong>，对有法语背景的申请人来说是显著优势。
      </>
    ),
    prQswTitle: "魁北克技术移民（QSW）/ PEQ",
    prQswBody: (
      <>
        魁省项目要求口语科目（CO + EO）至少达到{" "}
        <strong>NCLC 7</strong>。部分项目写作科目（CE + EE）NCLC 5 即可。魁北克经验类移民（Programme de l&apos;expérience québécoise，PEQ）也接受口语理解与表达 NCLC 7。
      </>
    ),
    prCitizenshipTitle: "加拿大入籍",
    prCitizenshipBody: (
      <>
        入籍申请要求口语与听力（EO 和 CO）达到{" "}
        <strong>CLB 4</strong>。入籍不考察读写，但申请人可通过学历或工作经历证明法语能力。
      </>
    ),
    h2help: "HiTCF 如何帮你达到目标分数",
    helpIntro: (
      <>
        HiTCF 收录了 <strong>1,306 套真题</strong>、
        <strong>8,397 道题目</strong>，完整覆盖 A1 到 C2 全部 CEFR 等级：
      </>
    ),
    helpList: [
      "42 套听力真题（1,638 道 CO 题），每句音频均由 OpenAI Whisper 生成独立时间戳——每一句都能单独回放。",
      "42 套阅读真题（1,638 道 CE 题），点击查词 + 每题完整讲解。",
      "702 套口语真题（3,536 道 EO 题，覆盖 Tâche 1、2、3），AI 评分基于 Azure Speech 发音评估 + Grok 大模型，按 TCF 口语 6 维度官方评分细则打分。",
      "520 套写作真题（1,540 道 EE 题），AI 批改基于 TCF 写作 4 维度官方评分细则。",
    ],
    helpClosing: (
      <>
        每道练习题都显示对应的 CEFR 等级和 CLB/NCLC 区间，你随时知道自己离目标分数有多远。注册即送 7 天 Pro 体验，无需信用卡。
      </>
    ),
    cta: "立即开始练习 →",
    h2faq: "常见问题",
    faqs: [
      {
        q: "TCF Canada 达到 CLB 7 需要多少分？",
        a: (
          <>
            CLB 7 要求：<strong>阅读（CE）453–498 分</strong>、
            <strong>听力（CO）458–502 分</strong>、
            <strong>写作（EE）10–11 分</strong>、
            <strong>口语（EO）10–11 分</strong>。CLB 7 是 Express Entry 联邦技术移民绝大多数项目的法语最低要求，也是双语 CRS 加分的门槛。
          </>
        ),
      },
      {
        q: "NCLC 和 CLB 是一回事吗？",
        a: (
          <>
            是的。NCLC 是 CLB 的法语版本，使用同一个 1–12 级量表。NCLC 7 = CLB 7。IRCC 文件中会根据考试语言互换使用：法语考试报告成绩用 NCLC，英语考试用 CLB。
          </>
        ),
      },
      {
        q: "TCF Canada 和普通 TCF 有什么区别？",
        a: (
          <>
            TCF Canada 是为加拿大移民与入籍专门设计的 TCF 版本。四个科目（CO、CE、EE、EO）全部必考，使用加拿大评分体系，直接被 IRCC 认可。普通 TCF 按用途分多个版本，用于学术录取、签证申请等其他场景，互相不可替代。
          </>
        ),
      },
      {
        q: "TCF Canada 成绩有效期多长？",
        a: (
          <>
            TCF Canada 成绩自考试日起<strong>有效期两年</strong>。两年后如需再次提交 Express Entry 档案或其他 IRCC 申请，必须重新考试。
          </>
        ),
      },
      {
        q: "加拿大哪里可以考 TCF Canada？",
        a: (
          <>
            TCF Canada 在加拿大的授权考点主要是各城市的 Alliance Française（法盟），覆盖渥太华、卡尔加里、温哥华、多伦多、蒙特利尔以及其他主要城市。考位非常紧张，HiTCF 为渥太华、卡尔加里、温哥华提供
            <Link href="/seat-monitor">实时考位监控</Link>，每 15 秒刷新一次。
          </>
        ),
      },
    ],
    sourcesLabel: "来源",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")}、
        {IRCC("IRCC — 考试成绩与 CLB 等级")}
        。本页由 HiTCF 独立维护，HiTCF 与 IRCC、FEI 无任何隶属关系。申请前请务必对照官方最新要求。
      </>
    ),
  },
  fr: {
    metaTitle:
      "Tableau des scores TCF Canada : conversion CECRL, NCLC, CLB (2026)",
    metaDescription:
      "Conversion complète des scores TCF Canada : points bruts vers les niveaux CECRL (A1–C2) et vers CLB / NCLC pour la résidence permanente canadienne, Entrée express, QSW et PEQ. Tableau officiel IRCC, mis à jour le " +
      LAST_UPDATED +
      ".",
    h1: "Tableau des scores TCF Canada : conversion CECRL, CLB et NCLC",
    lead: (
      <>
        Le <strong>TCF Canada</strong> (
        <em>Test de connaissance du français pour le Canada</em>) est
        l&apos;examen de compétence en français reconnu par{" "}
        {IRCC("Immigration, Réfugiés et Citoyenneté Canada (IRCC)")} pour
        les demandes de résidence permanente et de citoyenneté. Il est
        administré par {FEI("France Éducation International (FEI)")}.
        Cette page présente la conversion complète entre les scores
        bruts du TCF Canada, les niveaux CECRL (A1 à C2) et l&apos;échelle
        NCLC (Niveaux de compétence linguistique canadiens) / CLB
        (Canadian Language Benchmarks) de 1 à 12.
      </>
    ),
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdatedSuffix: (
      <>
        . Les tableaux ci-dessous proviennent des publications
        officielles d&apos;IRCC et de FEI. HiTCF est une plateforme de
        préparation indépendante sans affiliation avec IRCC ou FEI.
      </>
    ),
    h2scoring: "Comment le TCF Canada est noté",
    scoringIntro:
      "Le TCF Canada comprend quatre épreuves obligatoires, notées séparément :",
    scoringTable: {
      headers: ["Épreuve", "Format", "Questions", "Durée", "Plage de notes"],
      co: "Compréhension Orale (CO) — Écoute",
      ce: "Compréhension Écrite (CE) — Lecture",
      ee: "Expression Écrite (EE) — Rédaction",
      eo: "Expression Orale (EO) — Oral",
      format: "",
      questions: "",
      duration: "",
      score: "",
    },
    scoringNote: (
      <>
        Il n&apos;y a <strong>pas de note totale</strong>. Chaque
        compétence est rapportée séparément et correspond à son propre
        niveau CECRL. Pour atteindre un niveau CLB donné (pour
        l&apos;Entrée express ou le PEQ), vous devez obtenir la note
        minimum dans <em>chaque</em> compétence.
      </>
    ),
    h2cefr: "Score TCF Canada → niveau CECRL",
    cefrIntro:
      "Les scores bruts de CO/CE correspondent aux niveaux CECRL selon le tableau officiel de FEI. La correspondance EE/EO utilise directement l'échelle 0–20.",
    cefrTable: {
      headers: ["Niveau CECRL", "CO / CE (points)", "EE / EO (points)"],
      c2: "C2 — Maîtrise",
      c1: "C1 — Avancé",
      b2: "B2 — Intermédiaire avancé",
      b1: "B1 — Intermédiaire",
      a2: "A2 — Élémentaire",
      a1: "A1 — Débutant",
    },
    h2clb: "Score TCF Canada → CLB / NCLC (tableau officiel IRCC)",
    clbIntro: (
      <>
        Il s&apos;agit du tableau utilisé par IRCC pour l&apos;Entrée
        express et tous les programmes fédéraux d&apos;immigration.
        Consultez {IRCC("la référence officielle IRCC sur les tests de langue")}{" "}
        pour la version en vigueur.
      </>
    ),
    clbTable: {
      headers: [
        "CLB / NCLC",
        "CE (Lecture)",
        "CO (Écoute)",
        "EE (Rédaction)",
        "EO (Oral)",
      ],
    },
    clbNote: (
      <>
        <strong>Remarque :</strong> CLB (Canadian Language Benchmarks)
        et NCLC (Niveaux de compétence linguistique canadiens) désignent
        la même échelle, appliquée respectivement à l&apos;anglais et au
        français. NCLC 7 = CLB 7. Tous les seuils CLB ci-dessus
        s&apos;appliquent au TCF Canada.
      </>
    ),
    h2pr: "Quel score pour la résidence permanente canadienne ?",
    prFswTitle: "Entrée express — Travailleur qualifié fédéral (TQF)",
    prFswBody: (
      <>
        Vous devez obtenir au minimum{" "}
        <strong>CLB 7 dans les quatre compétences</strong> en anglais ou
        en français pour être admissible au programme des travailleurs
        qualifiés fédéraux. Déclarer le français comme{" "}
        <em>première langue officielle</em> et l&apos;anglais comme
        seconde permet d&apos;obtenir jusqu&apos;à{" "}
        <strong>50 points CRS supplémentaires</strong> pour le
        bilinguisme — un avantage majeur pour les candidats
        francophones.
      </>
    ),
    prQswTitle: "Travailleur qualifié du Québec (TQQ) / PEQ",
    prQswBody: (
      <>
        Les programmes du Québec exigent au minimum{" "}
        <strong>NCLC 7 à l&apos;oral</strong> (CO + EO). Pour certains
        volets, NCLC 5 à l&apos;écrit (CE + EE) suffit. Le Programme de
        l&apos;expérience québécoise (PEQ) accepte également NCLC 7 en
        compréhension et production orales.
      </>
    ),
    prCitizenshipTitle: "Citoyenneté canadienne",
    prCitizenshipBody: (
      <>
        La citoyenneté exige{" "}
        <strong>CLB 4 à l&apos;expression orale et à la
        compréhension orale</strong>{" "}
        (EO et CO). L&apos;écriture et la lecture ne sont pas évaluées
        pour les demandes de citoyenneté, mais la compétence démontrée
        par études ou emploi est prise en compte.
      </>
    ),
    h2help: "Comment HiTCF vous aide à atteindre ces seuils",
    helpIntro: (
      <>
        HiTCF propose <strong>1 306 séries de tests</strong> et{" "}
        <strong>8 397 questions</strong> couvrant tous les niveaux CECRL
        de A1 à C2 :
      </>
    ),
    helpList: [
      "42 séries d'écoute (1 638 questions CO) avec horodatages phrase par phrase générés par OpenAI Whisper — chaque phrase peut être réécoutée indépendamment.",
      "42 séries de lecture (1 638 questions CE) avec recherche de vocabulaire au clic et explications détaillées pour chaque réponse.",
      "702 séries de sujets oraux (3 536 tâches EO couvrant Tâche 1, 2 et 3) avec évaluation IA basée sur Azure Speech et Grok, notée selon la grille officielle des 6 critères TCF.",
      "520 séries de tâches écrites (1 540 tâches EE) avec rétroaction IA selon la grille officielle des 4 critères TCF.",
    ],
    helpClosing: (
      <>
        Chaque question d&apos;entraînement affiche le niveau CECRL
        estimé et l&apos;équivalence CLB/NCLC correspondante pour que
        vous sachiez exactement où vous en êtes par rapport aux seuils
        visés. Essai Pro gratuit de 7 jours à l&apos;inscription, sans
        carte bancaire.
      </>
    ),
    cta: "Commencer à s'entraîner →",
    h2faq: "Questions fréquentes",
    faqs: [
      {
        q: "Quel score TCF Canada pour atteindre CLB 7 ?",
        a: (
          <>
            CLB 7 exige : <strong>Compréhension Écrite 453–498 points</strong>,{" "}
            <strong>Compréhension Orale 458–502 points</strong>,{" "}
            <strong>Expression Écrite 10–11 points</strong> et{" "}
            <strong>Expression Orale 10–11 points</strong>. CLB 7 est le
            niveau de français minimum requis pour la plupart des
            programmes Entrée express de travailleurs qualifiés fédéraux
            et pour les points CRS complets de bilinguisme.
          </>
        ),
      },
      {
        q: "NCLC et CLB sont-ils identiques ?",
        a: (
          <>
            Oui. NCLC est l&apos;équivalent francophone de CLB, avec la
            même échelle 1–12. NCLC 7 = CLB 7. IRCC utilise les deux
            termes de manière interchangeable selon que le test est
            passé en français (NCLC) ou en anglais (CLB).
          </>
        ),
      },
      {
        q: "Quelle est la différence entre TCF Canada et TCF ?",
        a: (
          <>
            Le TCF Canada est une version spécifique du Test de
            Connaissance du Français conçue pour le contexte de
            l&apos;immigration et de la citoyenneté canadiennes. Les
            quatre compétences (CO, CE, EE, EO) sont obligatoires,
            notées sur l&apos;échelle canadienne et reconnues par IRCC.
            Les autres TCF varient selon la version et servent à des
            fins différentes (admission universitaire, demandes de visa,
            etc.).
          </>
        ),
      },
      {
        q: "Combien de temps les scores TCF Canada sont-ils valides ?",
        a: (
          <>
            Les scores TCF Canada sont valides <strong>deux ans</strong>{" "}
            à compter de la date de l&apos;examen. Après deux ans, vous
            devez repasser le test pour soumettre un nouveau profil
            Entrée express ou toute autre demande IRCC.
          </>
        ),
      },
      {
        q: "Où passer le TCF Canada au Canada ?",
        a: (
          <>
            Le TCF Canada est offert dans les centres accrédités de
            l&apos;Alliance Française à Ottawa, Calgary, Vancouver,
            Toronto, Montréal et plusieurs autres villes canadiennes.
            Les places sont limitées et s&apos;épuisent rapidement —
            HiTCF propose un{" "}
            <Link href="/seat-monitor">
              moniteur de places en temps réel
            </Link>{" "}
            pour Ottawa, Calgary et Vancouver qui se rafraîchit toutes
            les 15 secondes.
          </>
        ),
      },
    ],
    sourcesLabel: "Sources",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")},{" "}
        {IRCC("IRCC — Résultats de test et niveaux CLB")}. Cette page est
        maintenue par HiTCF, plateforme de préparation indépendante au
        TCF Canada. Nous ne sommes affiliés ni à IRCC ni à FEI.
        Vérifiez toujours les sources officielles avant de soumettre
        votre demande.
      </>
    ),
  },
  ar: {
    metaTitle: "جدول درجات TCF Canada: تحويل CEFR و CLB و NCLC (2026)",
    metaDescription:
      "التحويل الكامل لدرجات TCF Canada: من الدرجات الخام إلى مستويات CEFR (A1–C2) ثم إلى CLB / NCLC لطلبات الإقامة الدائمة الكندية و Express Entry و QSW و PEQ. جدول IRCC الرسمي، آخر تحديث في " +
      LAST_UPDATED +
      ".",
    h1: "جدول درجات TCF Canada: تحويل CEFR و CLB و NCLC",
    lead: (
      <>
        يعد <strong>TCF Canada</strong> (
        <em>Test de connaissance du français pour le Canada</em>) اختبار الكفاءة في اللغة الفرنسية المعترف به من قبل {IRCC("وزارة الهجرة واللاجئين والمواطنة الكندية (IRCC)")} لطلبات الإقامة الدائمة والمواطنة. يتم إدارته من قبل {FEI("France Éducation International (FEI)")}. تعرض هذه الصفحة التحويل الكامل بين الدرجات الخام لـ TCF Canada ومستويات CEFR (من A1 إلى C2) ومقياس CLB (Canadian Language Benchmarks) / NCLC (Niveaux de compétence linguistique canadiens) من 1 إلى 12.
      </>
    ),
    lastUpdatedLabel: "آخر تحديث",
    lastUpdatedSuffix: (
      <>
        . الجداول المصدرية أدناه منشورة من IRCC و FEI. HiTCF منصة تحضير مستقلة تابعة لطرف ثالث، ولا تتبع IRCC أو FEI.
      </>
    ),
    h2scoring: "كيف يتم تصحيح TCF Canada",
    scoringIntro: "يحتوي TCF Canada على أربعة أقسام إلزامية، يتم تقييم كل منها بشكل مستقل:",
    scoringTable: {
      headers: ["القسم", "التنسيق", "الأسئلة", "المدة", "نطاق الدرجات"],
      co: "Compréhension Orale (CO) — الاستماع",
      ce: "Compréhension Écrite (CE) — القراءة",
      ee: "Expression Écrite (EE) — الكتابة",
      eo: "Expression Orale (EO) — التحدث",
      format: "",
      questions: "",
      duration: "",
      score: "",
    },
    scoringNote: (
      <>
        <strong>لا توجد درجة إجمالية</strong>. يتم الإبلاغ عن كل مهارة بشكل منفصل وتحويلها إلى مستوى CEFR الخاص بها. للتأهل لمستوى CLB معين (لـ Express Entry أو PEQ)، يجب أن تحقق الحد الأدنى للدرجات في <em>كل</em> مهارة.
      </>
    ),
    h2cefr: "درجة TCF Canada ← مستوى CEFR",
    cefrIntro:
      "يتم تحويل الدرجات الخام لـ CO/CE إلى مستويات CEFR كما يلي (وفقًا لـ FEI). يستخدم تحويل EE/EO مقياس 0–20 مباشرة.",
    cefrTable: {
      headers: ["مستوى CEFR", "CO / CE (نقاط)", "EE / EO (نقاط)"],
      c2: "C2 — إتقان",
      c1: "C1 — متقدم",
      b2: "B2 — متوسط عالٍ",
      b1: "B1 — متوسط",
      a2: "A2 — ابتدائي",
      a1: "A1 — مبتدئ",
    },
    h2clb: "درجة TCF Canada ← CLB / NCLC (جدول IRCC الرسمي)",
    clbIntro: (
      <>
        هذا هو الجدول الذي تستخدمه IRCC لـ Express Entry وجميع برامج الهجرة الفيدرالية. راجع {IRCC("المرجع الرسمي لـ IRCC حول اختبارات اللغة")} للحصول على النسخة الموثوقة الحالية.
      </>
    ),
    clbTable: {
      headers: [
        "CLB / NCLC",
        "CE (القراءة)",
        "CO (الاستماع)",
        "EE (الكتابة)",
        "EO (التحدث)",
      ],
    },
    clbNote: (
      <>
        <strong>ملاحظة:</strong> يشير CLB (Canadian Language Benchmarks) و NCLC (Niveaux de compétence linguistique canadiens) إلى نفس المقياس، المطبق على الإنجليزية والفرنسية على التوالي. NCLC 7 = CLB 7. جميع عتبات CLB المذكورة أعلاه تنطبق على TCF Canada بغض النظر عن المصطلح المستخدم.
      </>
    ),
    h2pr: "ما الدرجة المطلوبة للإقامة الدائمة الكندية؟",
    prFswTitle: "Express Entry — العامل الماهر الفيدرالي (FSW)",
    prFswBody: (
      <>
        تحتاج إلى حد أدنى <strong>CLB 7 في جميع المهارات الأربع</strong> باللغة الإنجليزية أو الفرنسية لتكون مؤهلاً لبرنامج العمال المهرة الفيدرالي. إعلان الفرنسية كلغة رسمية <em>أولى</em> والإنجليزية كثانية يمنحك ما يصل إلى <strong>50 نقطة CRS إضافية</strong> للقدرة ثنائية اللغة — ميزة كبيرة للمرشحين ذوي الخلفية الفرنسية.
      </>
    ),
    prQswTitle: "العامل الماهر في كيبيك (QSW) / PEQ",
    prQswBody: (
      <>
        تتطلب برامج كيبيك حد أدنى <strong>NCLC 7 في المهارات الشفوية</strong> (CO + EO). بالنسبة لبعض الفئات، يكفي NCLC 5 في المهارات الكتابية (CE + EE). يقبل برنامج Programme de l&apos;expérience québécoise (PEQ) أيضًا NCLC 7 في الفهم والإنتاج الشفوي.
      </>
    ),
    prCitizenshipTitle: "المواطنة الكندية",
    prCitizenshipBody: (
      <>
        تتطلب المواطنة <strong>CLB 4 في التحدث والاستماع</strong> (EO و CO). لا يتم اختبار الكتابة والقراءة لطلبات المواطنة، ولكن يتم مراعاة الكفاءة المثبتة من خلال التعليم أو العمل.
      </>
    ),
    h2help: "كيف تساعدك HiTCF في الوصول إلى هذه المعايير",
    helpIntro: (
      <>
        تقدم HiTCF <strong>1,306 مجموعة اختبار</strong> و <strong>8,397 سؤالاً</strong> تغطي جميع مستويات CEFR من A1 إلى C2:
      </>
    ),
    helpList: [
      "42 مجموعة اختبار استماع (1,638 سؤال CO) مع توقيتات صوتية على مستوى الجملة تم إنشاؤها بواسطة OpenAI Whisper — يمكن إعادة تشغيل كل جملة بشكل مستقل.",
      "42 مجموعة اختبار قراءة (1,638 سؤال CE) مع بحث في المفردات بالنقر وشروحات كاملة لكل إجابة.",
      "702 مجموعة مواضيع شفوية (3,536 مهمة EO عبر Tâche 1 و 2 و 3) مع تقييم بالذكاء الاصطناعي مدعوم من Azure Speech و Grok، ومقيم وفقًا لمعايير TCF الرسمية الستة.",
      "520 مجموعة مهام كتابية (1,540 مهمة EE) مع ملاحظات ذكاء اصطناعي وفقًا لمعايير TCF الرسمية الأربعة.",
    ],
    helpClosing: (
      <>
        يعرض كل سؤال تدريبي مستوى CEFR المقدر ونطاق CLB/NCLC المقابل، حتى تعرف بالضبط أين تقف مقابل المعايير المذكورة أعلاه. يحصل المستخدمون الجدد على نسخة Pro تجريبية لمدة 7 أيام عند التسجيل — دون الحاجة إلى بطاقة ائتمان.
      </>
    ),
    cta: "ابدأ التدريب الآن ←",
    h2faq: "الأسئلة الشائعة",
    faqs: [
      {
        q: "ما درجة TCF Canada المطلوبة لـ CLB 7؟",
        a: (
          <>
            يتطلب CLB 7: <strong>Compréhension Écrite 453–498 نقطة</strong>، و <strong>Compréhension Orale 458–502 نقطة</strong>، و <strong>Expression Écrite 10–11 نقطة</strong>، و <strong>Expression Orale 10–11 نقطة</strong>. CLB 7 هو الحد الأدنى من كفاءة اللغة الفرنسية المطلوبة لمعظم برامج Express Entry للعمال المهرة الفيدراليين ولنقاط CRS ثنائية اللغة الكاملة.
          </>
        ),
      },
      {
        q: "هل NCLC هو نفسه CLB؟",
        a: (
          <>
            نعم. NCLC هو المكافئ الفرنسي لـ CLB، ويستخدم نفس مقياس 1–12. NCLC 7 = CLB 7. تستخدم IRCC المصطلحين بالتبادل اعتمادًا على ما إذا كان الاختبار باللغة الفرنسية (NCLC) أو الإنجليزية (CLB).
          </>
        ),
      },
      {
        q: "كيف يختلف TCF Canada عن TCF؟",
        a: (
          <>
            TCF Canada هو إصدار خاص من Test de Connaissance du Français مصمم خصيصًا لسياق الهجرة والمواطنة الكندية. جميع المهارات الأربع (CO و CE و EE و EO) إلزامية، ومصححة بالمقياس الكندي، ومعترف بها من قبل IRCC. تختلف اختبارات TCF العادية حسب الإصدار وتستخدم لأغراض أخرى (القبول الأكاديمي، طلبات التأشيرة، إلخ).
          </>
        ),
      },
      {
        q: "كم مدة صلاحية درجات TCF Canada؟",
        a: (
          <>
            درجات TCF Canada صالحة لمدة <strong>سنتين</strong> من تاريخ الاختبار. بعد سنتين، يجب إعادة الاختبار لتقديم ملف Express Entry جديد أو أي طلب IRCC آخر.
          </>
        ),
      },
      {
        q: "أين يمكنني إجراء TCF Canada في كندا؟",
        a: (
          <>
            يقدم TCF Canada في مراكز Alliance Française المعتمدة في أوتاوا وكالجاري وفانكوفر وتورنتو ومونتريال وعدة مدن كندية أخرى. المقاعد محدودة وتمتلئ بسرعة — توفر HiTCF{" "}
            <Link href="/seat-monitor">مراقب مقاعد في الوقت الحقيقي</Link>
            {" "}لأوتاوا وكالجاري وفانكوفر يتم تحديثه كل 15 ثانية.
          </>
        ),
      },
    ],
    sourcesLabel: "المصادر",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")}،{" "}
        {IRCC("IRCC — نتائج الاختبار ومستويات CLB")}. هذه الصفحة تتم صيانتها بواسطة HiTCF، منصة تحضير مستقلة لـ TCF Canada. نحن لسنا تابعين لـ IRCC أو FEI. يرجى التحقق من المصادر الرسمية للحصول على أحدث العتبات قبل تقديم طلبك.
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
      title: c.metaTitle,
      description: c.metaDescription,
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
  const c = CONTENT[(locale as Locale) in CONTENT ? (locale as Locale) : "en"];
  const pageUrl = `${SITE_URL}/${locale}/guide/tcf-score-chart`;

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
        mainEntity: c.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            // Keep English canonical FAQ answer for AI ingestion even in
            // localized pages — avoids the need for translated answer text
            // in structured data. The visible page still shows localized FAQ.
            text:
              locale === "en"
                ? undefined
                : undefined,
          },
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
        {c.lastUpdatedSuffix}
      </p>

      <h2>{c.h2scoring}</h2>
      <p>{c.scoringIntro}</p>

      <table>
        <thead>
          <tr>
            {c.scoringTable.headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>{c.scoringTable.co}</strong>
            </td>
            <td>Multiple choice</td>
            <td>39</td>
            <td>35 min</td>
            <td>100–699</td>
          </tr>
          <tr>
            <td>
              <strong>{c.scoringTable.ce}</strong>
            </td>
            <td>Multiple choice</td>
            <td>39</td>
            <td>60 min</td>
            <td>100–699</td>
          </tr>
          <tr>
            <td>
              <strong>{c.scoringTable.ee}</strong>
            </td>
            <td>3 tasks</td>
            <td>—</td>
            <td>60 min</td>
            <td>0–20</td>
          </tr>
          <tr>
            <td>
              <strong>{c.scoringTable.eo}</strong>
            </td>
            <td>3 tasks</td>
            <td>—</td>
            <td>12 min</td>
            <td>0–20</td>
          </tr>
        </tbody>
      </table>

      <p>{c.scoringNote}</p>

      <h2>{c.h2cefr}</h2>
      <p>{c.cefrIntro}</p>

      <table>
        <thead>
          <tr>
            {c.cefrTable.headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>{c.cefrTable.c2}</strong>
            </td>
            <td>600–699</td>
            <td>18–20</td>
          </tr>
          <tr>
            <td>
              <strong>{c.cefrTable.c1}</strong>
            </td>
            <td>500–599</td>
            <td>14–17</td>
          </tr>
          <tr>
            <td>
              <strong>{c.cefrTable.b2}</strong>
            </td>
            <td>400–499</td>
            <td>10–13</td>
          </tr>
          <tr>
            <td>
              <strong>{c.cefrTable.b1}</strong>
            </td>
            <td>300–399</td>
            <td>6–9</td>
          </tr>
          <tr>
            <td>
              <strong>{c.cefrTable.a2}</strong>
            </td>
            <td>200–299</td>
            <td>4–5</td>
          </tr>
          <tr>
            <td>
              <strong>{c.cefrTable.a1}</strong>
            </td>
            <td>100–199</td>
            <td>1–3</td>
          </tr>
        </tbody>
      </table>

      <h2>{c.h2clb}</h2>
      <p>{c.clbIntro}</p>

      <table>
        <thead>
          <tr>
            {c.clbTable.headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
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

      <p>{c.clbNote}</p>

      <h2>{c.h2pr}</h2>

      <h3>{c.prFswTitle}</h3>
      <p>{c.prFswBody}</p>

      <h3>{c.prQswTitle}</h3>
      <p>{c.prQswBody}</p>

      <h3>{c.prCitizenshipTitle}</h3>
      <p>{c.prCitizenshipBody}</p>

      <h2>{c.h2help}</h2>
      <p>{c.helpIntro}</p>
      <ul>
        {c.helpList.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{c.helpClosing}</p>

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
