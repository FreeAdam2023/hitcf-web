import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

const SITE_URL = "https://hitcf.com";
const LAST_UPDATED = "2026-04-05";

type Locale = "en" | "zh" | "fr" | "ar";

const FEI_URL = "https://www.france-education-international.fr/test/tcf-canada";
const IRCC_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/language-proof.html";

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

interface Content {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: React.ReactNode;
  lastUpdatedLabel: string;
  lastUpdatedBody: React.ReactNode;
  h2pre: string;
  preList: React.ReactNode[];
  h2bring: string;
  bringHeaders: [string, string, string];
  bringRows: { required: string[]; allowed: string[]; notAllowed: string[] };
  phoneNote: React.ReactNode;
  h2arrival: string;
  arrivalIntro: React.ReactNode;
  arrivalSteps: React.ReactNode[];
  h2sections: string;
  sectionsIntro: string;
  sectionsHeaders: [string, string, string, string];
  sectionsRows: {
    coName: string;
    coDuration: string;
    coFormat: string;
    coNote: string;
    ceName: string;
    ceDuration: string;
    ceFormat: string;
    ceNote: string;
    eeName: string;
    eeDuration: string;
    eeFormat: string;
    eeNote: string;
    eoName: string;
    eoDuration: string;
    eoFormat: string;
    eoNote: string;
  };
  breaksNote: React.ReactNode;
  h2mistakes: string;
  mistake1Title: string;
  mistake1Body: React.ReactNode;
  mistake2Title: string;
  mistake2Body: React.ReactNode;
  mistake3Title: string;
  mistake3Body: React.ReactNode;
  mistake4Title: string;
  mistake4Body: React.ReactNode;
  h2after: string;
  afterList: React.ReactNode[];
  validityNote: React.ReactNode;
  h2help: string;
  helpIntro: React.ReactNode;
  helpList: React.ReactNode[];
  helpClosing: React.ReactNode;
  cta: string;
  h2faq: string;
  faqs: { q: string; a: React.ReactNode }[];
  sourcesLabel: string;
  sourcesBody: React.ReactNode;
}

