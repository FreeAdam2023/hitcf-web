/**
 * French expressions for TCF preparation — connectors, patterns, idioms, phrases, registers.
 * Displayed in the ExpressionStrip and the /expressions page.
 */

export type ExpressionCategory =
  | "connector"
  | "pattern"
  | "idiom"
  | "phrase"
  | "register";

export type ExpressionLevel = "A2" | "B1" | "B2" | "C1";

export interface FrenchExpression {
  id: string;
  fr: string;
  phonetic: string;
  category: ExpressionCategory;
  level: ExpressionLevel;
  meaning: { zh: string; en: string; fr: string; ar: string };
  example_fr: string;
  example_translation: { zh: string; en: string; ar: string };
  usage_tip: { zh: string; en: string; ar: string };
  tags: readonly ("writing" | "speaking")[];
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export const FRENCH_EXPRESSIONS: readonly FrenchExpression[] = [
  // ===== CONNECTORS (连接词) =====
  {
    id: "en-revanche",
    fr: "En revanche",
    phonetic: "/ɑ̃ ʁə.vɑ̃ʃ/",
    category: "connector",
    level: "B2",
    meaning: {
      zh: "然而，相反",
      en: "On the other hand / However",
      fr: "Par contre, à l'inverse",
      ar: "في المقابل، من ناحية أخرى",
    },
    example_fr:
      "Le projet a échoué. En revanche, nous avons beaucoup appris de cette expérience.",
    example_translation: {
      zh: "项目失败了。然而，我们从中学到了很多。",
      en: "The project failed. However, we learned a lot from this experience.",
      ar: "فشل المشروع. في المقابل، تعلّمنا الكثير من هذه التجربة.",
    },
    usage_tip: {
      zh: "比 mais 更正式，TCF 写作中引出对比观点时首选",
      en: "More formal than 'mais' — ideal for contrasting viewpoints in TCF writing",
      ar: "أكثر رسمية من mais — مثالي للمقارنة في كتابة TCF",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "neanmoins",
    fr: "Néanmoins",
    phonetic: "/ne.ɑ̃.mwɛ̃/",
    category: "connector",
    level: "B2",
    meaning: {
      zh: "然而，尽管如此",
      en: "Nevertheless / Nonetheless",
      fr: "Cependant, malgré cela",
      ar: "مع ذلك، رغم ذلك",
    },
    example_fr:
      "La situation est difficile. Néanmoins, nous restons optimistes.",
    example_translation: {
      zh: "情况很困难。尽管如此，我们仍然乐观。",
      en: "The situation is difficult. Nevertheless, we remain optimistic.",
      ar: "الوضع صعب. مع ذلك، نبقى متفائلين.",
    },
    usage_tip: {
      zh: "用于让步转折，比 cependant 语气更强，适合写作 Tâche 3 的论证",
      en: "Stronger concession than 'cependant' — great for argumentation in Tâche 3",
      ar: "تنازل أقوى من cependant — ممتاز للحجج في المهمة 3",
    },
    tags: ["writing"],
  },
  {
    id: "par-ailleurs",
    fr: "Par ailleurs",
    phonetic: "/pa.ʁ‿a.jœʁ/",
    category: "connector",
    level: "B2",
    meaning: {
      zh: "此外，另外",
      en: "Furthermore / Moreover / Besides",
      fr: "De plus, en outre",
      ar: "فضلاً عن ذلك، علاوة على ذلك",
    },
    example_fr:
      "Ce restaurant est excellent. Par ailleurs, les prix sont très raisonnables.",
    example_translation: {
      zh: "这家餐厅非常棒。此外，价格也很合理。",
      en: "This restaurant is excellent. Moreover, the prices are very reasonable.",
      ar: "هذا المطعم ممتاز. فضلاً عن ذلك، الأسعار معقولة جداً.",
    },
    usage_tip: {
      zh: "用于补充新论点，比 de plus 更书面，适合写作中展开第二个论据",
      en: "Adds a new argument — more literary than 'de plus', ideal for essay development",
      ar: "يضيف حجة جديدة — أكثر أدبية من de plus",
    },
    tags: ["writing"],
  },
  {
    id: "en-outre",
    fr: "En outre",
    phonetic: "/ɑ̃.n‿utʁ/",
    category: "connector",
    level: "B2",
    meaning: {
      zh: "此外，而且",
      en: "In addition / Furthermore",
      fr: "De plus, par-dessus le marché",
      ar: "بالإضافة إلى ذلك",
    },
    example_fr:
      "L'entreprise a augmenté ses revenus. En outre, elle a réduit ses coûts de production.",
    example_translation: {
      zh: "公司增加了收入。此外，还降低了生产成本。",
      en: "The company increased its revenue. In addition, it reduced production costs.",
      ar: "زادت الشركة إيراداتها. بالإضافة إلى ذلك، خفّضت تكاليف الإنتاج.",
    },
    usage_tip: {
      zh: "纯书面语连接词，口语中几乎不用，写作加分利器",
      en: "Purely written register — rarely used in speech, a scoring boost in essays",
      ar: "تسجيل كتابي بحت — نادراً في الكلام، يعزز الدرجات في المقالات",
    },
    tags: ["writing"],
  },
  {
    id: "cependant",
    fr: "Cependant",
    phonetic: "/sə.pɑ̃.dɑ̃/",
    category: "connector",
    level: "B1",
    meaning: {
      zh: "然而，但是",
      en: "However / Yet",
      fr: "Mais, toutefois",
      ar: "ومع ذلك، لكن",
    },
    example_fr:
      "Il fait beau aujourd'hui. Cependant, la météo annonce de la pluie ce soir.",
    example_translation: {
      zh: "今天天气不错。但是，天气预报说今晚有雨。",
      en: "The weather is nice today. However, the forecast says it will rain tonight.",
      ar: "الطقس جميل اليوم. ومع ذلك، تتوقع الأرصاد مطراً الليلة.",
    },
    usage_tip: {
      zh: "最常用的转折连接词，书面口语皆可，B1 必须掌握",
      en: "The most common concession connector — works in both speech and writing, essential at B1",
      ar: "أكثر أدوات الربط التنازلية شيوعاً — ضروري في B1",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "toutefois",
    fr: "Toutefois",
    phonetic: "/tut.fwa/",
    category: "connector",
    level: "B2",
    meaning: {
      zh: "不过，然而",
      en: "However / Still",
      fr: "Cependant, néanmoins",
      ar: "غير أنّ، إلا أنّ",
    },
    example_fr:
      "Cette solution semble efficace. Toutefois, elle présente certains risques.",
    example_translation: {
      zh: "这个方案看起来有效。不过，它存在一定风险。",
      en: "This solution seems effective. However, it presents certain risks.",
      ar: "يبدو هذا الحل فعالاً. غير أنه ينطوي على بعض المخاطر.",
    },
    usage_tip: {
      zh: "与 cependant 同义但更优雅，交替使用避免重复",
      en: "Synonym of 'cependant' but more elegant — alternate to avoid repetition",
      ar: "مرادف لـ cependant لكن أكثر أناقة — بدّل لتجنب التكرار",
    },
    tags: ["writing"],
  },
  {
    id: "dune-part-dautre-part",
    fr: "D'une part… d'autre part",
    phonetic: "/dyn paʁ… dotʁ paʁ/",
    category: "connector",
    level: "B2",
    meaning: {
      zh: "一方面……另一方面",
      en: "On the one hand… on the other hand",
      fr: "D'un côté… de l'autre",
      ar: "من جهة... ومن جهة أخرى",
    },
    example_fr:
      "D'une part, le télétravail améliore la qualité de vie. D'autre part, il peut nuire à la cohésion d'équipe.",
    example_translation: {
      zh: "一方面，远程办公提高了生活质量。另一方面，它可能损害团队凝聚力。",
      en: "On the one hand, remote work improves quality of life. On the other, it can harm team cohesion.",
      ar: "من جهة، يحسّن العمل عن بُعد جودة الحياة. ومن جهة أخرى، قد يضر بتماسك الفريق.",
    },
    usage_tip: {
      zh: "TCF 写作黄金结构：先摆正方，再摆反方，显示思辨能力",
      en: "Golden structure for TCF essays: present both sides to show critical thinking",
      ar: "هيكل ذهبي لمقالات TCF: اعرض الجانبين لإظهار التفكير النقدي",
    },
    tags: ["writing"],
  },
  {
    id: "par-consequent",
    fr: "Par conséquent",
    phonetic: "/paʁ kɔ̃.se.kɑ̃/",
    category: "connector",
    level: "B2",
    meaning: {
      zh: "因此，所以",
      en: "Consequently / Therefore",
      fr: "Donc, en conséquence",
      ar: "بالتالي، ولذلك",
    },
    example_fr:
      "Les ventes ont chuté de 30 %. Par conséquent, l'entreprise a dû licencier du personnel.",
    example_translation: {
      zh: "销售额下降了 30%。因此，公司不得不裁员。",
      en: "Sales dropped by 30%. Consequently, the company had to lay off staff.",
      ar: "انخفضت المبيعات 30%. بالتالي، اضطرت الشركة لتسريح موظفين.",
    },
    usage_tip: {
      zh: "表示因果结论，比 donc 更正式，适合写作结尾段",
      en: "Expresses causal conclusion — more formal than 'donc', great for concluding paragraphs",
      ar: "يعبّر عن استنتاج سببي — أكثر رسمية من donc",
    },
    tags: ["writing"],
  },
  {
    id: "cest-pourquoi",
    fr: "C'est pourquoi",
    phonetic: "/sɛ puʁ.kwa/",
    category: "connector",
    level: "B1",
    meaning: {
      zh: "这就是为什么",
      en: "That is why / This is why",
      fr: "Voilà pourquoi, pour cette raison",
      ar: "لهذا السبب، ولذلك",
    },
    example_fr:
      "L'éducation est un droit fondamental. C'est pourquoi l'accès à l'école doit être gratuit.",
    example_translation: {
      zh: "教育是基本权利。这就是为什么入学应该免费。",
      en: "Education is a fundamental right. That is why access to school must be free.",
      ar: "التعليم حق أساسي. لهذا السبب يجب أن يكون الالتحاق بالمدرسة مجانياً.",
    },
    usage_tip: {
      zh: "因果连接的口语化选择，写作口语都适用",
      en: "A natural cause-effect connector — works well in both writing and speaking",
      ar: "رابط سبب-نتيجة طبيعي — يعمل في الكتابة والكلام",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "de-plus",
    fr: "De plus",
    phonetic: "/də plys/",
    category: "connector",
    level: "B1",
    meaning: {
      zh: "而且，此外",
      en: "Moreover / What's more",
      fr: "En outre, qui plus est",
      ar: "علاوة على ذلك، فضلاً عن ذلك",
    },
    example_fr:
      "Ce cours est très complet. De plus, le professeur est passionnant.",
    example_translation: {
      zh: "这门课非常全面。而且，老师讲得很精彩。",
      en: "This course is very comprehensive. Moreover, the professor is fascinating.",
      ar: "هذه الدورة شاملة جداً. علاوة على ذلك، الأستاذ رائع.",
    },
    usage_tip: {
      zh: "最实用的递进连接词，简短有力，写作口语高频使用",
      en: "The most practical additive connector — short, punchy, high frequency",
      ar: "أكثر أدوات الإضافة عملية — قصير وقوي وعالي التردد",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "en-effet",
    fr: "En effet",
    phonetic: "/ɑ̃.n‿e.fɛ/",
    category: "connector",
    level: "B1",
    meaning: {
      zh: "确实，的确",
      en: "Indeed / In fact",
      fr: "Effectivement, c'est vrai que",
      ar: "في الواقع، بالفعل",
    },
    example_fr:
      "Le français est une langue riche. En effet, il possède un vocabulaire très étendu.",
    example_translation: {
      zh: "法语是一门丰富的语言。确实，它拥有非常广泛的词汇量。",
      en: "French is a rich language. Indeed, it has a very extensive vocabulary.",
      ar: "الفرنسية لغة غنية. بالفعل، تملك مفردات واسعة جداً.",
    },
    usage_tip: {
      zh: "用于解释或证实前句，是法语中最高频的书面连接词之一",
      en: "Used to explain or confirm the previous statement — one of the most frequent written connectors",
      ar: "يُستخدم لشرح أو تأكيد الجملة السابقة — من أكثر الروابط الكتابية تكراراً",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "dailleurs",
    fr: "D'ailleurs",
    phonetic: "/da.jœʁ/",
    category: "connector",
    level: "B1",
    meaning: {
      zh: "况且，再说",
      en: "Besides / Moreover / By the way",
      fr: "Du reste, de surcroît",
      ar: "فضلاً عن ذلك، بالمناسبة",
    },
    example_fr:
      "Je ne veux pas sortir ce soir. D'ailleurs, il pleut.",
    example_translation: {
      zh: "我今晚不想出门。况且，外面在下雨。",
      en: "I don't want to go out tonight. Besides, it's raining.",
      ar: "لا أريد الخروج الليلة. فضلاً عن ذلك، إنها تمطر.",
    },
    usage_tip: {
      zh: "补充一个支持性理由，口语中非常自然，面试口语时加分",
      en: "Adds a supporting reason — very natural in speech, a bonus in oral exams",
      ar: "يضيف سبباً داعماً — طبيعي جداً في الكلام",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "malgre-tout",
    fr: "Malgré tout",
    phonetic: "/mal.ɡʁe tu/",
    category: "connector",
    level: "B1",
    meaning: {
      zh: "尽管如此",
      en: "In spite of everything / Despite everything",
      fr: "Quand même, tout de même",
      ar: "رغم كل شيء",
    },
    example_fr:
      "La route était longue et fatigante. Malgré tout, nous sommes arrivés à l'heure.",
    example_translation: {
      zh: "路途漫长而疲惫。尽管如此，我们还是准时到达了。",
      en: "The road was long and tiring. Despite everything, we arrived on time.",
      ar: "كان الطريق طويلاً ومتعباً. رغم كل شيء، وصلنا في الموعد.",
    },
    usage_tip: {
      zh: "表达让步后的坚持，口语中常用，比 néanmoins 更生活化",
      en: "Expresses persistence despite obstacles — more conversational than 'néanmoins'",
      ar: "يعبّر عن المثابرة رغم العقبات — أكثر عفوية من néanmoins",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "en-fin-de-compte",
    fr: "En fin de compte",
    phonetic: "/ɑ̃ fɛ̃ də kɔ̃t/",
    category: "connector",
    level: "B2",
    meaning: {
      zh: "归根结底，最终",
      en: "Ultimately / In the end / All things considered",
      fr: "Finalement, tout bien considéré",
      ar: "في نهاية المطاف، في النهاية",
    },
    example_fr:
      "En fin de compte, c'est la qualité qui prime sur la quantité.",
    example_translation: {
      zh: "归根结底，质量比数量更重要。",
      en: "Ultimately, quality takes priority over quantity.",
      ar: "في نهاية المطاف، الجودة أهم من الكمية.",
    },
    usage_tip: {
      zh: "适合写作结论段总结全文观点",
      en: "Perfect for essay conclusions to summarize your overall position",
      ar: "مثالي لخاتمة المقال لتلخيص موقفك",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "a-vrai-dire",
    fr: "À vrai dire",
    phonetic: "/a vʁɛ diʁ/",
    category: "connector",
    level: "B1",
    meaning: {
      zh: "说实话，其实",
      en: "To tell the truth / Actually",
      fr: "En fait, pour être honnête",
      ar: "في الحقيقة، لأكون صريحاً",
    },
    example_fr:
      "À vrai dire, je n'ai pas très bien compris la question.",
    example_translation: {
      zh: "说实话，我没太理解这个问题。",
      en: "To tell the truth, I didn't quite understand the question.",
      ar: "في الحقيقة، لم أفهم السؤال جيداً.",
    },
    usage_tip: {
      zh: "口语面试中坦诚表达时非常自然，显得真诚",
      en: "Very natural in oral interviews for honest expression — shows sincerity",
      ar: "طبيعي جداً في المقابلات الشفهية — يُظهر الصدق",
    },
    tags: ["speaking"],
  },
  {
    id: "en-ce-qui-concerne",
    fr: "En ce qui concerne",
    phonetic: "/ɑ̃ sə ki kɔ̃.sɛʁn/",
    category: "connector",
    level: "B2",
    meaning: {
      zh: "关于，至于",
      en: "Regarding / As for / Concerning",
      fr: "Quant à, pour ce qui est de",
      ar: "فيما يتعلق بـ، أما بخصوص",
    },
    example_fr:
      "En ce qui concerne l'environnement, des mesures urgentes sont nécessaires.",
    example_translation: {
      zh: "关于环境问题，需要采取紧急措施。",
      en: "Regarding the environment, urgent measures are necessary.",
      ar: "فيما يتعلق بالبيئة، هناك حاجة لإجراءات عاجلة.",
    },
    usage_tip: {
      zh: "引入新话题时的万能句式，写作中切换论点必备",
      en: "Universal phrase for introducing a new topic — essential for switching arguments in essays",
      ar: "عبارة عالمية لتقديم موضوع جديد — ضرورية في المقالات",
    },
    tags: ["writing", "speaking"],
  },

  // ===== PATTERNS (句式) =====
  {
    id: "il-est-indeniable-que",
    fr: "Il est indéniable que…",
    phonetic: "/il ɛ ɛ̃.de.njabl kə/",
    category: "pattern",
    level: "B2",
    meaning: {
      zh: "不可否认的是……",
      en: "It is undeniable that…",
      fr: "On ne peut nier que…",
      ar: "لا يمكن إنكار أنّ...",
    },
    example_fr:
      "Il est indéniable que la technologie a transformé notre quotidien.",
    example_translation: {
      zh: "不可否认的是，科技改变了我们的日常生活。",
      en: "It is undeniable that technology has transformed our daily lives.",
      ar: "لا يمكن إنكار أن التكنولوجيا غيّرت حياتنا اليومية.",
    },
    usage_tip: {
      zh: "写作开头强势引入观点，阅卷老师立刻感知 B2+ 水平",
      en: "Opens an essay with authority — examiners immediately recognize B2+ level",
      ar: "يفتتح المقال بقوة — يتعرف الممتحنون فوراً على مستوى B2+",
    },
    tags: ["writing"],
  },
  {
    id: "force-est-de-constater",
    fr: "Force est de constater que…",
    phonetic: "/fɔʁs ɛ də kɔ̃s.ta.te kə/",
    category: "pattern",
    level: "C1",
    meaning: {
      zh: "不得不承认……",
      en: "One must acknowledge that… / It must be noted that…",
      fr: "Il faut bien admettre que…",
      ar: "لا بد من الاعتراف بأنّ...",
    },
    example_fr:
      "Force est de constater que les inégalités continuent de se creuser.",
    example_translation: {
      zh: "不得不承认，不平等仍在加剧。",
      en: "One must acknowledge that inequalities continue to widen.",
      ar: "لا بد من الاعتراف بأن الفجوات لا تزال تتسع.",
    },
    usage_tip: {
      zh: "C1 级高分句式，用于引出令人遗憾但不得不面对的事实",
      en: "C1-level high-scoring pattern — introduces an inconvenient but undeniable fact",
      ar: "نمط C1 عالي الدرجات — يقدّم حقيقة لا يمكن تجاهلها",
    },
    tags: ["writing"],
  },
  {
    id: "il-va-sans-dire",
    fr: "Il va sans dire que…",
    phonetic: "/il va sɑ̃ diʁ kə/",
    category: "pattern",
    level: "B2",
    meaning: {
      zh: "不言而喻……",
      en: "It goes without saying that…",
      fr: "Évidemment, bien entendu",
      ar: "غنيّ عن القول أنّ...",
    },
    example_fr:
      "Il va sans dire que la sécurité des enfants est notre priorité.",
    example_translation: {
      zh: "不言而喻，儿童安全是我们的首要任务。",
      en: "It goes without saying that children's safety is our priority.",
      ar: "غنيّ عن القول أن سلامة الأطفال أولويتنا.",
    },
    usage_tip: {
      zh: "用于引出大家公认的事实，显得论证有底气",
      en: "Introduces a widely accepted fact — shows confidence in argumentation",
      ar: "يقدّم حقيقة مقبولة على نطاق واسع — يُظهر ثقة في الحجة",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "il-convient-de-souligner",
    fr: "Il convient de souligner que…",
    phonetic: "/il kɔ̃.vjɛ̃ də su.li.ɲe kə/",
    category: "pattern",
    level: "C1",
    meaning: {
      zh: "值得强调的是……",
      en: "It is worth emphasizing that…",
      fr: "Il faut insister sur le fait que…",
      ar: "من الجدير بالتأكيد أنّ...",
    },
    example_fr:
      "Il convient de souligner que cette mesure bénéficie à l'ensemble de la population.",
    example_translation: {
      zh: "值得强调的是，这项措施惠及全体居民。",
      en: "It is worth emphasizing that this measure benefits the entire population.",
      ar: "من الجدير بالتأكيد أن هذا الإجراء يفيد السكان جميعاً.",
    },
    usage_tip: {
      zh: "写作中强调关键论点，比 il faut noter 更高级",
      en: "Highlights a key argument in writing — more advanced than 'il faut noter'",
      ar: "يبرز حجة رئيسية — أكثر تقدماً من il faut noter",
    },
    tags: ["writing"],
  },
  {
    id: "il-savere-que",
    fr: "Il s'avère que…",
    phonetic: "/il sa.vɛʁ kə/",
    category: "pattern",
    level: "B2",
    meaning: {
      zh: "事实证明……",
      en: "It turns out that… / It proves to be…",
      fr: "Il apparaît que, il se trouve que",
      ar: "تبيّن أنّ...",
    },
    example_fr:
      "Il s'avère que cette méthode est plus efficace que prévu.",
    example_translation: {
      zh: "事实证明，这种方法比预期的更有效。",
      en: "It turns out that this method is more effective than expected.",
      ar: "تبيّن أن هذه الطريقة أكثر فعالية مما كان متوقعاً.",
    },
    usage_tip: {
      zh: "用于呈现调查结果或出人意料的发现",
      en: "Used to present findings or surprising discoveries",
      ar: "يُستخدم لعرض النتائج أو الاكتشافات المفاجئة",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "tout-porte-a-croire",
    fr: "Tout porte à croire que…",
    phonetic: "/tu pɔʁt‿a kʁwaʁ kə/",
    category: "pattern",
    level: "C1",
    meaning: {
      zh: "一切都表明……",
      en: "Everything suggests that… / All signs point to…",
      fr: "Tout indique que, tout laisse penser que",
      ar: "كل شيء يشير إلى أنّ...",
    },
    example_fr:
      "Tout porte à croire que la situation va s'améliorer dans les prochains mois.",
    example_translation: {
      zh: "一切都表明，未来几个月情况会好转。",
      en: "Everything suggests that the situation will improve in the coming months.",
      ar: "كل شيء يشير إلى أن الوضع سيتحسن في الأشهر القادمة.",
    },
    usage_tip: {
      zh: "C1 级推测句式，用于有根据的预测，比 je pense que 高级很多",
      en: "C1-level deduction — for evidence-based predictions, far above 'je pense que'",
      ar: "استنتاج مستوى C1 — للتنبؤات المبنية على أدلة",
    },
    tags: ["writing"],
  },
  {
    id: "il-ne-fait-aucun-doute",
    fr: "Il ne fait aucun doute que…",
    phonetic: "/il nə fɛ o.kœ̃ dut kə/",
    category: "pattern",
    level: "B2",
    meaning: {
      zh: "毫无疑问……",
      en: "There is no doubt that…",
      fr: "Il est certain que, sans aucun doute",
      ar: "لا شك أنّ...",
    },
    example_fr:
      "Il ne fait aucun doute que l'éducation joue un rôle clé dans le développement.",
    example_translation: {
      zh: "毫无疑问，教育在发展中发挥着关键作用。",
      en: "There is no doubt that education plays a key role in development.",
      ar: "لا شك أن التعليم يلعب دوراً محورياً في التنمية.",
    },
    usage_tip: {
      zh: "用于强调确定性，适合论述文开头或结论",
      en: "Emphasizes certainty — fits essay openings or conclusions",
      ar: "يؤكد اليقين — يناسب افتتاحية المقال أو خاتمته",
    },
    tags: ["writing"],
  },
  {
    id: "a-mon-sens",
    fr: "À mon sens",
    phonetic: "/a mɔ̃ sɑ̃s/",
    category: "pattern",
    level: "B2",
    meaning: {
      zh: "在我看来",
      en: "In my view / As I see it",
      fr: "Selon moi, à mon avis",
      ar: "في رأيي، من وجهة نظري",
    },
    example_fr:
      "À mon sens, il faudrait investir davantage dans les énergies renouvelables.",
    example_translation: {
      zh: "在我看来，应该加大对可再生能源的投资。",
      en: "In my view, we should invest more in renewable energy.",
      ar: "في رأيي، يجب استثمار المزيد في الطاقات المتجددة.",
    },
    usage_tip: {
      zh: "比 je pense que 更正式更高级，TCF 口语和写作表达个人观点首选",
      en: "More formal than 'je pense que' — preferred for expressing opinions in TCF",
      ar: "أكثر رسمية من je pense que — مفضّل للتعبير عن الرأي في TCF",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "il-me-semble-que",
    fr: "Il me semble que…",
    phonetic: "/il mə sɑ̃bl kə/",
    category: "pattern",
    level: "B1",
    meaning: {
      zh: "我觉得……",
      en: "It seems to me that…",
      fr: "J'ai l'impression que…",
      ar: "يبدو لي أنّ...",
    },
    example_fr:
      "Il me semble que cette proposition mérite d'être étudiée plus en détail.",
    example_translation: {
      zh: "我觉得这个提议值得更深入地研究。",
      en: "It seems to me that this proposal deserves closer examination.",
      ar: "يبدو لي أن هذا الاقتراح يستحق دراسة أعمق.",
    },
    usage_tip: {
      zh: "礼貌地表达观点，避免太绝对，口语面试中很加分",
      en: "Politely expresses an opinion without being absolute — a bonus in oral exams",
      ar: "يعبّر عن رأي بأدب دون قطعية — مكافأة في الامتحان الشفهي",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "il-est-primordial-de",
    fr: "Il est primordial de…",
    phonetic: "/il ɛ pʁi.mɔʁ.djal də/",
    category: "pattern",
    level: "B2",
    meaning: {
      zh: "……至关重要",
      en: "It is essential to… / It is paramount to…",
      fr: "Il est essentiel de, il est fondamental de",
      ar: "من الضروري جداً أن...",
    },
    example_fr:
      "Il est primordial de protéger la biodiversité pour les générations futures.",
    example_translation: {
      zh: "保护生物多样性对子孙后代至关重要。",
      en: "It is essential to protect biodiversity for future generations.",
      ar: "من الضروري جداً حماية التنوع البيولوجي للأجيال القادمة.",
    },
    usage_tip: {
      zh: "比 il est important 强烈得多，适合强调核心论点",
      en: "Much stronger than 'il est important' — use to emphasize a central argument",
      ar: "أقوى بكثير من il est important — للتأكيد على حجة مركزية",
    },
    tags: ["writing"],
  },
  {
    id: "cela-met-en-lumiere",
    fr: "Cela met en lumière…",
    phonetic: "/sla mɛ ɑ̃ ly.mjɛʁ/",
    category: "pattern",
    level: "C1",
    meaning: {
      zh: "这揭示了……",
      en: "This highlights… / This sheds light on…",
      fr: "Cela révèle, cela montre clairement",
      ar: "هذا يسلّط الضوء على...",
    },
    example_fr:
      "Cela met en lumière les lacunes du système éducatif actuel.",
    example_translation: {
      zh: "这揭示了当前教育系统的不足。",
      en: "This highlights the shortcomings of the current education system.",
      ar: "هذا يسلّط الضوء على أوجه قصور النظام التعليمي الحالي.",
    },
    usage_tip: {
      zh: "用于分析论证中引出深层含义，C1 写作高分句式",
      en: "Used in analytical arguments to reveal deeper implications — C1 high-scoring pattern",
      ar: "يُستخدم في الحجج التحليلية للكشف عن دلالات أعمق",
    },
    tags: ["writing"],
  },
  {
    id: "pour-conclure",
    fr: "Pour conclure",
    phonetic: "/puʁ kɔ̃.klyʁ/",
    category: "pattern",
    level: "B1",
    meaning: {
      zh: "总之，最后",
      en: "To conclude / In conclusion",
      fr: "En conclusion, pour finir",
      ar: "في الختام، للخلاصة",
    },
    example_fr:
      "Pour conclure, je dirais que le bilinguisme est un atout majeur dans le monde actuel.",
    example_translation: {
      zh: "总之，我认为双语能力是当今世界的一大优势。",
      en: "To conclude, I would say that bilingualism is a major asset in today's world.",
      ar: "في الختام، أقول إن ثنائية اللغة ميزة كبرى في عالم اليوم.",
    },
    usage_tip: {
      zh: "写作和口语结尾的标准信号词，让考官知道你要收束了",
      en: "Standard closing signal in both writing and speaking — tells the examiner you're wrapping up",
      ar: "إشارة ختامية قياسية — تُعلم الممتحن أنك تختتم",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "en-somme",
    fr: "En somme",
    phonetic: "/ɑ̃ sɔm/",
    category: "pattern",
    level: "B2",
    meaning: {
      zh: "总而言之",
      en: "In short / All in all",
      fr: "En résumé, tout compte fait",
      ar: "باختصار، إجمالاً",
    },
    example_fr:
      "En somme, les avantages l'emportent largement sur les inconvénients.",
    example_translation: {
      zh: "总而言之，优点远远大于缺点。",
      en: "All in all, the advantages far outweigh the disadvantages.",
      ar: "إجمالاً، المزايا تفوق العيوب بكثير.",
    },
    usage_tip: {
      zh: "比 en conclusion 更简洁优雅，适合结尾总结",
      en: "More concise and elegant than 'en conclusion' — ideal for closing summaries",
      ar: "أكثر إيجازاً وأناقة من en conclusion",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "on-pourrait-affirmer",
    fr: "On pourrait affirmer que…",
    phonetic: "/ɔ̃ pu.ʁɛ a.fiʁ.me kə/",
    category: "pattern",
    level: "B2",
    meaning: {
      zh: "可以说……",
      en: "One could argue that… / It could be said that…",
      fr: "On peut dire que, il est possible d'avancer que",
      ar: "يمكن القول إنّ...",
    },
    example_fr:
      "On pourrait affirmer que les réseaux sociaux ont révolutionné la communication.",
    example_translation: {
      zh: "可以说，社交媒体彻底改变了沟通方式。",
      en: "One could argue that social media has revolutionized communication.",
      ar: "يمكن القول إن وسائل التواصل الاجتماعي أحدثت ثورة في التواصل.",
    },
    usage_tip: {
      zh: "条件式表达观点，语气谨慎得体，比直接断言更有学术感",
      en: "Conditional expression of opinion — more cautious and academic than direct assertion",
      ar: "تعبير شرطي عن الرأي — أكثر حذراً وأكاديمية",
    },
    tags: ["writing"],
  },

  // ===== IDIOMS (俚语/惯用语) =====
  {
    id: "avoir-le-cafard",
    fr: "Avoir le cafard",
    phonetic: "/a.vwaʁ lə ka.faʁ/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "心情低落，郁闷",
      en: "To feel blue / To be down",
      fr: "Être triste, déprimé",
      ar: "الشعور بالحزن والاكتئاب",
    },
    example_fr: "Depuis son départ, j'ai le cafard.",
    example_translation: {
      zh: "自从他离开后，我一直很郁闷。",
      en: "Since he left, I've been feeling blue.",
      ar: "منذ رحيله، أشعر بالحزن.",
    },
    usage_tip: {
      zh: "口语 Tâche 2 描述情绪时用，比 je suis triste 地道得多",
      en: "Use in Tâche 2 to describe emotions — much more authentic than 'je suis triste'",
      ar: "استخدمه في المهمة 2 لوصف المشاعر — أكثر أصالة من je suis triste",
    },
    tags: ["speaking"],
  },
  {
    id: "poser-un-lapin",
    fr: "Poser un lapin",
    phonetic: "/po.ze œ̃ la.pɛ̃/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "放鸽子，爽约",
      en: "To stand someone up",
      fr: "Ne pas venir à un rendez-vous",
      ar: "عدم الحضور لموعد، إخلاف الوعد",
    },
    example_fr: "Il m'a posé un lapin hier soir, je l'ai attendu pendant une heure.",
    example_translation: {
      zh: "他昨晚放了我鸽子，我等了他一个小时。",
      en: "He stood me up last night — I waited for him for an hour.",
      ar: "أخلف موعده معي البارحة، انتظرته ساعة كاملة.",
    },
    usage_tip: {
      zh: "TCF 阅读理解中常出现，听力中也可能遇到",
      en: "Frequently appears in TCF reading comprehension and may come up in listening",
      ar: "يظهر كثيراً في فهم القراءة في TCF وقد يظهر في الاستماع",
    },
    tags: ["speaking"],
  },
  {
    id: "avoir-la-peche",
    fr: "Avoir la pêche",
    phonetic: "/a.vwaʁ la pɛʃ/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "精力充沛，状态很好",
      en: "To be full of energy / To feel great",
      fr: "Être en pleine forme, avoir de l'énergie",
      ar: "أن تكون مفعماً بالحيوية والنشاط",
    },
    example_fr: "Ce matin, j'ai la pêche ! J'ai envie de tout faire.",
    example_translation: {
      zh: "今天早上我状态超好！什么都想做。",
      en: "This morning I'm full of energy! I feel like doing everything.",
      ar: "هذا الصباح أنا مفعم بالنشاط! أريد فعل كل شيء.",
    },
    usage_tip: {
      zh: "日常口语高频表达，描述好状态时比 je suis en forme 更生动",
      en: "High-frequency colloquial expression — more vivid than 'je suis en forme'",
      ar: "تعبير عامي عالي التردد — أكثر حيوية من je suis en forme",
    },
    tags: ["speaking"],
  },
  {
    id: "tomber-dans-les-pommes",
    fr: "Tomber dans les pommes",
    phonetic: "/tɔ̃.be dɑ̃ le pɔm/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "晕倒，昏过去",
      en: "To faint / To pass out",
      fr: "S'évanouir, perdre connaissance",
      ar: "الإغماء، فقدان الوعي",
    },
    example_fr: "Il faisait tellement chaud qu'elle est tombée dans les pommes.",
    example_translation: {
      zh: "天太热了，她晕倒了。",
      en: "It was so hot that she fainted.",
      ar: "كان الجو حاراً جداً لدرجة أنها أُغمي عليها.",
    },
    usage_tip: {
      zh: "听力中常出现的表达，不能按字面意思理解为「掉进苹果里」",
      en: "Common in listening — don't interpret literally as 'falling into apples'",
      ar: "شائع في الاستماع — لا تفسره حرفياً بأنه 'السقوط في التفاح'",
    },
    tags: ["speaking"],
  },
  {
    id: "avoir-du-pain-sur-la-planche",
    fr: "Avoir du pain sur la planche",
    phonetic: "/a.vwaʁ dy pɛ̃ syʁ la plɑ̃ʃ/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "有很多事要做",
      en: "To have a lot on one's plate",
      fr: "Avoir beaucoup de travail à faire",
      ar: "لديه الكثير من العمل",
    },
    example_fr: "Avec cet examen qui approche, j'ai du pain sur la planche !",
    example_translation: {
      zh: "考试快到了，我有一大堆事要做！",
      en: "With this exam coming up, I've got a lot on my plate!",
      ar: "مع اقتراب الامتحان، لديّ الكثير من العمل!",
    },
    usage_tip: {
      zh: "描述忙碌时非常地道，你现在备考 TCF 就可以说这句！",
      en: "Very authentic when describing being busy — you can say this about your TCF prep right now!",
      ar: "أصيل جداً عند وصف الانشغال — يمكنك قولها عن تحضيرك لـ TCF!",
    },
    tags: ["speaking"],
  },
  {
    id: "ce-nest-pas-la-mer-a-boire",
    fr: "Ce n'est pas la mer à boire",
    phonetic: "/sə nɛ pa la mɛʁ a bwaʁ/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "没那么难，不是什么大不了的事",
      en: "It's not the end of the world / It's not that hard",
      fr: "Ce n'est pas si difficile que ça",
      ar: "ليس بالأمر الصعب، ليس مستحيلاً",
    },
    example_fr: "Apprendre le français, ce n'est pas la mer à boire !",
    example_translation: {
      zh: "学法语没那么难！",
      en: "Learning French is not that hard!",
      ar: "تعلّم الفرنسية ليس بالأمر المستحيل!",
    },
    usage_tip: {
      zh: "用于鼓励或淡化困难，口语中很常见",
      en: "Used to encourage or downplay difficulty — very common in speech",
      ar: "يُستخدم للتشجيع أو التقليل من الصعوبة — شائع جداً في الكلام",
    },
    tags: ["speaking"],
  },
  {
    id: "coup-de-foudre",
    fr: "Avoir le coup de foudre",
    phonetic: "/a.vwaʁ lə ku də fudʁ/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "一见钟情",
      en: "Love at first sight",
      fr: "Tomber amoureux instantanément",
      ar: "الحب من النظرة الأولى",
    },
    example_fr: "Quand je l'ai vue pour la première fois, ça a été le coup de foudre.",
    example_translation: {
      zh: "第一次见到她时，我就一见钟情了。",
      en: "When I saw her for the first time, it was love at first sight.",
      ar: "عندما رأيتها لأول مرة، كان حباً من النظرة الأولى.",
    },
    usage_tip: {
      zh: "法语中最浪漫的表达之一，字面意思是「闪电一击」",
      en: "One of the most romantic French expressions — literally 'a bolt of lightning'",
      ar: "من أكثر التعبيرات الفرنسية رومانسية — حرفياً 'صاعقة برق'",
    },
    tags: ["speaking"],
  },
  {
    id: "donner-sa-langue-au-chat",
    fr: "Donner sa langue au chat",
    phonetic: "/dɔ.ne sa lɑ̃ɡ o ʃa/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "放弃猜测，认输",
      en: "To give up guessing",
      fr: "Renoncer à deviner, abandonner",
      ar: "التخلي عن التخمين، الاستسلام",
    },
    example_fr: "Tu ne trouves pas la réponse ? Allez, donne ta langue au chat !",
    example_translation: {
      zh: "你猜不出来吗？算了，放弃吧！",
      en: "Can't find the answer? Come on, give up!",
      ar: "لا تجد الإجابة؟ هيا، استسلم!",
    },
    usage_tip: {
      zh: "TCF 听力中可能出现的趣味表达，字面意思是「把舌头给猫」",
      en: "A fun expression that may appear in TCF listening — literally 'give your tongue to the cat'",
      ar: "تعبير ممتع قد يظهر في استماع TCF — حرفياً 'أعطِ لسانك للقط'",
    },
    tags: ["speaking"],
  },
  {
    id: "faire-dune-pierre-deux-coups",
    fr: "Faire d'une pierre deux coups",
    phonetic: "/fɛʁ dyn pjɛʁ dø ku/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "一石二鸟，一举两得",
      en: "To kill two birds with one stone",
      fr: "Obtenir deux résultats avec une seule action",
      ar: "ضرب عصفورين بحجر واحد",
    },
    example_fr: "En étudiant le français, je fais d'une pierre deux coups : j'apprends une langue et je prépare mon immigration.",
    example_translation: {
      zh: "学法语让我一举两得：学了一门语言，还准备了移民。",
      en: "By studying French, I kill two birds with one stone: I learn a language and prepare my immigration.",
      ar: "بدراسة الفرنسية، أضرب عصفورين بحجر: أتعلم لغة وأحضّر لهجرتي.",
    },
    usage_tip: {
      zh: "写作和口语中都能用，表达做一件事有多重好处",
      en: "Works in both writing and speaking — expresses getting multiple benefits from one action",
      ar: "يعمل في الكتابة والكلام — للتعبير عن فوائد متعددة من فعل واحد",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "etre-dans-la-lune",
    fr: "Être dans la lune",
    phonetic: "/ɛtʁ dɑ̃ la lyn/",
    category: "idiom",
    level: "A2",
    meaning: {
      zh: "心不在焉，走神",
      en: "To be daydreaming / To have one's head in the clouds",
      fr: "Être distrait, rêvasser",
      ar: "شارد الذهن، يحلم أحلام يقظة",
    },
    example_fr: "Tu m'écoutes ? Tu es encore dans la lune !",
    example_translation: {
      zh: "你在听我说吗？你又走神了！",
      en: "Are you listening? You're daydreaming again!",
      ar: "هل تسمعني؟ أنت شارد الذهن مجدداً!",
    },
    usage_tip: {
      zh: "入门级惯用语，日常对话中非常高频",
      en: "Beginner-friendly idiom — very high frequency in daily conversation",
      ar: "تعبير مناسب للمبتدئين — عالي التردد في المحادثات اليومية",
    },
    tags: ["speaking"],
  },
  {
    id: "mettre-son-grain-de-sel",
    fr: "Mettre son grain de sel",
    phonetic: "/mɛtʁ sɔ̃ ɡʁɛ̃ də sɛl/",
    category: "idiom",
    level: "B2",
    meaning: {
      zh: "多管闲事，插嘴",
      en: "To put in one's two cents / To butt in",
      fr: "Donner son avis sans qu'on le demande",
      ar: "التدخل برأيه دون أن يُطلب منه",
    },
    example_fr: "Il faut toujours qu'il mette son grain de sel dans la conversation !",
    example_translation: {
      zh: "他总是要在对话中插嘴！",
      en: "He always has to put in his two cents!",
      ar: "دائماً يتدخل برأيه في الحديث!",
    },
    usage_tip: {
      zh: "描述多嘴的人时用，带轻微贬义，口语中常见",
      en: "Used to describe someone who always chimes in — slightly negative, common in speech",
      ar: "يصف من يتدخل دائماً — سلبي قليلاً، شائع في الكلام",
    },
    tags: ["speaking"],
  },
  {
    id: "tourner-autour-du-pot",
    fr: "Tourner autour du pot",
    phonetic: "/tuʁ.ne o.tuʁ dy po/",
    category: "idiom",
    level: "B2",
    meaning: {
      zh: "拐弯抹角，说话绕圈子",
      en: "To beat around the bush",
      fr: "Ne pas aller droit au but, hésiter à dire les choses",
      ar: "اللف والدوران، عدم الدخول في الموضوع مباشرة",
    },
    example_fr: "Arrête de tourner autour du pot et dis-moi ce qui s'est passé !",
    example_translation: {
      zh: "别拐弯抹角了，告诉我发生了什么！",
      en: "Stop beating around the bush and tell me what happened!",
      ar: "توقف عن اللف والدوران وأخبرني ما حدث!",
    },
    usage_tip: {
      zh: "听力理解中常出现，理解后能帮你抓住对话的关键转折",
      en: "Common in listening comprehension — understanding it helps catch key conversation turns",
      ar: "شائع في فهم الاستماع — فهمه يساعد على التقاط النقاط المحورية",
    },
    tags: ["speaking"],
  },
  {
    id: "couper-la-poire-en-deux",
    fr: "Couper la poire en deux",
    phonetic: "/ku.pe la pwaʁ ɑ̃ dø/",
    category: "idiom",
    level: "B2",
    meaning: {
      zh: "各退一步，折中",
      en: "To meet halfway / To compromise",
      fr: "Faire un compromis, trouver un terrain d'entente",
      ar: "التوصل إلى حل وسط",
    },
    example_fr: "On n'est pas d'accord sur le prix ? Coupons la poire en deux.",
    example_translation: {
      zh: "我们对价格达不成一致？各退一步吧。",
      en: "We can't agree on the price? Let's meet halfway.",
      ar: "لا نتفق على السعر؟ لنتوصل إلى حل وسط.",
    },
    usage_tip: {
      zh: "谈判或讨论话题时很实用，口语面试描述解决冲突时可以用",
      en: "Useful in negotiations — great in oral exams when describing conflict resolution",
      ar: "مفيد في المفاوضات — ممتاز في الشفهي عند وصف حل النزاعات",
    },
    tags: ["speaking"],
  },
  {
    id: "avoir-un-chat-dans-la-gorge",
    fr: "Avoir un chat dans la gorge",
    phonetic: "/a.vwaʁ œ̃ ʃa dɑ̃ la ɡɔʁʒ/",
    category: "idiom",
    level: "B1",
    meaning: {
      zh: "嗓子不舒服，声音沙哑",
      en: "To have a frog in one's throat",
      fr: "Avoir la voix enrouée, avoir du mal à parler",
      ar: "أن يكون صوتك أجشّ، صعوبة في الكلام",
    },
    example_fr: "Excuse-moi, j'ai un chat dans la gorge ce matin.",
    example_translation: {
      zh: "抱歉，我今早嗓子不太舒服。",
      en: "Sorry, I have a frog in my throat this morning.",
      ar: "عذراً، صوتي أجش هذا الصباح.",
    },
    usage_tip: {
      zh: "法语说「喉咙里有猫」，英语说「喉咙里有青蛙」，有趣的文化差异",
      en: "French says 'a cat in the throat', English says 'a frog' — fun cultural difference",
      ar: "الفرنسية تقول 'قط في الحلق'، الإنجليزية تقول 'ضفدع' — اختلاف ثقافي طريف",
    },
    tags: ["speaking"],
  },

  // ===== PHRASES (词组) =====
  {
    id: "au-fur-et-a-mesure",
    fr: "Au fur et à mesure",
    phonetic: "/o fyʁ e a mə.zyʁ/",
    category: "phrase",
    level: "B2",
    meaning: {
      zh: "逐渐地，随着",
      en: "Gradually / As (something progresses)",
      fr: "Progressivement, petit à petit",
      ar: "تدريجياً، شيئاً فشيئاً",
    },
    example_fr: "Au fur et à mesure de mes études, j'ai compris l'importance du français.",
    example_translation: {
      zh: "随着学习的深入，我理解了法语的重要性。",
      en: "As my studies progressed, I understood the importance of French.",
      ar: "مع تقدم دراستي، فهمت أهمية الفرنسية.",
    },
    usage_tip: {
      zh: "描述渐进过程的首选表达，写作中展示时间推移非常好用",
      en: "Go-to expression for gradual processes — excellent for showing progression in essays",
      ar: "التعبير المفضّل للعمليات التدريجية — ممتاز لإظهار التطور في المقالات",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "en-loccurrence",
    fr: "En l'occurrence",
    phonetic: "/ɑ̃ lɔ.ky.ʁɑ̃s/",
    category: "phrase",
    level: "B2",
    meaning: {
      zh: "在这种情况下，具体来说",
      en: "In this case / Specifically",
      fr: "Dans ce cas précis, ici",
      ar: "في هذه الحالة، تحديداً",
    },
    example_fr: "Plusieurs pays sont concernés, en l'occurrence la France et le Canada.",
    example_translation: {
      zh: "多个国家受到影响，具体来说是法国和加拿大。",
      en: "Several countries are affected, specifically France and Canada.",
      ar: "عدة دول معنية، تحديداً فرنسا وكندا.",
    },
    usage_tip: {
      zh: "用于从一般论述过渡到具体例子，写作中非常加分",
      en: "Transitions from general to specific — a scoring boost in essays",
      ar: "ينتقل من العام إلى الخاص — يعزز الدرجات في المقالات",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "a-lheure-actuelle",
    fr: "À l'heure actuelle",
    phonetic: "/a lœʁ ak.tɥɛl/",
    category: "phrase",
    level: "B2",
    meaning: {
      zh: "目前，当下",
      en: "At present / Currently",
      fr: "Actuellement, en ce moment",
      ar: "في الوقت الحالي، حالياً",
    },
    example_fr: "À l'heure actuelle, le chômage reste un problème majeur.",
    example_translation: {
      zh: "目前，失业仍然是一个主要问题。",
      en: "At present, unemployment remains a major problem.",
      ar: "في الوقت الحالي، لا تزال البطالة مشكلة كبرى.",
    },
    usage_tip: {
      zh: "比 maintenant 正式得多，写作开头引入当前话题的好选择",
      en: "Much more formal than 'maintenant' — great for introducing current topics in essays",
      ar: "أكثر رسمية بكثير من maintenant — ممتاز لتقديم المواضيع الحالية",
    },
    tags: ["writing"],
  },
  {
    id: "dans-la-mesure-ou",
    fr: "Dans la mesure où",
    phonetic: "/dɑ̃ la mə.zyʁ u/",
    category: "phrase",
    level: "B2",
    meaning: {
      zh: "鉴于，在……程度上",
      en: "Insofar as / To the extent that",
      fr: "Étant donné que, pour autant que",
      ar: "بقدر ما، نظراً لأنّ",
    },
    example_fr: "Dans la mesure où les ressources sont limitées, il faut les utiliser avec soin.",
    example_translation: {
      zh: "鉴于资源有限，必须谨慎使用。",
      en: "Insofar as resources are limited, they must be used carefully.",
      ar: "نظراً لأن الموارد محدودة، يجب استخدامها بعناية.",
    },
    usage_tip: {
      zh: "表达有条件的因果关系，比 parce que 高级，学术写作必备",
      en: "Expresses conditional causality — more advanced than 'parce que', essential for academic writing",
      ar: "يعبّر عن سببية مشروطة — أكثر تقدماً من parce que",
    },
    tags: ["writing"],
  },
  {
    id: "compte-tenu-de",
    fr: "Compte tenu de",
    phonetic: "/kɔ̃t tə.ny də/",
    category: "phrase",
    level: "B2",
    meaning: {
      zh: "考虑到，鉴于",
      en: "Given / Taking into account",
      fr: "Étant donné, en considérant",
      ar: "بالنظر إلى، مع الأخذ بعين الاعتبار",
    },
    example_fr: "Compte tenu de la situation économique, cette décision est compréhensible.",
    example_translation: {
      zh: "考虑到经济形势，这个决定是可以理解的。",
      en: "Given the economic situation, this decision is understandable.",
      ar: "بالنظر إلى الوضع الاقتصادي، هذا القرار مفهوم.",
    },
    usage_tip: {
      zh: "引入背景条件时使用，让论证更有说服力",
      en: "Used to introduce context conditions — makes your argumentation more convincing",
      ar: "يُستخدم لتقديم سياق — يجعل حجتك أكثر إقناعاً",
    },
    tags: ["writing"],
  },
  {
    id: "faute-de",
    fr: "Faute de",
    phonetic: "/fot də/",
    category: "phrase",
    level: "B2",
    meaning: {
      zh: "由于缺乏……",
      en: "For lack of / Due to a lack of",
      fr: "Par manque de, en l'absence de",
      ar: "بسبب نقص، لعدم وجود",
    },
    example_fr: "Faute de temps, nous n'avons pas pu terminer le projet.",
    example_translation: {
      zh: "由于时间不足，我们没能完成项目。",
      en: "For lack of time, we were unable to finish the project.",
      ar: "بسبب ضيق الوقت، لم نتمكن من إنهاء المشروع.",
    },
    usage_tip: {
      zh: "简洁有力的原因表达，两个词替代一整句解释",
      en: "Concise and powerful — two words replace an entire explanatory clause",
      ar: "موجز وقوي — كلمتان تحلان محل جملة توضيحية كاملة",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "au-sein-de",
    fr: "Au sein de",
    phonetic: "/o sɛ̃ də/",
    category: "phrase",
    level: "B2",
    meaning: {
      zh: "在……内部，在……当中",
      en: "Within / Inside",
      fr: "À l'intérieur de, parmi",
      ar: "في داخل، ضمن",
    },
    example_fr: "Au sein de notre équipe, la communication est essentielle.",
    example_translation: {
      zh: "在我们团队内部，沟通至关重要。",
      en: "Within our team, communication is essential.",
      ar: "داخل فريقنا، التواصل أساسي.",
    },
    usage_tip: {
      zh: "比 dans 更正式书面，适合描述组织、机构内部的情况",
      en: "More formal than 'dans' — ideal for describing internal dynamics of organizations",
      ar: "أكثر رسمية من dans — مثالي لوصف الديناميكيات الداخلية للمؤسسات",
    },
    tags: ["writing"],
  },
  {
    id: "en-depit-de",
    fr: "En dépit de",
    phonetic: "/ɑ̃ de.pi də/",
    category: "phrase",
    level: "B2",
    meaning: {
      zh: "尽管",
      en: "Despite / In spite of",
      fr: "Malgré, nonobstant",
      ar: "على الرغم من، رغم",
    },
    example_fr: "En dépit de ses efforts, il n'a pas réussi l'examen.",
    example_translation: {
      zh: "尽管他很努力，还是没通过考试。",
      en: "Despite his efforts, he did not pass the exam.",
      ar: "على الرغم من جهوده، لم ينجح في الامتحان.",
    },
    usage_tip: {
      zh: "比 malgré 更书面更正式，写作中让步论证时使用",
      en: "More literary than 'malgré' — use for concessive arguments in writing",
      ar: "أكثر أدبية من malgré — للحجج التنازلية في الكتابة",
    },
    tags: ["writing"],
  },
  {
    id: "grace-a",
    fr: "Grâce à",
    phonetic: "/ɡʁɑs a/",
    category: "phrase",
    level: "A2",
    meaning: {
      zh: "多亏了，由于（正面原因）",
      en: "Thanks to / Owing to",
      fr: "À cause de (sens positif)",
      ar: "بفضل",
    },
    example_fr: "Grâce à la technologie, on peut apprendre le français en ligne.",
    example_translation: {
      zh: "多亏了科技，我们可以在线学法语。",
      en: "Thanks to technology, we can learn French online.",
      ar: "بفضل التكنولوجيا، يمكننا تعلّم الفرنسية عبر الإنترنت.",
    },
    usage_tip: {
      zh: "注意：grâce à 只用于正面原因，负面原因用 à cause de",
      en: "Note: 'grâce à' is only for positive causes — use 'à cause de' for negative ones",
      ar: "ملاحظة: grâce à للأسباب الإيجابية فقط — استخدم à cause de للسلبية",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "a-la-suite-de",
    fr: "À la suite de",
    phonetic: "/a la sɥit də/",
    category: "phrase",
    level: "B1",
    meaning: {
      zh: "由于，在……之后",
      en: "Following / As a result of",
      fr: "Après, en conséquence de",
      ar: "عقب، نتيجة لـ",
    },
    example_fr: "À la suite de l'accident, la route a été fermée pendant deux heures.",
    example_translation: {
      zh: "事故发生后，道路被封闭了两个小时。",
      en: "Following the accident, the road was closed for two hours.",
      ar: "عقب الحادث، أُغلق الطريق لمدة ساعتين.",
    },
    usage_tip: {
      zh: "表达时间因果的正式说法，新闻报道和写作中高频出现",
      en: "Formal way to express temporal causality — high frequency in news and essays",
      ar: "طريقة رسمية للتعبير عن السببية الزمنية — عالي التردد في الأخبار",
    },
    tags: ["writing"],
  },
  {
    id: "vis-a-vis-de",
    fr: "Vis-à-vis de",
    phonetic: "/vi.z‿a.vi də/",
    category: "phrase",
    level: "B2",
    meaning: {
      zh: "关于，对于，面对",
      en: "With regard to / Towards",
      fr: "Par rapport à, envers",
      ar: "تجاه، فيما يخص",
    },
    example_fr: "L'attitude du gouvernement vis-à-vis de l'immigration a évolué.",
    example_translation: {
      zh: "政府对移民问题的态度已经发生了变化。",
      en: "The government's attitude towards immigration has changed.",
      ar: "تطور موقف الحكومة تجاه الهجرة.",
    },
    usage_tip: {
      zh: "讨论立场、态度时的正式用语，写作中表达「对于某议题」首选",
      en: "Formal language for discussing stances — preferred in essays for 'regarding an issue'",
      ar: "لغة رسمية لمناقشة المواقف — مفضّل في المقالات",
    },
    tags: ["writing"],
  },

  // ===== REGISTER (语域) =====
  {
    id: "register-travailler",
    fr: "Bosser → Travailler → Œuvrer",
    phonetic: "/bɔ.se/ → /tʁa.va.je/ → /œ.vʁe/",
    category: "register",
    level: "B1",
    meaning: {
      zh: "工作（口语 → 标准 → 书面）",
      en: "To work (colloquial → standard → literary)",
      fr: "Familier → Courant → Soutenu",
      ar: "العمل (عامي → معياري → أدبي)",
    },
    example_fr: "Familier : Je bosse ce week-end. | Courant : Je travaille ce week-end. | Soutenu : Il œuvre pour la paix.",
    example_translation: {
      zh: "口语：我这周末干活。| 标准：我这周末工作。| 书面：他为和平而努力。",
      en: "Colloquial: I'm working this weekend. | Standard: I work this weekend. | Literary: He labors for peace.",
      ar: "عامي: أشتغل نهاية الأسبوع. | معياري: أعمل نهاية الأسبوع. | أدبي: يكرّس جهده للسلام.",
    },
    usage_tip: {
      zh: "TCF 听力中常出现 bosser，写作中用 œuvrer 显高级，面试用 travailler 即可",
      en: "TCF listening often uses 'bosser'; use 'œuvrer' in writing for a boost; 'travailler' is safe for speaking",
      ar: "استماع TCF يستخدم bosser كثيراً؛ استخدم œuvrer في الكتابة؛ travailler آمن للكلام",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "register-manger",
    fr: "Bouffer → Manger → Se restaurer",
    phonetic: "/bu.fe/ → /mɑ̃.ʒe/ → /sə ʁɛs.to.ʁe/",
    category: "register",
    level: "B1",
    meaning: {
      zh: "吃（口语 → 标准 → 书面）",
      en: "To eat (colloquial → standard → formal)",
      fr: "Familier → Courant → Soutenu",
      ar: "الأكل (عامي → معياري → رسمي)",
    },
    example_fr: "Familier : On bouffe ensemble ce midi ? | Courant : On mange ensemble ? | Soutenu : Les invités se sont restaurés au salon.",
    example_translation: {
      zh: "口语：中午一起吃？| 标准：一起吃饭吗？| 书面：宾客们在客厅用了餐。",
      en: "Colloquial: Wanna grab lunch? | Standard: Shall we eat together? | Formal: The guests dined in the salon.",
      ar: "عامي: نأكل مع بعض الظهر؟ | معياري: نتناول الغداء معاً؟ | رسمي: تناول الضيوف طعامهم في الصالون.",
    },
    usage_tip: {
      zh: "听力中会出现 bouffer，但口语考试和写作中不要用，会扣分",
      en: "You may hear 'bouffer' in listening, but avoid it in exams — it's too casual and will cost points",
      ar: "قد تسمع bouffer في الاستماع، لكن تجنبه في الامتحانات — عامي جداً",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "register-voiture",
    fr: "Bagnole → Voiture → Véhicule",
    phonetic: "/ba.ɲɔl/ → /vwa.tyʁ/ → /ve.i.kyl/",
    category: "register",
    level: "B1",
    meaning: {
      zh: "车（口语 → 标准 → 书面）",
      en: "Car (slang → standard → formal)",
      fr: "Familier → Courant → Soutenu",
      ar: "سيارة (عامي → معياري → رسمي)",
    },
    example_fr: "Familier : Elle a une belle bagnole. | Courant : Elle a une belle voiture. | Soutenu : Ce véhicule est en stationnement interdit.",
    example_translation: {
      zh: "口语：她车真漂亮。| 标准：她有一辆漂亮的车。| 书面：该车辆违规停放。",
      en: "Slang: She's got a nice ride. | Standard: She has a nice car. | Formal: This vehicle is illegally parked.",
      ar: "عامي: عندها سيارة حلوة. | معياري: لديها سيارة جميلة. | رسمي: هذه المركبة متوقفة بشكل مخالف.",
    },
    usage_tip: {
      zh: "阅读理解中 bagnole 出现频率高，口语面试用 voiture，写作用 véhicule",
      en: "Reading comprehension often has 'bagnole'; use 'voiture' in speaking, 'véhicule' in formal writing",
      ar: "فهم القراءة يستخدم bagnole كثيراً؛ استخدم voiture في الكلام، véhicule في الكتابة الرسمية",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "register-policier",
    fr: "Flic → Policier → Agent de l'ordre",
    phonetic: "/flik/ → /pɔ.li.sje/ → /a.ʒɑ̃ də lɔʁdʁ/",
    category: "register",
    level: "B2",
    meaning: {
      zh: "警察（口语 → 标准 → 书面）",
      en: "Cop → Police officer → Law enforcement agent",
      fr: "Familier → Courant → Soutenu",
      ar: "شرطي (عامي → معياري → رسمي)",
    },
    example_fr: "Familier : Les flics sont arrivés. | Courant : Les policiers sont arrivés. | Soutenu : Les agents de l'ordre sont intervenus.",
    example_translation: {
      zh: "口语：条子来了。| 标准：警察到了。| 书面：执法人员进行了干预。",
      en: "Slang: The cops showed up. | Standard: The police arrived. | Formal: Law enforcement intervened.",
      ar: "عامي: وصل الشرطة. | معياري: وصل رجال الشرطة. | رسمي: تدخّل رجال الأمن.",
    },
    usage_tip: {
      zh: "TCF 听力会出现 flic，写作中一定用 policier 或 agent de l'ordre",
      en: "TCF listening may use 'flic' — always use 'policier' or 'agent de l'ordre' in writing",
      ar: "استماع TCF قد يستخدم flic — استخدم دائماً policier أو agent de l'ordre في الكتابة",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "register-comprendre",
    fr: "Piger → Comprendre → Saisir",
    phonetic: "/pi.ʒe/ → /kɔ̃.pʁɑ̃dʁ/ → /sɛ.ziʁ/",
    category: "register",
    level: "B1",
    meaning: {
      zh: "理解（口语 → 标准 → 书面）",
      en: "To get it → To understand → To grasp",
      fr: "Familier → Courant → Soutenu",
      ar: "الفهم (عامي → معياري → أدبي)",
    },
    example_fr: "Familier : T'as pigé ? | Courant : Tu as compris ? | Soutenu : Avez-vous saisi la nuance ?",
    example_translation: {
      zh: "口语：你懂了没？| 标准：你理解了吗？| 书面：您领会了其中的细微差别吗？",
      en: "Slang: Get it? | Standard: Did you understand? | Literary: Have you grasped the nuance?",
      ar: "عامي: فهمت؟ | معياري: هل فهمت؟ | أدبي: هل أدركت الفارق الدقيق؟",
    },
    usage_tip: {
      zh: "saisir 在阅读理解中常见（saisir le sens = 理解意思），写作中也很加分",
      en: "'Saisir' is common in reading (saisir le sens = grasp the meaning) and scores well in writing",
      ar: "saisir شائع في القراءة (saisir le sens = فهم المعنى) ويحرز نقاطاً في الكتابة",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "register-maison",
    fr: "Baraque → Maison → Demeure",
    phonetic: "/ba.ʁak/ → /mɛ.zɔ̃/ → /də.mœʁ/",
    category: "register",
    level: "B1",
    meaning: {
      zh: "房子（口语 → 标准 → 书面）",
      en: "Shack/Pad → House → Residence/Dwelling",
      fr: "Familier → Courant → Soutenu",
      ar: "منزل (عامي → معياري → أدبي)",
    },
    example_fr: "Familier : Il a une super baraque. | Courant : Il a une belle maison. | Soutenu : Cette demeure est classée monument historique.",
    example_translation: {
      zh: "口语：他的房子超棒。| 标准：他有一栋漂亮的房子。| 书面：这座宅邸被列为历史古迹。",
      en: "Slang: He's got an awesome pad. | Standard: He has a beautiful house. | Literary: This dwelling is a listed monument.",
      ar: "عامي: عنده بيت رهيب. | معياري: لديه منزل جميل. | أدبي: هذا المسكن مصنّف معلماً تاريخياً.",
    },
    usage_tip: {
      zh: "baraque 在日常对话中超常见，写作用 demeure 或 résidence",
      en: "'Baraque' is very common in daily speech — use 'demeure' or 'résidence' in writing",
      ar: "baraque شائع جداً في الكلام اليومي — استخدم demeure أو résidence في الكتابة",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "register-vetements",
    fr: "Fringues → Vêtements → Tenue",
    phonetic: "/fʁɛ̃ɡ/ → /vɛt.mɑ̃/ → /tə.ny/",
    category: "register",
    level: "B1",
    meaning: {
      zh: "衣服（口语 → 标准 → 正式）",
      en: "Threads/Clothes → Clothing → Attire",
      fr: "Familier → Courant → Soutenu",
      ar: "ملابس (عامي → معياري → رسمي)",
    },
    example_fr: "Familier : J'adore tes fringues ! | Courant : Tes vêtements sont jolis. | Soutenu : La tenue vestimentaire est exigée.",
    example_translation: {
      zh: "口语：我超爱你穿的！| 标准：你的衣服很好看。| 正式：要求穿着正式服装。",
      en: "Slang: Love your threads! | Standard: Your clothes are nice. | Formal: Proper attire is required.",
      ar: "عامي: أحب ملابسك! | معياري: ملابسك جميلة. | رسمي: الزي الرسمي مطلوب.",
    },
    usage_tip: {
      zh: "fringues 在法国年轻人对话中几乎等于 vêtements，听力常见",
      en: "'Fringues' is almost as common as 'vêtements' among young French speakers — common in listening",
      ar: "fringues شائع تقريباً مثل vêtements بين الشباب الفرنسيين",
    },
    tags: ["speaking"],
  },
  {
    id: "register-argent",
    fr: "Fric → Argent → Capital",
    phonetic: "/fʁik/ → /aʁ.ʒɑ̃/ → /ka.pi.tal/",
    category: "register",
    level: "B1",
    meaning: {
      zh: "钱（口语 → 标准 → 书面/金融）",
      en: "Cash/Dough → Money → Capital/Funds",
      fr: "Familier → Courant → Soutenu",
      ar: "مال (عامي → معياري → رسمي/مالي)",
    },
    example_fr: "Familier : Il a plein de fric. | Courant : Il a beaucoup d'argent. | Soutenu : Le capital investi s'élève à un million d'euros.",
    example_translation: {
      zh: "口语：他超有钱。| 标准：他有很多钱。| 书面：投入资本达一百万欧元。",
      en: "Slang: He's loaded. | Standard: He has a lot of money. | Formal: The invested capital amounts to one million euros.",
      ar: "عامي: عنده فلوس كثيرة. | معياري: لديه الكثير من المال. | رسمي: رأس المال المستثمر يبلغ مليون يورو.",
    },
    usage_tip: {
      zh: "fric 在 TCF 听力对话中很常见，写经济话题用 capital / fonds",
      en: "'Fric' is common in TCF listening dialogues — use 'capital' or 'fonds' when writing about economics",
      ar: "fric شائع في حوارات استماع TCF — استخدم capital أو fonds في الكتابة عن الاقتصاد",
    },
    tags: ["writing", "speaking"],
  },
  {
    id: "register-rire",
    fr: "Se marrer → Rire → S'esclaffer",
    phonetic: "/sə ma.ʁe/ → /ʁiʁ/ → /sɛs.kla.fe/",
    category: "register",
    level: "B2",
    meaning: {
      zh: "笑（口语 → 标准 → 书面）",
      en: "To crack up → To laugh → To burst out laughing",
      fr: "Familier → Courant → Soutenu",
      ar: "الضحك (عامي → معياري → أدبي)",
    },
    example_fr: "Familier : On s'est bien marré hier soir. | Courant : On a beaucoup ri. | Soutenu : L'assemblée s'est esclaffée à l'écoute de l'anecdote.",
    example_translation: {
      zh: "口语：我们昨晚笑死了。| 标准：我们笑了很多。| 书面：听到这则轶事，全场哄堂大笑。",
      en: "Slang: We cracked up last night. | Standard: We laughed a lot. | Literary: The audience burst into laughter at the anecdote.",
      ar: "عامي: ضحكنا كثير البارحة. | معياري: ضحكنا كثيراً. | أدبي: انفجر الحاضرون ضاحكين عند سماع الطرفة.",
    },
    usage_tip: {
      zh: "se marrer 在日常法语中比 rire 更常见，s'esclaffer 描述突然大笑",
      en: "'Se marrer' is more common than 'rire' in daily French; 's'esclaffer' means sudden loud laughter",
      ar: "se marrer أكثر شيوعاً من rire في الفرنسية اليومية؛ s'esclaffer يعني ضحكة مفاجئة وعالية",
    },
    tags: ["speaking"],
  },
  {
    id: "register-fou",
    fr: "Dingue → Fou → Insensé",
    phonetic: "/dɛ̃ɡ/ → /fu/ → /ɛ̃.sɑ̃.se/",
    category: "register",
    level: "B1",
    meaning: {
      zh: "疯狂的（口语 → 标准 → 书面）",
      en: "Crazy/Nuts → Mad/Crazy → Insane/Senseless",
      fr: "Familier → Courant → Soutenu",
      ar: "مجنون (عامي → معياري → أدبي)",
    },
    example_fr: "Familier : C'est dingue cette histoire ! | Courant : C'est fou ! | Soutenu : Cette décision est insensée.",
    example_translation: {
      zh: "口语：这件事太疯了！| 标准：太疯狂了！| 书面：这个决定是荒谬的。",
      en: "Slang: This story is nuts! | Standard: That's crazy! | Formal: This decision is senseless.",
      ar: "عامي: هذه القصة جنونية! | معياري: هذا جنون! | رسمي: هذا القرار غير معقول.",
    },
    usage_tip: {
      zh: "dingue 在法国口语中极高频，相当于英语的 crazy，听力必知",
      en: "'Dingue' is extremely common in French speech — equivalent to 'crazy', must-know for listening",
      ar: "dingue شائع جداً في الكلام الفرنسي — ما يعادل crazy، ضروري للاستماع",
    },
    tags: ["speaking"],
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All valid categories. */
export const EXPRESSION_CATEGORIES: readonly ExpressionCategory[] = [
  "connector",
  "pattern",
  "idiom",
  "phrase",
  "register",
] as const;

/** All valid levels. */
export const EXPRESSION_LEVELS: readonly ExpressionLevel[] = [
  "A2",
  "B1",
  "B2",
  "C1",
] as const;

/** Get a random expression (seeded by value for SSR consistency). */
export function getExpressionByIndex(index: number): FrenchExpression {
  return FRENCH_EXPRESSIONS[
    ((index % FRENCH_EXPRESSIONS.length) + FRENCH_EXPRESSIONS.length) %
      FRENCH_EXPRESSIONS.length
  ];
}