const CONTENT: Record<Locale, Content> = {
  en: {
    metaTitle: "TCF Canada Exam Day: Complete Walkthrough (2026)",
    metaDescription:
      "Everything you need to know about TCF Canada exam day: what to bring, arrival timing, check-in process, section order, breaks, common mistakes, and when results arrive. Last updated " +
      LAST_UPDATED +
      ".",
    h1: "TCF Canada Exam Day: Complete Walkthrough",
    lead: (
      <>
        After months of preparation, the TCF Canada exam itself is a
        surprisingly short event — around 3 hours of focused testing at
        an authorized centre. But the logistics of exam day trip up more
        candidates than the questions do. This guide walks you through
        what to bring, when to arrive, what happens during the exam,
        and what to expect afterwards. All information here is general —
        your specific centre&apos;s rules in the confirmation email
        always take precedence.
      </>
    ),
    lastUpdatedLabel: "Last updated",
    lastUpdatedBody: (
      <>
        . TCF Canada is administered by{" "}
        {FEI("France Éducation International (FEI)")} through a global
        network of authorized centres, including Alliance Française
        locations in most major Canadian cities.
      </>
    ),
    h2pre: "48 hours before the exam",
    preList: [
      <>
        <strong>Re-read your confirmation email.</strong> Verify the
        exact centre address (some cities have multiple campuses), the
        scheduled arrival time (not the exam start time — arrival is
        usually 30 minutes earlier), and the list of required
        documents.
      </>,
      <>
        <strong>Check your photo ID.</strong> The name on your ID must
        match <em>exactly</em> the name on your registration. If you
        booked under your maiden name but your current passport shows
        your married name, contact the centre immediately. Mismatches
        are a common reason candidates are turned away at the door.
      </>,
      <>
        <strong>Plan your route.</strong> If you have not been to the
        centre before, do a dry run the day before. Downtown parking
        in cities like Ottawa or Vancouver can eat 15 minutes on test
        day.
      </>,
      <>
        <strong>Light final review only.</strong> Do not cram new
        material. A 30-minute review of your weakest skill is
        productive; a 4-hour marathon will leave you exhausted for the
        exam itself.
      </>,
    ],
    h2bring: "What to bring",
    bringHeaders: ["Required", "Allowed", "Not allowed"],
    bringRows: {
      required: [
        "Valid photo ID (passport or government-issued)",
        "Printed confirmation email",
        "Two black or blue pens (paper-based centres)",
      ],
      allowed: [
        "Water bottle (clear, label-free at strict centres)",
        "Small snack (stored outside the room)",
        "Lip balm, tissues",
        "Warm layer (exam rooms are often cold)",
      ],
      notAllowed: [
        "Phone, smartwatch, any electronic device",
        "Notes, books, dictionaries",
        "Earplugs (unless pre-approved accommodation)",
        "Hats or hoods that obscure your face during ID check",
        "Backpacks or bags inside the exam room",
      ],
    },
    phoneNote: (
      <>
        <strong>Phones:</strong> Every candidate we talk to
        underestimates how strict centres are about phones. Most
        centres require phones to be powered off (not silent) and
        stored in a locker outside the exam room. A phone buzzing in
        your pocket during the listening section has ended careers.
        Leave it in the locker.
      </>
    ),
    h2arrival: "Arrival and check-in",
    arrivalIntro: (
      <>
        Arrive <strong>30 to 45 minutes</strong> before the scheduled
        exam start time. Check-in typically involves:
      </>
    ),
    arrivalSteps: [
      <>
        <strong>Signing in at the reception desk.</strong> The
        invigilator will verify your ID against the candidate list.
        They may take a photo of you for the score report.
      </>,
      <>
        <strong>Locker assignment.</strong> You store your phone,
        wallet, backpack, and anything else not explicitly allowed in
        the exam room.
      </>,
      <>
        <strong>Seating.</strong> You will be assigned a specific seat
        or computer station. Paper-based candidates find their answer
        sheet already placed; computer-based candidates log in with a
        provided username and code.
      </>,
      <>
        <strong>Instructions briefing.</strong> The invigilator reads
        the exam rules in French (and sometimes English). This is
        listening practice in itself — pay attention.
      </>,
    ],
    h2sections: "The four sections in order",
    sectionsIntro:
      "Exact scheduling varies, but the standard order at most Canadian centres is:",
    sectionsHeaders: ["Section", "Duration", "Format", "Notes"],
    sectionsRows: {
      coName: "1. Compréhension Orale (CO) — Listening",
      coDuration: "35 min",
      coFormat: "39 multiple-choice questions",
      coNote: "Audio plays once only. No replays. Scratch paper usually provided.",
      ceName: "2. Compréhension Écrite (CE) — Reading",
      ceDuration: "60 min",
      ceFormat: "39 multiple-choice questions",
      ceNote: "Questions get harder from A1 (Q1) through C2 (Q39). Skip and return if you get stuck on B2/C1.",
      eeName: "3. Expression Écrite (EE) — Writing",
      eeDuration: "60 min",
      eeFormat: "3 writing tasks",
      eeNote: "Tâche 1: short message (~60 words). Tâche 2: article (~120 words). Tâche 3: argumentative (~180 words).",
      eoName: "4. Expression Orale (EO) — Speaking",
      eoDuration: "12 min",
      eoFormat: "3 speaking tasks with an examiner",
      eoNote: "Face-to-face (or video call at some centres). Recorded for grading. No preparation time between tasks.",
    },
    breaksNote: (
      <>
        <strong>Breaks:</strong> Centres usually offer short breaks
        between sections, but they are not guaranteed and are typically
        under 10 minutes. Do not plan to eat a full meal mid-exam. A
        granola bar and water between CE and EE is realistic; a
        cafeteria visit is not.
      </>
    ),
    h2mistakes: "During the exam: common mistakes",
    mistake1Title: "1. Spending too long on one hard question",
    mistake1Body: (
      <>
        TCF Canada rewards breadth, not depth. If you spend 5 minutes on
        Q18 of reading while 21 easier questions remain, you are
        trading 1 possible correct answer for up to 21 abandoned ones.
        Skip anything you cannot answer in 90 seconds and come back if
        time permits. This is the single most common strategy mistake.
      </>
    ),
    mistake2Title: "2. Second-guessing on the bubble sheet (paper-based)",
    mistake2Body: (
      <>
        Research on standardized testing shows candidates change
        correct answers to wrong ones more often than the reverse.
        Trust your first instinct unless you have a specific reason to
        doubt it.
      </>
    ),
    mistake3Title: "3. Writing too little (or too much) on EE",
    mistake3Body: (
      <>
        The suggested word counts for Expression Écrite tasks are not
        decorative. Under-writing is penalized more heavily than
        over-writing, but both hurt. Aim for exactly the target length
        ± 10%. Practice this on HiTCF&apos;s{" "}
        <Link href="/tests?type=writing">writing task bank</Link> until
        you can hit the word count without consciously counting.
      </>
    ),
    mistake4Title: "4. Freezing on EO Tâche 2 or 3",
    mistake4Body: (
      <>
        The hardest speaking task for most candidates is Tâche 2
        (information gathering) or Tâche 3 (opinion persuasion). If you
        blank, speak about <em>the topic in general terms</em> rather
        than staying silent. Examiners grade your range, fluency, and
        task completion — saying something imperfect beats saying
        nothing.
      </>
    ),
    h2after: "After the exam",
    afterList: [
      <>
        <strong>Immediately:</strong> You walk out with nothing — no
        paper, no audio recording, no provisional score. Your answer
        sheets and recordings go to FEI for grading.
      </>,
      <>
        <strong>Week 1–2:</strong> Your file reaches FEI&apos;s central
        processing in France.
      </>,
      <>
        <strong>Week 4–6:</strong> You receive an email from FEI
        notifying you that your attestation (score report) is ready.
        Log into the candidate portal with the credentials from your
        registration, download the PDF, and verify all four scores and
        personal details.
      </>,
      <>
        <strong>Week 6–10:</strong> The original paper attestation
        arrives by mail at the address you registered. This is the
        document IRCC accepts for Express Entry, along with the digital
        PDF verification.
      </>,
    ],
    validityNote: (
      <>
        Your results are valid for <strong>2 years</strong> from the
        exam date. Plan your Express Entry profile submission
        accordingly.
      </>
    ),
    h2help: "How HiTCF prepares you for exam day",
    helpIntro: (
      <>
        The best thing you can do the day before TCF Canada is{" "}
        <em>not be surprised by anything</em>. HiTCF&apos;s{" "}
        <strong>exam mode</strong> mirrors the real test conditions:
      </>
    ),
    helpList: [
      <>
        <strong>Timed sections</strong> — 35 min CO, 60 min CE, 60 min
        EE, 12 min EO, matching the official durations.
      </>,
      <>
        <strong>Single-play listening audio</strong> — just like the
        real exam, audio clips in exam mode cannot be replayed.
      </>,
      <>
        <strong>Difficulty ramp from A1 to C2</strong> — questions
        follow the real TCF Canada ordering (easy first, hardest last),
        so you learn when to skip.
      </>,
      <>
        <strong>AI evaluation for EE and EO</strong> — writing is
        scored on the official 4-criteria rubric; speaking is scored
        by Azure Speech pronunciation assessment + Grok evaluation
        across the 6 TCF speaking dimensions.
      </>,
      <>
        <strong>
          Sentence-level audio replay for post-exam review
        </strong>{" "}
        — practice mode lets you replay any sentence in isolation, so
        you can learn from every listening mistake.
      </>,
    ],
    helpClosing: (
      <>
        HiTCF hosts <strong>1,306 test sets</strong> and{" "}
        <strong>8,397 questions</strong> across all four skills: 42
        listening sets, 42 reading sets, 702 speaking topic sets, and
        520 writing task sets. New users get a 7-day Pro trial — no
        credit card required.
      </>
    ),
    cta: "Start practising in exam mode →",
    h2faq: "Frequently asked questions",
    faqs: [
      {
        q: "Can I reschedule my TCF Canada exam?",
        a: (
          <>
            Rescheduling policies are set by each individual centre,
            not by FEI centrally. Most Alliance Française centres allow
            one reschedule with 7–14 days notice for an admin fee.
            Cancellations closer to the exam date are usually not
            refundable. Always check your centre&apos;s terms at
            booking.
          </>
        ),
      },
      {
        q: "Can I take TCF Canada in Canada?",
        a: (
          <>
            Yes. TCF Canada is offered at authorized centres across
            Canada, including Alliance Française locations in Ottawa,
            Calgary, Vancouver, Toronto, Montreal, and other major
            cities. Seats in the Ottawa, Calgary, and Vancouver centres
            fill quickly — HiTCF provides a{" "}
            <Link href="/seat-monitor">
              real-time seat availability monitor
            </Link>{" "}
            for these three cities, updated every 15 seconds.
          </>
        ),
      },
      {
        q: "Is the TCF Canada speaking section with a human or AI?",
        a: (
          <>
            A human examiner conducts the speaking section. At some
            centres this is done face-to-face in a separate room; at
            others, by video call. The conversation is recorded for
            grading by trained evaluators at FEI.
          </>
        ),
      },
      {
        q: "Do I need to prepare for the speaking section in advance?",
        a: (
          <>
            Absolutely yes. The 12-minute EO section is the shortest
            but also the most performance-dependent. Prepare sample
            topics for each Tâche (1: introduction, 2: information
            gathering, 3: opinion persuasion) and rehearse them aloud.
            HiTCF provides 702 speaking topic sets with AI evaluation
            that mirrors the 6-dimension TCF rubric.
          </>
        ),
      },
      {
        q: "What happens if I am sick on exam day?",
        a: (
          <>
            Centre policies vary. Some allow a medical deferral with a
            doctor&apos;s note; others require full re-registration.
            Contact your centre the moment you know you cannot attend.
            Do not simply not show up — that typically forfeits the
            full fee.
          </>
        ),
      },
    ],
    sourcesLabel: "Sources",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")},{" "}
        {IRCC("IRCC — Language requirements")}. Specific check-in
        procedures, break policies, and rescheduling terms are set by
        individual test centres — always confirm with your centre
        before exam day. This guide is maintained by HiTCF, an
        independent TCF Canada practice platform with no affiliation
        to FEI or IRCC.
      </>
    ),
  },
  zh: {
    metaTitle: "TCF Canada 考试当天完整指南（2026）",
    metaDescription:
      "TCF Canada 考试当天你需要知道的一切：带什么、几点到、登记流程、科目顺序、休息、常见坑、何时出成绩。更新于 " +
      LAST_UPDATED +
      "。",
    h1: "TCF Canada 考试当天完整指南",
    lead: (
      <>
        几个月的备考之后，TCF Canada 考试本身其实很短——在一个授权考点大约 3 小时的集中答题。但**考试当天的流程**才是让最多考生栽跟头的地方。本指南带你走一遍：带什么、几点到、考试中发生什么、考完之后如何等结果。以下所有信息都是通用指引——你的具体考点在确认邮件中给出的规则以那个为准。
      </>
    ),
    lastUpdatedLabel: "最后更新",
    lastUpdatedBody: (
      <>
        。TCF Canada 由
        {FEI("法国国际教育研究中心（FEI）")}
        通过全球授权考点网络管理，加拿大主要城市的 Alliance Française（法盟）都是授权考点。
      </>
    ),
    h2pre: "考前 48 小时",
    preList: [
      <>
        <strong>重读确认邮件。</strong>核对考点确切地址（有些城市有多个校区）、预定的到场时间（不是考试开始时间——通常要提前 30 分钟到场），以及需携带的文件清单。
      </>,
      <>
        <strong>检查身份证件。</strong>证件上的姓名必须
        <em>完全</em>
        匹配报名时使用的姓名。如果你报名时用婚前姓但现有护照是婚后姓，立即联系考点处理。姓名不一致是考生被拒绝入场的常见原因。
      </>,
      <>
        <strong>规划路线。</strong>如果之前没去过考点，考前一天实地踩点一次。渥太华、温哥华等城市的市中心停车在考试当天可能浪费 15 分钟。
      </>,
      <>
        <strong>考前只做轻度复习。</strong>不要临时填鸭。花 30 分钟过一遍自己最弱的科目是有用的；4 小时马拉松式复习只会让你考试时精疲力尽。
      </>,
    ],
    h2bring: "带什么",
    bringHeaders: ["必带", "允许", "禁止"],
    bringRows: {
      required: [
        "有效身份证件（护照或政府签发的 ID）",
        "打印的确认邮件",
        "两支黑色或蓝色钢笔 / 签字笔（纸笔考试考点）",
      ],
      allowed: [
        "水瓶（严格考点要求透明、无标签）",
        "小零食（存放在考场外）",
        "润唇膏、纸巾",
        "外套（考场往往很冷）",
      ],
      notAllowed: [
        "手机、智能手表、任何电子设备",
        "笔记、书本、词典",
        "耳塞（除非已获特批）",
        "会遮住脸的帽子或兜帽（核对身份时要摘下）",
        "背包或手提包（不能带进考场）",
      ],
    },
    phoneNote: (
      <>
        <strong>手机：</strong>几乎每个考生都会低估考点对手机的严格程度。大多数考点要求手机
        <em>关机</em>（不是静音），存放在考场外的储物柜。考试中手机在口袋里震动过的人职业生涯都被终结过。放储物柜，别带进去。
      </>
    ),
    h2arrival: "到场与登记",
    arrivalIntro: (
      <>
        比预定考试开始时间<strong>提前 30 到 45 分钟</strong>到场。登记流程通常包括：
      </>
    ),
    arrivalSteps: [
      <>
        <strong>前台签到。</strong>监考员会把你的 ID 和考生名单核对。可能会拍照用于成绩单。
      </>,
      <>
        <strong>分配储物柜。</strong>存放手机、钱包、背包和所有不能带进考场的物品。
      </>,
      <>
        <strong>安排座位。</strong>你会被分配到一个具体座位或电脑工位。纸笔考试者会看到答题卡已经放好；机考者用给定的用户名和密码登录。
      </>,
      <>
        <strong>宣读考试规则。</strong>监考员用法语（有时英语）宣读考试规则。这本身就是听力练习——认真听。
      </>,
    ],
    h2sections: "四个科目的顺序",
    sectionsIntro:
      "具体安排因考点而异，但大多数加拿大考点的标准顺序是：",
    sectionsHeaders: ["科目", "时长", "题型", "说明"],
    sectionsRows: {
      coName: "1. Compréhension Orale (CO) — 听力",
      coDuration: "35 分钟",
      coFormat: "39 道选择题",
      coNote: "音频只播放一次，不能重听。通常提供草稿纸。",
      ceName: "2. Compréhension Écrite (CE) — 阅读",
      ceDuration: "60 分钟",
      ceFormat: "39 道选择题",
      ceNote: "难度从 A1（第 1 题）递增到 C2（第 39 题）。卡在 B2/C1 时先跳过。",
      eeName: "3. Expression Écrite (EE) — 写作",
      eeDuration: "60 分钟",
      eeFormat: "3 个写作任务",
      eeNote: "Tâche 1：短消息（约 60 字）。Tâche 2：文章（约 120 字）。Tâche 3：议论文（约 180 字）。",
      eoName: "4. Expression Orale (EO) — 口语",
      eoDuration: "12 分钟",
      eoFormat: "3 个口语任务，面对考官",
      eoNote: "面对面（某些考点用视频通话）。全程录音用于评分。任务之间没有准备时间。",
    },
    breaksNote: (
      <>
        <strong>休息：</strong>考点通常会在科目之间安排短暂休息，但不保证一定有，而且通常不超过 10 分钟。不要计划在考试中间吃正餐。CE 和 EE 之间吃个能量棒喝水现实，去食堂吃饭不现实。
      </>
    ),
    h2mistakes: "考试中常见错误",
    mistake1Title: "1. 在一道难题上耗时太久",
    mistake1Body: (
      <>
        TCF Canada 奖励广度，不奖励深度。如果你在阅读的第 18 题上花 5 分钟，而后面还有 21 道更简单的题，你是在拿 1 道可能答对的题换 21 道被放弃的题。90 秒内答不出就跳过，有时间再回来。这是最常见的策略错误。
      </>
    ),
    mistake2Title: "2. 涂答题卡时反复改答案（纸笔考试）",
    mistake2Body: (
      <>
        标准化考试研究显示，考生把正确答案改成错误答案的频率比反过来高。除非有具体理由怀疑，否则相信第一直觉。
      </>
    ),
    mistake3Title: "3. 写作字数太少（或太多）",
    mistake3Body: (
      <>
        Expression Écrite 任务的建议字数不是装饰。字数不足的扣分比字数过多的扣分更重，但两者都扣分。目标是精确命中建议字数 ±10%。在 HiTCF 的
        <Link href="/tests?type=writing">写作题库</Link>
        里练到不用数字数就能写到目标长度。
      </>
    ),
    mistake4Title: "4. EO Tâche 2 或 3 卡住",
    mistake4Body: (
      <>
        对大多数考生来说最难的口语任务是 Tâche 2（信息收集）或 Tâche 3（观点劝说）。如果脑子一片空白，哪怕
        <em>泛泛地谈论话题</em>
        也好过沉默。考官评的是你的表达范围、流畅度和任务完成度——说点不完美的远胜于什么都不说。
      </>
    ),
    h2after: "考完之后",
    afterList: [
      <>
        <strong>立即：</strong>你空手走出考场——没有试卷，没有录音，没有临时分数。你的答题卡和录音被送去 FEI 评分。
      </>,
      <>
        <strong>第 1–2 周：</strong>你的档案抵达 FEI 位于法国的中央处理中心。
      </>,
      <>
        <strong>第 4–6 周：</strong>你会收到 FEI 的邮件通知你的 attestation（成绩单）已生成。用报名时提供的凭据登录考生门户，下载 PDF，核对所有四个分数和个人信息。
      </>,
      <>
        <strong>第 6–10 周：</strong>纸质原件通过邮寄抵达你报名时登记的地址。这是 IRCC Express Entry 接受的文件，配合数字 PDF 验证。
      </>,
    ],
    validityNote: (
      <>
        成绩自考试日起有效期<strong>两年</strong>。相应地规划你的 Express Entry 档案提交时间。
      </>
    ),
    h2help: "HiTCF 如何帮你准备考试当天",
    helpIntro: (
      <>
        TCF Canada 考前一天你能做的最好的事情是
        <em>任何情况都不感到意外</em>。HiTCF 的<strong>考试模式</strong>精确模拟真考条件：
      </>
    ),
    helpList: [
      <>
        <strong>计时分段</strong> — CO 35 分钟、CE 60 分钟、EE 60 分钟、EO 12 分钟，和官方时长完全一致。
      </>,
      <>
        <strong>听力音频只播一次</strong> — 和真考一样，考试模式下音频不能重播。
      </>,
      <>
        <strong>从 A1 到 C2 的难度递增</strong> — 题目按真实 TCF Canada 顺序排列（先易后难），帮你学会何时该跳题。
      </>,
      <>
        <strong>EE 和 EO 的 AI 评分</strong> — 写作按官方 4 维度评分细则打分；口语由 Azure Speech 发音评估 + Grok 按 TCF 口语 6 维度评分。
      </>,
      <>
        <strong>考后复盘的句子级音频回放</strong> — 练习模式允许你单独回放任何一句，从每个听力错误中学习。
      </>,
    ],
    helpClosing: (
      <>
        HiTCF 共收录 <strong>1,306 套真题</strong>和 <strong>8,397 道题目</strong>，覆盖四个科目：42 套听力、42 套阅读、702 套口语题目、520 套写作任务。新用户注册即送 7 天 Pro 体验，无需信用卡。
      </>
    ),
    cta: "开始考试模式练习 →",
    h2faq: "常见问题",
    faqs: [
      {
        q: "TCF Canada 可以改期吗？",
        a: (
          <>
            改期政策由每个考点自行决定，不是 FEI 统一管理。大多数 Alliance Française 考点允许提前 7–14 天申请改期，收取管理费。临近考试日期取消通常不退费。报名时务必查看你所在考点的具体条款。
          </>
        ),
      },
      {
        q: "加拿大哪里可以考 TCF Canada？",
        a: (
          <>
            加拿大授权考点主要是各城市的 Alliance Française（法盟），包括渥太华、卡尔加里、温哥华、多伦多、蒙特利尔等主要城市。渥太华、卡尔加里、温哥华的考位非常紧张——HiTCF 为这三个城市提供
            <Link href="/seat-monitor">实时考位监控</Link>
            ，每 15 秒刷新一次。
          </>
        ),
      },
      {
        q: "TCF Canada 口语考试是和真人还是 AI？",
        a: (
          <>
            口语由真人考官进行。某些考点是面对面在单独房间进行，另一些是视频通话。全程录音后由 FEI 训练有素的评分员打分。
          </>
        ),
      },
      {
        q: "口语科目需要提前准备吗？",
        a: (
          <>
            绝对需要。12 分钟的 EO 是最短但最依赖现场表现的科目。为每个 Tâche（1：自我介绍，2：信息收集，3：观点劝说）准备样板话题并大声练习。HiTCF 提供 702 套口语题目和 AI 评分，完全对标 TCF 官方 6 维度评分细则。
          </>
        ),
      },
      {
        q: "考试当天生病怎么办？",
        a: (
          <>
            考点政策各异。部分考点接受医生证明的延期申请，另一些要求重新报名。一旦知道无法参加，立即联系考点。不要直接缺考——通常全额费用不退。
          </>
        ),
      },
    ],
    sourcesLabel: "来源",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")}、
        {IRCC("IRCC — 语言要求")}
        。具体的登记流程、休息政策、改期条款由各考点自行设定——考前务必与你所在考点确认。本指南由 HiTCF 独立维护，HiTCF 与 FEI、IRCC 无任何隶属关系。
      </>
    ),
  },
  fr: {
    metaTitle: "TCF Canada, jour de l'examen : guide complet (2026)",
    metaDescription:
      "Tout ce qu'il faut savoir sur le jour de l'examen TCF Canada : quoi apporter, à quelle heure arriver, procédure d'entrée, ordre des épreuves, pauses, erreurs fréquentes et délai des résultats. Mis à jour le " +
      LAST_UPDATED +
      ".",
    h1: "TCF Canada, jour de l'examen : guide complet",
    lead: (
      <>
        Après des mois de préparation, l&apos;examen TCF Canada
        lui-même est un événement étonnamment court — environ 3 heures
        de test concentré dans un centre agréé. Mais la logistique du
        jour de l&apos;examen fait trébucher plus de candidats que les
        questions elles-mêmes. Ce guide vous accompagne à travers ce
        qu&apos;il faut apporter, quand arriver, ce qui se passe
        pendant l&apos;examen, et à quoi s&apos;attendre après. Toutes
        les informations ici sont générales — les règles de votre
        centre spécifique dans l&apos;e-mail de confirmation priment
        toujours.
      </>
    ),
    lastUpdatedLabel: "Dernière mise à jour",
    lastUpdatedBody: (
      <>
        . Le TCF Canada est administré par{" "}
        {FEI("France Éducation International (FEI)")} via un réseau
        mondial de centres agréés, y compris les Alliance Française
        dans la plupart des grandes villes canadiennes.
      </>
    ),
    h2pre: "48 heures avant l'examen",
    preList: [
      <>
        <strong>Relisez votre e-mail de confirmation.</strong> Vérifiez
        l&apos;adresse exacte du centre (certaines villes ont plusieurs
        campus), l&apos;heure d&apos;arrivée prévue (pas l&apos;heure
        de début de l&apos;examen — l&apos;arrivée est généralement 30
        minutes plus tôt) et la liste des documents requis.
      </>,
      <>
        <strong>Vérifiez votre pièce d&apos;identité avec photo.</strong>{" "}
        Le nom sur votre pièce d&apos;identité doit correspondre{" "}
        <em>exactement</em> au nom sur votre inscription. En cas de
        divergence (ex. nom de jeune fille vs nom d&apos;épouse),
        contactez immédiatement le centre. Les divergences sont une
        raison fréquente de refus à l&apos;entrée.
      </>,
      <>
        <strong>Planifiez votre trajet.</strong> Si vous n&apos;êtes
        jamais allé au centre, faites un essai la veille. Le
        stationnement en centre-ville à Ottawa ou Vancouver peut
        prendre 15 minutes le jour du test.
      </>,
      <>
        <strong>Révision légère uniquement.</strong> Ne bachotez pas
        de nouveaux contenus. 30 minutes de révision sur votre
        compétence la plus faible est productif ; un marathon de 4
        heures vous laissera épuisé pour l&apos;examen lui-même.
      </>,
    ],
    h2bring: "Quoi apporter",
    bringHeaders: ["Requis", "Autorisé", "Non autorisé"],
    bringRows: {
      required: [
        "Pièce d'identité valide (passeport ou pièce gouvernementale)",
        "E-mail de confirmation imprimé",
        "Deux stylos noirs ou bleus (centres sur papier)",
      ],
      allowed: [
        "Bouteille d'eau (transparente, sans étiquette dans les centres stricts)",
        "Petit en-cas (stocké hors de la salle)",
        "Baume à lèvres, mouchoirs",
        "Pull chaud (les salles sont souvent froides)",
      ],
      notAllowed: [
        "Téléphone, montre connectée, tout appareil électronique",
        "Notes, livres, dictionnaires",
        "Bouchons d'oreilles (sauf accommodation pré-approuvée)",
        "Casquettes ou capuches couvrant le visage pendant le contrôle d'identité",
        "Sacs à dos dans la salle",
      ],
    },
    phoneNote: (
      <>
        <strong>Téléphones :</strong> Chaque candidat à qui nous
        parlons sous-estime la sévérité des centres sur les téléphones.
        La plupart exigent que les téléphones soient éteints (pas en
        silencieux) et stockés dans un casier hors de la salle. Un
        téléphone qui vibre dans votre poche pendant la section
        d&apos;écoute a mis fin à des carrières. Laissez-le dans le
        casier.
      </>
    ),
    h2arrival: "Arrivée et enregistrement",
    arrivalIntro: (
      <>
        Arrivez <strong>30 à 45 minutes</strong> avant l&apos;heure de
        début prévue. L&apos;enregistrement comprend généralement :
      </>
    ),
    arrivalSteps: [
      <>
        <strong>Signature à la réception.</strong>{" "}
        L&apos;administrateur vérifie votre pièce d&apos;identité
        contre la liste des candidats. Il peut vous prendre en photo
        pour le rapport de notes.
      </>,
      <>
        <strong>Attribution d&apos;un casier.</strong> Vous y stockez
        votre téléphone, portefeuille, sac à dos et tout ce qui
        n&apos;est pas explicitement autorisé dans la salle.
      </>,
      <>
        <strong>Attribution de place.</strong> Vous êtes assigné à une
        place ou poste informatique spécifique. Les candidats papier
        trouvent leur feuille de réponses déjà placée ; les candidats
        informatiques se connectent avec un identifiant et un code
        fournis.
      </>,
      <>
        <strong>Briefing des instructions.</strong> Le surveillant lit
        les règles de l&apos;examen en français (et parfois en
        anglais). C&apos;est un exercice d&apos;écoute en soi — écoutez
        attentivement.
      </>,
    ],
    h2sections: "Les quatre épreuves dans l'ordre",
    sectionsIntro:
      "L'ordre exact varie, mais l'ordre standard dans la plupart des centres canadiens est :",
    sectionsHeaders: ["Épreuve", "Durée", "Format", "Remarques"],
    sectionsRows: {
      coName: "1. Compréhension Orale (CO) — Écoute",
      coDuration: "35 min",
      coFormat: "39 questions à choix multiples",
      coNote: "L'audio est joué une seule fois. Pas de rejeu. Feuille de brouillon généralement fournie.",
      ceName: "2. Compréhension Écrite (CE) — Lecture",
      ceDuration: "60 min",
      ceFormat: "39 questions à choix multiples",
      ceNote: "Les questions sont de plus en plus difficiles de A1 (Q1) à C2 (Q39). Sautez et revenez si vous bloquez sur B2/C1.",
      eeName: "3. Expression Écrite (EE) — Rédaction",
      eeDuration: "60 min",
      eeFormat: "3 tâches de rédaction",
      eeNote: "Tâche 1 : message court (~60 mots). Tâche 2 : article (~120 mots). Tâche 3 : argumentaire (~180 mots).",
      eoName: "4. Expression Orale (EO) — Oral",
      eoDuration: "12 min",
      eoFormat: "3 tâches orales avec un examinateur",
      eoNote: "Face à face (ou appel vidéo dans certains centres). Enregistré pour évaluation. Pas de temps de préparation entre les tâches.",
    },
    breaksNote: (
      <>
        <strong>Pauses :</strong> Les centres offrent généralement de
        courtes pauses entre les épreuves, mais elles ne sont pas
        garanties et durent généralement moins de 10 minutes. Ne
        prévoyez pas de repas complet en milieu d&apos;examen. Une
        barre de céréales et de l&apos;eau entre CE et EE est réaliste
        ; une pause cafétéria ne l&apos;est pas.
      </>
    ),
    h2mistakes: "Pendant l'examen : erreurs fréquentes",
    mistake1Title: "1. Passer trop de temps sur une question difficile",
    mistake1Body: (
      <>
        Le TCF Canada récompense la largeur, pas la profondeur. Si
        vous passez 5 minutes sur la Q18 de lecture alors que 21
        questions plus faciles restent, vous échangez 1 réponse
        possiblement correcte contre 21 abandonnées. Sautez tout ce
        que vous ne pouvez pas répondre en 90 secondes et revenez-y si
        le temps le permet. C&apos;est l&apos;erreur stratégique la
        plus courante.
      </>
    ),
    mistake2Title: "2. Douter de ses réponses sur la grille (papier)",
    mistake2Body: (
      <>
        La recherche sur les tests standardisés montre que les
        candidats transforment les bonnes réponses en mauvaises plus
        souvent que l&apos;inverse. Faites confiance à votre premier
        instinct sauf raison spécifique d&apos;en douter.
      </>
    ),
    mistake3Title: "3. Écrire trop peu (ou trop) en EE",
    mistake3Body: (
      <>
        Les nombres de mots suggérés pour les tâches d&apos;Expression
        Écrite ne sont pas décoratifs. Écrire trop peu est pénalisé
        plus lourdement que trop écrire, mais les deux nuisent. Visez
        exactement la longueur cible ± 10%. Entraînez-vous sur la{" "}
        <Link href="/tests?type=writing">banque de tâches écrites</Link>{" "}
        de HiTCF jusqu&apos;à pouvoir atteindre le nombre de mots sans
        compter consciemment.
      </>
    ),
    mistake4Title: "4. Bloquer sur EO Tâche 2 ou 3",
    mistake4Body: (
      <>
        La tâche orale la plus difficile pour la plupart des candidats
        est la Tâche 2 (recherche d&apos;information) ou la Tâche 3
        (persuasion d&apos;opinion). Si vous êtes bloqué, parlez{" "}
        <em>du sujet en termes généraux</em> plutôt que de rester
        silencieux. Les examinateurs évaluent votre registre, fluidité
        et achèvement de la tâche — dire quelque chose
        d&apos;imparfait vaut mieux que ne rien dire.
      </>
    ),
    h2after: "Après l'examen",
    afterList: [
      <>
        <strong>Immédiatement :</strong> Vous repartez avec rien —
        aucun papier, aucun enregistrement audio, aucun score
        provisoire. Vos feuilles de réponses et enregistrements sont
        envoyés à FEI pour évaluation.
      </>,
      <>
        <strong>Semaine 1–2 :</strong> Votre dossier atteint le
        traitement central de FEI en France.
      </>,
      <>
        <strong>Semaine 4–6 :</strong> Vous recevez un e-mail de FEI
        vous notifiant que votre attestation (rapport de notes) est
        prête. Connectez-vous au portail candidat avec les
        identifiants de votre inscription, téléchargez le PDF et
        vérifiez les quatre scores et informations personnelles.
      </>,
      <>
        <strong>Semaine 6–10 :</strong> L&apos;attestation papier
        originale arrive par la poste à l&apos;adresse enregistrée.
        C&apos;est le document accepté par IRCC pour Entrée express,
        avec la vérification PDF numérique.
      </>,
    ],
    validityNote: (
      <>
        Vos résultats sont valides <strong>2 ans</strong> à partir de
        la date de l&apos;examen. Planifiez votre soumission de profil
        Entrée express en conséquence.
      </>
    ),
    h2help: "Comment HiTCF vous prépare au jour de l'examen",
    helpIntro: (
      <>
        La meilleure chose à faire la veille du TCF Canada est{" "}
        <em>de ne pas être surpris par quoi que ce soit</em>. Le{" "}
        <strong>mode examen</strong> de HiTCF reflète les conditions
        réelles du test :
      </>
    ),
    helpList: [
      <>
        <strong>Sections chronométrées</strong> — 35 min CO, 60 min
        CE, 60 min EE, 12 min EO, correspondant aux durées
        officielles.
      </>,
      <>
        <strong>Audio d&apos;écoute en lecture unique</strong> —
        exactement comme au vrai examen, les clips audio en mode
        examen ne peuvent pas être rejoués.
      </>,
      <>
        <strong>Progression de difficulté de A1 à C2</strong> — les
        questions suivent l&apos;ordre réel du TCF Canada (facile
        d&apos;abord, difficile à la fin), pour que vous appreniez
        quand sauter.
      </>,
      <>
        <strong>Évaluation IA pour EE et EO</strong> — la rédaction
        est notée sur la grille officielle des 4 critères ; l&apos;oral
        est noté par l&apos;évaluation de prononciation Azure Speech
        + Grok sur les 6 dimensions TCF.
      </>,
      <>
        <strong>Rejeu audio phrase par phrase pour la révision post-examen</strong>{" "}
        — le mode entraînement permet de rejouer n&apos;importe quelle
        phrase isolément, pour apprendre de chaque erreur
        d&apos;écoute.
      </>,
    ],
    helpClosing: (
      <>
        HiTCF héberge <strong>1 306 séries de tests</strong> et{" "}
        <strong>8 397 questions</strong> couvrant les quatre
        compétences : 42 séries d&apos;écoute, 42 séries de lecture,
        702 séries de sujets oraux et 520 séries de tâches écrites.
        Essai Pro de 7 jours à l&apos;inscription, sans carte bancaire.
      </>
    ),
    cta: "Commencer à s'entraîner en mode examen →",
    h2faq: "Questions fréquentes",
    faqs: [
      {
        q: "Puis-je reporter mon examen TCF Canada ?",
        a: (
          <>
            Les politiques de report sont fixées par chaque centre
            individuellement, pas par FEI centralement. La plupart des
            centres Alliance Française permettent un report avec un
            préavis de 7 à 14 jours moyennant des frais administratifs.
            Les annulations plus proches de la date ne sont
            généralement pas remboursables. Vérifiez toujours les
            conditions de votre centre lors de la réservation.
          </>
        ),
      },
      {
        q: "Puis-je passer le TCF Canada au Canada ?",
        a: (
          <>
            Oui. Le TCF Canada est offert dans des centres agréés à
            travers le Canada, y compris les Alliance Française à
            Ottawa, Calgary, Vancouver, Toronto, Montréal et
            d&apos;autres grandes villes. Les places à Ottawa, Calgary
            et Vancouver se remplissent vite — HiTCF propose un{" "}
            <Link href="/seat-monitor">
              moniteur de disponibilité des places en temps réel
            </Link>{" "}
            pour ces trois villes, mis à jour toutes les 15 secondes.
          </>
        ),
      },
      {
        q: "La section orale du TCF Canada est-elle avec un humain ou une IA ?",
        a: (
          <>
            Un examinateur humain conduit la section orale. Dans
            certains centres, cela se fait en face à face dans une
            salle séparée ; dans d&apos;autres, par appel vidéo. La
            conversation est enregistrée pour notation par des
            évaluateurs formés à FEI.
          </>
        ),
      },
      {
        q: "Dois-je préparer la section orale à l'avance ?",
        a: (
          <>
            Absolument oui. La section EO de 12 minutes est la plus
            courte mais aussi la plus dépendante de la performance.
            Préparez des sujets d&apos;exemple pour chaque Tâche (1 :
            introduction, 2 : recherche d&apos;information, 3 :
            persuasion d&apos;opinion) et répétez-les à voix haute.
            HiTCF propose 702 séries de sujets oraux avec évaluation
            IA reflétant la grille TCF des 6 dimensions.
          </>
        ),
      },
      {
        q: "Que faire si je suis malade le jour de l'examen ?",
        a: (
          <>
            Les politiques des centres varient. Certains acceptent un
            report médical avec certificat ; d&apos;autres exigent une
            réinscription complète. Contactez votre centre dès que vous
            savez que vous ne pourrez pas assister. Ne faites pas
            simplement l&apos;impasse — cela entraîne généralement la
            perte des frais complets.
          </>
        ),
      },
    ],
    sourcesLabel: "Sources",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")},{" "}
        {IRCC("IRCC — Exigences linguistiques")}. Les procédures
        d&apos;enregistrement spécifiques, politiques de pause et
        conditions de report sont fixées par les centres individuels —
        confirmez toujours avec votre centre avant le jour de
        l&apos;examen. Ce guide est maintenu par HiTCF, plateforme de
        préparation indépendante au TCF Canada sans affiliation avec
        FEI ou IRCC.
      </>
    ),
  },
  ar: {
    metaTitle: "يوم اختبار TCF Canada: دليل كامل (2026)",
    metaDescription:
      "كل ما تحتاج معرفته عن يوم اختبار TCF Canada: ماذا تحضر، وقت الوصول، عملية التسجيل، ترتيب الأقسام، الاستراحات، الأخطاء الشائعة، ومتى تصل النتائج. آخر تحديث " +
      LAST_UPDATED +
      ".",
    h1: "يوم اختبار TCF Canada: دليل كامل",
    lead: (
      <>
        بعد أشهر من التحضير، اختبار TCF Canada نفسه حدث قصير بشكل مفاجئ — حوالي 3 ساعات من الاختبار المركّز في مركز معتمد. لكن لوجستيات يوم الاختبار تُعثر المرشحين أكثر من الأسئلة نفسها. هذا الدليل يرشدك خلال ما تحضره، ومتى تصل، وما يحدث خلال الاختبار، وما تتوقعه بعد ذلك. جميع المعلومات هنا عامة — قواعد مركزك المحدد في بريد التأكيد هي التي تأخذ الأولوية دائمًا.
      </>
    ),
    lastUpdatedLabel: "آخر تحديث",
    lastUpdatedBody: (
      <>
        . تتم إدارة TCF Canada من قبل{" "}
        {FEI("France Éducation International (FEI)")} عبر شبكة عالمية من المراكز المعتمدة، بما في ذلك مواقع Alliance Française في معظم المدن الكندية الرئيسية.
      </>
    ),
    h2pre: "قبل 48 ساعة من الاختبار",
    preList: [
      <>
        <strong>أعد قراءة بريد التأكيد.</strong> تحقق من العنوان الدقيق للمركز (بعض المدن لديها فروع متعددة)، وقت الوصول المحدد (وليس وقت بداية الاختبار — الوصول عادة قبل 30 دقيقة)، وقائمة المستندات المطلوبة.
      </>,
      <>
        <strong>تحقق من بطاقة الهوية المصورة.</strong> يجب أن يتطابق الاسم على بطاقة هويتك <em>تمامًا</em> مع الاسم على التسجيل. إذا سجلت باسم ما وجواز سفرك الحالي يظهر اسمًا مختلفًا، اتصل بالمركز فورًا. عدم التطابق سبب شائع لرفض المرشحين عند الباب.
      </>,
      <>
        <strong>خطط لطريقك.</strong> إذا لم تذهب إلى المركز من قبل، قم بجولة تجريبية في اليوم السابق. يمكن أن يستغرق وقوف السيارات في وسط مدن مثل أوتاوا أو فانكوفر 15 دقيقة في يوم الاختبار.
      </>,
      <>
        <strong>مراجعة خفيفة فقط.</strong> لا تحشر مواد جديدة. 30 دقيقة من مراجعة أضعف مهاراتك منتجة ؛ ماراثون 4 ساعات سيتركك منهكًا للاختبار نفسه.
      </>,
    ],
    h2bring: "ماذا تحضر",
    bringHeaders: ["مطلوب", "مسموح", "غير مسموح"],
    bringRows: {
      required: [
        "بطاقة هوية صالحة مع صورة (جواز سفر أو بطاقة حكومية)",
        "بريد التأكيد مطبوعًا",
        "قلمان أسود أو أزرق (للمراكز الورقية)",
      ],
      allowed: [
        "زجاجة ماء (شفافة، بدون ملصق في المراكز الصارمة)",
        "وجبة خفيفة صغيرة (تخزن خارج الغرفة)",
        "مرطب الشفاه، مناديل",
        "طبقة دافئة (غرف الاختبار غالبًا باردة)",
      ],
      notAllowed: [
        "الهاتف، الساعة الذكية، أي جهاز إلكتروني",
        "ملاحظات، كتب، قواميس",
        "سدادات الأذن (ما لم تكن تسهيلات معتمدة مسبقًا)",
        "القبعات أو الأغطية التي تحجب الوجه أثناء فحص الهوية",
        "حقائب الظهر أو الحقائب داخل غرفة الاختبار",
      ],
    },
    phoneNote: (
      <>
        <strong>الهواتف:</strong> كل مرشح نتحدث إليه يقلل من صرامة المراكز بشأن الهواتف. تتطلب معظم المراكز إيقاف تشغيل الهواتف (وليس الصامت) وتخزينها في خزانة خارج غرفة الاختبار. هاتف يرن في جيبك أثناء قسم الاستماع أنهى مسيرات مهنية. اتركه في الخزانة.
      </>
    ),
    h2arrival: "الوصول والتسجيل",
    arrivalIntro: (
      <>
        صل <strong>قبل 30 إلى 45 دقيقة</strong> من وقت بداية الاختبار المحدد. يشمل التسجيل عادة:
      </>
    ),
    arrivalSteps: [
      <>
        <strong>التسجيل في مكتب الاستقبال.</strong> سيتحقق المراقب من هويتك مقابل قائمة المرشحين. قد يأخذ صورة لك لتقرير النتائج.
      </>,
      <>
        <strong>تعيين خزانة.</strong> تخزن فيها هاتفك ومحفظتك وحقيبة الظهر وأي شيء آخر غير مسموح به صراحة في غرفة الاختبار.
      </>,
      <>
        <strong>تحديد المقعد.</strong> سيتم تعيين مقعد أو محطة كمبيوتر محددة لك. يجد المرشحون الورقيون ورقة إجاباتهم موضوعة بالفعل ؛ يسجل المرشحون الحاسوبيون الدخول باسم مستخدم وكود مقدمين.
      </>,
      <>
        <strong>جلسة تعليمات.</strong> يقرأ المراقب قواعد الاختبار بالفرنسية (وأحيانًا الإنجليزية). هذا تدريب استماع بحد ذاته — انتبه.
      </>,
    ],
    h2sections: "الأقسام الأربعة بالترتيب",
    sectionsIntro: "يختلف الجدول الزمني الدقيق، لكن الترتيب المعتاد في معظم المراكز الكندية هو:",
    sectionsHeaders: ["القسم", "المدة", "التنسيق", "ملاحظات"],
    sectionsRows: {
      coName: "1. Compréhension Orale (CO) — الاستماع",
      coDuration: "35 دقيقة",
      coFormat: "39 سؤال اختيار من متعدد",
      coNote: "يتم تشغيل الصوت مرة واحدة فقط. لا إعادة تشغيل. عادة ما يتم توفير ورقة ملاحظات.",
      ceName: "2. Compréhension Écrite (CE) — القراءة",
      ceDuration: "60 دقيقة",
      ceFormat: "39 سؤال اختيار من متعدد",
      ceNote: "تصبح الأسئلة أصعب من A1 (س1) إلى C2 (س39). تخطَّ وعد لاحقًا إذا علقت في B2/C1.",
      eeName: "3. Expression Écrite (EE) — الكتابة",
      eeDuration: "60 دقيقة",
      eeFormat: "3 مهام كتابية",
      eeNote: "Tâche 1: رسالة قصيرة (~60 كلمة). Tâche 2: مقال (~120 كلمة). Tâche 3: حجاجي (~180 كلمة).",
      eoName: "4. Expression Orale (EO) — التحدث",
      eoDuration: "12 دقيقة",
      eoFormat: "3 مهام تحدث مع ممتحن",
      eoNote: "وجهاً لوجه (أو مكالمة فيديو في بعض المراكز). مسجل للتقييم. لا وقت للتحضير بين المهام.",
    },
    breaksNote: (
      <>
        <strong>الاستراحات:</strong> تقدم المراكز عادة استراحات قصيرة بين الأقسام، لكنها غير مضمونة وعادة أقل من 10 دقائق. لا تخطط لتناول وجبة كاملة في منتصف الاختبار. لوح حبوب وماء بين CE و EE واقعي ؛ زيارة الكافيتيريا ليست كذلك.
      </>
    ),
    h2mistakes: "أثناء الاختبار: أخطاء شائعة",
    mistake1Title: "1. قضاء وقت طويل على سؤال صعب",
    mistake1Body: (
      <>
        يكافئ TCF Canada الاتساع، وليس العمق. إذا قضيت 5 دقائق على س18 من القراءة بينما 21 سؤالاً أسهل متبقٍ، فإنك تقايض إجابة صحيحة محتملة واحدة بما يصل إلى 21 إجابة متروكة. تخطَّ أي شيء لا يمكنك الإجابة عنه في 90 ثانية وعد إليه إذا سمح الوقت. هذا أكثر الأخطاء الاستراتيجية شيوعًا.
      </>
    ),
    mistake2Title: "2. التراجع عن الإجابات في ورقة الفقاعات (ورقي)",
    mistake2Body: (
      <>
        تظهر الأبحاث على الاختبارات الموحدة أن المرشحين يغيرون الإجابات الصحيحة إلى خاطئة أكثر من العكس. ثق بغريزتك الأولى ما لم يكن لديك سبب محدد للشك.
      </>
    ),
    mistake3Title: "3. الكتابة قليلًا جدًا (أو كثيرًا جدًا) في EE",
    mistake3Body: (
      <>
        أعداد الكلمات المقترحة لمهام Expression Écrite ليست زخرفية. الكتابة بأقل من المطلوب تعاقب بشكل أثقل من الكتابة بأكثر، لكن كلاهما يضر. استهدف الطول المحدد ± 10٪ بالضبط. تدرب على هذا في
        <Link href="/tests?type=writing">بنك المهام الكتابية</Link>
        {" "}في HiTCF حتى تتمكن من إصابة عدد الكلمات دون العد بوعي.
      </>
    ),
    mistake4Title: "4. التجمد في EO Tâche 2 أو 3",
    mistake4Body: (
      <>
        أصعب مهمة شفوية لمعظم المرشحين هي Tâche 2 (جمع المعلومات) أو Tâche 3 (إقناع الرأي). إذا أصبحت فارغ الذهن، تحدث عن
        <em>الموضوع بعبارات عامة</em>
        بدلاً من البقاء صامتًا. يقيم الممتحنون نطاقك وطلاقتك وإنجاز المهمة — قول شيء غير مثالي أفضل من عدم قول شيء.
      </>
    ),
    h2after: "بعد الاختبار",
    afterList: [
      <>
        <strong>فورًا:</strong> تخرج بلا شيء — لا ورق، لا تسجيل صوتي، لا درجة مؤقتة. ترسل أوراق إجاباتك وتسجيلاتك إلى FEI للتقييم.
      </>,
      <>
        <strong>الأسبوع 1–2:</strong> يصل ملفك إلى المعالجة المركزية لـ FEI في فرنسا.
      </>,
      <>
        <strong>الأسبوع 4–6:</strong> تتلقى بريدًا إلكترونيًا من FEI يخطرك بأن شهادتك (تقرير النتائج) جاهزة. سجل الدخول إلى بوابة المرشحين باستخدام بيانات الاعتماد من التسجيل الخاص بك، قم بتنزيل PDF، وتحقق من جميع الدرجات الأربع والتفاصيل الشخصية.
      </>,
      <>
        <strong>الأسبوع 6–10:</strong> تصل الشهادة الورقية الأصلية عبر البريد إلى العنوان الذي سجلته. هذا هو المستند الذي تقبله IRCC لـ Express Entry، جنبًا إلى جنب مع التحقق الرقمي من PDF.
      </>,
    ],
    validityNote: (
      <>
        نتائجك صالحة لمدة <strong>سنتين</strong> من تاريخ الاختبار. خطط لتقديم ملف Express Entry وفقًا لذلك.
      </>
    ),
    h2help: "كيف تعدك HiTCF ليوم الاختبار",
    helpIntro: (
      <>
        أفضل شيء يمكنك فعله في اليوم السابق لـ TCF Canada هو
        <em>ألا تفاجأ بأي شيء</em>. <strong>وضع الاختبار</strong> في HiTCF يعكس ظروف الاختبار الحقيقية:
      </>
    ),
    helpList: [
      <>
        <strong>أقسام مؤقتة</strong> — 35 دقيقة CO، 60 دقيقة CE، 60 دقيقة EE، 12 دقيقة EO، مطابقة للمدد الرسمية.
      </>,
      <>
        <strong>صوت استماع يُشغَّل مرة واحدة</strong> — تمامًا مثل الاختبار الحقيقي، لا يمكن إعادة تشغيل المقاطع الصوتية في وضع الاختبار.
      </>,
      <>
        <strong>تدرج الصعوبة من A1 إلى C2</strong> — تتبع الأسئلة ترتيب TCF Canada الحقيقي (الأسهل أولاً، الأصعب أخيرًا)، حتى تتعلم متى تتخطى.
      </>,
      <>
        <strong>تقييم AI لـ EE و EO</strong> — يتم تصحيح الكتابة على معايير TCF الرسمية الأربعة ؛ يتم تصحيح التحدث بواسطة تقييم نطق Azure Speech + تقييم Grok عبر 6 أبعاد TCF للتحدث.
      </>,
      <>
        <strong>إعادة تشغيل الصوت على مستوى الجملة للمراجعة بعد الاختبار</strong> — يتيح لك وضع التدريب إعادة تشغيل أي جملة بمعزل، حتى تتعلم من كل خطأ استماع.
      </>,
    ],
    helpClosing: (
      <>
        تستضيف HiTCF <strong>1,306 مجموعة اختبار</strong> و
        <strong>8,397 سؤالاً</strong> عبر جميع المهارات الأربع: 42 مجموعة استماع، و 42 مجموعة قراءة، و 702 مجموعة مواضيع شفوية، و 520 مجموعة مهام كتابية. يحصل المستخدمون الجدد على نسخة Pro تجريبية لمدة 7 أيام — بدون بطاقة ائتمان.
      </>
    ),
    cta: "ابدأ التدرب في وضع الاختبار ←",
    h2faq: "الأسئلة الشائعة",
    faqs: [
      {
        q: "هل يمكنني إعادة جدولة اختبار TCF Canada؟",
        a: (
          <>
            سياسات إعادة الجدولة تحددها كل مركز على حدة، وليس FEI مركزيًا. تسمح معظم مراكز Alliance Française بإعادة جدولة واحدة مع إشعار 7–14 يومًا مقابل رسوم إدارية. الإلغاءات الأقرب إلى تاريخ الاختبار عادة غير قابلة للاسترداد. تحقق دائمًا من شروط مركزك عند الحجز.
          </>
        ),
      },
      {
        q: "هل يمكنني إجراء TCF Canada في كندا؟",
        a: (
          <>
            نعم. يُقدَّم TCF Canada في المراكز المعتمدة في جميع أنحاء كندا، بما في ذلك مواقع Alliance Française في أوتاوا وكالجاري وفانكوفر وتورنتو ومونتريال ومدن رئيسية أخرى. تمتلئ المقاعد في مراكز أوتاوا وكالجاري وفانكوفر بسرعة — توفر HiTCF
            <Link href="/seat-monitor">
              مراقب توفر المقاعد في الوقت الحقيقي
            </Link>
            {" "}لهذه المدن الثلاث، يتم تحديثه كل 15 ثانية.
          </>
        ),
      },
      {
        q: "هل قسم التحدث في TCF Canada مع إنسان أم AI؟",
        a: (
          <>
            ممتحن بشري يدير قسم التحدث. في بعض المراكز يتم هذا وجهًا لوجه في غرفة منفصلة ؛ في أخرى، عبر مكالمة فيديو. يتم تسجيل المحادثة للتقييم بواسطة مقيمين مدربين في FEI.
          </>
        ),
      },
      {
        q: "هل أحتاج للتحضير لقسم التحدث مسبقًا؟",
        a: (
          <>
            بالتأكيد نعم. قسم EO البالغ 12 دقيقة هو الأقصر ولكن أيضًا الأكثر اعتمادًا على الأداء. جهّز مواضيع نموذجية لكل Tâche (1: مقدمة، 2: جمع معلومات، 3: إقناع رأي) وتدرب عليها بصوت عالٍ. توفر HiTCF 702 مجموعة مواضيع شفوية مع تقييم AI يعكس معايير TCF الرسمية الستة.
          </>
        ),
      },
      {
        q: "ماذا يحدث إذا كنت مريضًا يوم الاختبار؟",
        a: (
          <>
            تختلف سياسات المراكز. تسمح بعض المراكز بتأجيل طبي مع تقرير طبيب ؛ تتطلب أخرى إعادة تسجيل كاملة. اتصل بمركزك بمجرد أن تعرف أنك لا تستطيع الحضور. لا تتغيب ببساطة — هذا يُفقد الرسوم الكاملة عادة.
          </>
        ),
      },
    ],
    sourcesLabel: "المصادر",
    sourcesBody: (
      <>
        {FEI("France Éducation International — TCF Canada")}،{" "}
        {IRCC("IRCC — متطلبات اللغة")}. إجراءات التسجيل المحددة وسياسات الاستراحة وشروط إعادة الجدولة تحددها مراكز الاختبار الفردية — قم دائمًا بالتأكيد مع مركزك قبل يوم الاختبار. هذا الدليل تتم صيانته بواسطة HiTCF، منصة تحضير مستقلة لـ TCF Canada بدون أي ارتباط بـ FEI أو IRCC.
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
      title: c.metaTitle,
      description: c.metaDescription,
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
  const c = CONTENT[(locale as Locale) in CONTENT ? (locale as Locale) : "en"];
  const pageUrl = `${SITE_URL}/${locale}/guide/tcf-canada-exam-day`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LearningResource", "HowTo"],
        "@id": `${pageUrl}#howto`,
        name: c.metaTitle,
        description: c.metaDescription,
        url: pageUrl,
        datePublished: LAST_UPDATED,
        dateModified: LAST_UPDATED,
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: locale,
        learningResourceType: "procedural guide",
        totalTime: "PT4H",
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

  const sr = c.sectionsRows;

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

      <h2>{c.h2pre}</h2>
      <ul>
        {c.preList.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{c.h2bring}</h2>
      <table>
        <thead>
          <tr>
            {c.bringHeaders.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({
            length: Math.max(
              c.bringRows.required.length,
              c.bringRows.allowed.length,
              c.bringRows.notAllowed.length
            ),
          }).map((_, i) => (
            <tr key={i}>
              <td>{c.bringRows.required[i] || ""}</td>
              <td>{c.bringRows.allowed[i] || ""}</td>
              <td>{c.bringRows.notAllowed[i] || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{c.phoneNote}</p>

      <h2>{c.h2arrival}</h2>
      <p>{c.arrivalIntro}</p>
      <ol>
        {c.arrivalSteps.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>

      <h2>{c.h2sections}</h2>
      <p>{c.sectionsIntro}</p>
      <table>
        <thead>
          <tr>
            {c.sectionsHeaders.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>{sr.coName}</strong></td>
            <td>{sr.coDuration}</td>
            <td>{sr.coFormat}</td>
            <td>{sr.coNote}</td>
          </tr>
          <tr>
            <td><strong>{sr.ceName}</strong></td>
            <td>{sr.ceDuration}</td>
            <td>{sr.ceFormat}</td>
            <td>{sr.ceNote}</td>
          </tr>
          <tr>
            <td><strong>{sr.eeName}</strong></td>
            <td>{sr.eeDuration}</td>
            <td>{sr.eeFormat}</td>
            <td>{sr.eeNote}</td>
          </tr>
          <tr>
            <td><strong>{sr.eoName}</strong></td>
            <td>{sr.eoDuration}</td>
            <td>{sr.eoFormat}</td>
            <td>{sr.eoNote}</td>
          </tr>
        </tbody>
      </table>
      <p>{c.breaksNote}</p>

      <h2>{c.h2mistakes}</h2>
      <h3>{c.mistake1Title}</h3>
      <p>{c.mistake1Body}</p>
      <h3>{c.mistake2Title}</h3>
      <p>{c.mistake2Body}</p>
      <h3>{c.mistake3Title}</h3>
      <p>{c.mistake3Body}</p>
      <h3>{c.mistake4Title}</h3>
      <p>{c.mistake4Body}</p>

      <h2>{c.h2after}</h2>
      <ul>
        {c.afterList.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{c.validityNote}</p>

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
