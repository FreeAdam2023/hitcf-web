export interface ChangelogEntry {
  date: string;
  version?: string;
  type: "feature" | "improvement" | "fix";
  title: Record<string, string>;
  details?: Record<string, string>[];
}

function t(entry: Record<string, string>, locale: string): string {
  return entry[locale] || entry.zh || "";
}

/** Get localized changelog entries */
export function getLocalizedChangelog(locale: string) {
  return changelog.map((e) => ({
    date: e.date,
    version: e.version,
    type: e.type,
    title: t(e.title, locale),
    details: e.details?.map((d) => t(d, locale)),
  }));
}

// Only user-facing changes — no admin/backend internals
export const changelog: ChangelogEntry[] = [
  {
    date: "2026-04-03",
    type: "feature",
    title: {
      zh: "TCF 考位实时监控上线",
      en: "TCF exam seat monitor is live",
      fr: "Surveillance des places TCF en ligne",
      ar: "مراقبة مقاعد TCF مباشرة",
    },
    details: [
      {
        zh: "5 大城市实时监控：渥太华、蒙特利尔、多伦多、温哥华、卡尔加里",
        en: "Real-time monitoring across 5 cities: Ottawa, Montreal, Toronto, Vancouver, Calgary",
        fr: "Surveillance en temps réel dans 5 villes : Ottawa, Montréal, Toronto, Vancouver, Calgary",
        ar: "مراقبة فورية في 5 مدن: أوتاوا، مونتريال، تورنتو، فانكوفر، كالغاري",
      },
      {
        zh: "显示剩余座位数、考场地址地图、一键跳转报名页",
        en: "Shows remaining seats, venue address with map link, one-click registration",
        fr: "Affiche les places restantes, adresse avec carte, inscription en un clic",
        ar: "عرض المقاعد المتبقية، عنوان المركز مع خريطة، تسجيل بنقرة واحدة",
      },
      {
        zh: "关注城市后有新考位邮件通知，付费会员优先收到",
        en: "Follow cities to get email alerts when new seats appear. Paid members notified first",
        fr: "Suivez des villes pour recevoir des alertes. Les membres payants sont notifiés en premier",
        ar: "تابع المدن لتلقي تنبيهات بالبريد. الأعضاء المدفوعون يُبلَّغون أولاً",
      },
    ],
  },
  {
    date: "2026-04-03",
    type: "improvement",
    title: {
      zh: "移动端阅读体验优化",
      en: "Mobile reading experience improved",
      fr: "Amélioration de la lecture sur mobile",
      ar: "تحسين تجربة القراءة على الهاتف",
    },
    details: [
      {
        zh: "练习页面选项和题目文字加大，夜间模式更舒适",
        en: "Larger text for options and questions in practice mode, more comfortable in dark mode",
        fr: "Texte plus grand pour les options et questions, plus confortable en mode sombre",
        ar: "نص أكبر للخيارات والأسئلة، أكثر راحة في الوضع الداكن",
      },
    ],
  },
  {
    date: "2026-04-03",
    type: "improvement",
    title: {
      zh: "SEO 与多语言元数据全面更新",
      en: "SEO & multilingual metadata update",
      fr: "Mise à jour SEO et métadonnées multilingues",
      ar: "تحديث SEO والبيانات الوصفية متعددة اللغات",
    },
    details: [
      {
        zh: "修复描述过短问题，新增 7 个页面到 sitemap，四语言关键词和描述优化",
        en: "Fixed short descriptions, added 7 pages to sitemap, optimized keywords and descriptions across 4 languages",
        fr: "Corrections des descriptions courtes, 7 pages ajoutées au sitemap, optimisation des mots-clés en 4 langues",
        ar: "إصلاح الأوصاف القصيرة، إضافة 7 صفحات إلى خريطة الموقع، تحسين الكلمات المفتاحية بـ 4 لغات",
      },
    ],
  },
  {
    date: "2026-04-02",
    type: "feature",
    title: {
      zh: "考试模式全面升级",
      en: "Exam mode overhaul",
      fr: "Refonte du mode examen",
      ar: "تحديث شامل لوضع الامتحان",
    },
    details: [
      {
        zh: "全新考试介绍页：四科统一风格，展示考试规则、难度分布（A1→C2）和 TCF 官方 consignes",
        en: "New exam intro pages for all 4 sections: unified design with rules, A1→C2 difficulty breakdown, and official TCF consignes",
        fr: "Nouvelles pages d'introduction pour les 4 sections : design unifié avec règles, répartition A1→C2 et consignes officielles",
        ar: "صفحات تقديم جديدة لجميع الأقسام: تصميم موحد مع القواعد وتوزيع A1→C2 والتعليمات الرسمية",
      },
      {
        zh: "计时器仅在正式开始答题后显示，退出介绍页不产生空白记录",
        en: "Timer only starts when you begin answering; leaving the intro page creates no records",
        fr: "Le chronomètre ne démarre qu'au début des réponses ; quitter l'introduction ne crée aucun enregistrement",
        ar: "المؤقت يبدأ فقط عند بدء الإجابة؛ مغادرة المقدمة لا تنشئ أي سجلات",
      },
    ],
  },
  {
    date: "2026-04-01",
    type: "feature",
    title: {
      zh: "画线笔记",
      en: "Text highlighting & notes",
      fr: "Surlignage et notes",
      ar: "تمييز النص والملاحظات",
    },
    details: [
      {
        zh: "选中 passage 或选项文本即可高亮标记，支持 6 种颜色",
        en: "Select any passage or option text to highlight — 6 colors available",
        fr: "Sélectionnez du texte pour le surligner — 6 couleurs disponibles",
        ar: "حدد أي نص لتمييزه — 6 ألوان متاحة",
      },
      {
        zh: "高亮支持标签分类（固定搭配、常用表达、语法点等）和编辑/删除",
        en: "Highlights support tags (collocations, expressions, grammar points) with edit/delete",
        fr: "Les surlignages supportent les tags (collocations, expressions, grammaire) avec édition/suppression",
        ar: "التمييزات تدعم العلامات (تعبيرات، قواعد) مع التعديل/الحذف",
      },
      {
        zh: "复习页面新增「笔记」标签，集中查看所有画线",
        en: "New 'Notes' tab on the review page to browse all highlights",
        fr: "Nouvel onglet « Notes » sur la page de révision",
        ar: "علامة تبويب 'ملاحظات' جديدة في صفحة المراجعة",
      },
    ],
  },
  {
    date: "2026-04-01",
    type: "feature",
    title: {
      zh: "考位实时监控",
      en: "Real-time exam seat alerts",
      fr: "Alertes de places d'examen en temps réel",
      ar: "تنبيهات مقاعد الامتحان الفورية",
    },
    details: [
      {
        zh: "温哥华和卡尔加里考位有新名额时即时提醒",
        en: "Instant alerts when new TCF exam seats open in Vancouver and Calgary",
        fr: "Alertes instantanées pour les nouvelles places à Vancouver et Calgary",
        ar: "تنبيهات فورية عند توفر مقاعد جديدة في فانكوفر وكالغاري",
      },
    ],
  },
  {
    date: "2026-04-02",
    type: "fix",
    title: {
      zh: "阅读体验优化",
      en: "Reading experience improvements",
      fr: "Améliorations de l'expérience de lecture",
      ar: "تحسينات تجربة القراءة",
    },
    details: [
      {
        zh: "全站字体显示更清晰，长文阅读更舒适",
        en: "Clearer font rendering site-wide for more comfortable reading",
        fr: "Rendu de police plus net pour une lecture plus confortable",
        ar: "عرض أوضح للخطوط لقراءة أكثر راحة",
      },
      {
        zh: "修正 81 道阅读题的文章文本错误",
        en: "Fixed text errors in 81 reading passages",
        fr: "Correction de 81 passages de lecture",
        ar: "تصحيح 81 نص قراءة",
      },
    ],
  },
  {
    date: "2026-03-30",
    type: "feature",
    title: {
      zh: "句子分析全面升级",
      en: "Sentence analysis overhaul",
      fr: "Refonte de l'analyse de phrases",
      ar: "تحديث شامل لتحليل الجمل",
    },
    details: [
      {
        zh: "ABCD 选项也可以做句子分析了，点击选项旁的📖按钮即可",
        en: "ABCD options now support sentence analysis — tap the 📖 button next to any option",
        fr: "Les options ABCD supportent maintenant l'analyse — appuyez sur 📖 à côté de chaque option",
        ar: "خيارات ABCD تدعم الآن تحليل الجمل — انقر على 📖 بجانب أي خيار",
      },
      {
        zh: "语法标签（如 Présent、Comparatif）点击直接跳转到语法速查页面",
        en: "Grammar tags (e.g. Présent, Comparatif) now link directly to the reference page",
        fr: "Les tags de grammaire renvoient directement à la page de référence",
        ar: "علامات القواعد ترتبط مباشرة بصفحة المرجع",
      },
      {
        zh: "固定搭配支持一键收藏到单词本",
        en: "Collocations can now be saved to your vocabulary list",
        fr: "Les collocations peuvent être ajoutées à votre liste de vocabulaire",
        ar: "يمكن الآن حفظ التعبيرات في قائمة المفردات",
      },
      {
        zh: "成分标注支持多语言显示（主语/谓语/宾语等）",
        en: "Grammatical role labels now display in your language",
        fr: "Les rôles grammaticaux s'affichent dans votre langue",
        ar: "تسميات الأدوار النحوية تظهر بلغتك",
      },
    ],
  },
  {
    date: "2026-03-30",
    type: "improvement",
    title: {
      zh: "句子分析异步加载",
      en: "Sentence analysis async loading",
      fr: "Chargement asynchrone de l'analyse",
      ar: "تحميل غير متزامن للتحليل",
    },
    details: [
      {
        zh: "句子分析不再卡顿等待，后台生成完毕后自动显示结果",
        en: "Sentence analysis no longer blocks — results appear automatically once ready",
        fr: "L'analyse ne bloque plus — les résultats apparaissent automatiquement",
        ar: "التحليل لم يعد يتجمد — النتائج تظهر تلقائيًا عند الجاهزية",
      },
    ],
  },
  {
    date: "2026-03-30",
    type: "improvement",
    title: {
      zh: "已阅进度多端同步",
      en: "Cross-device progress sync",
      fr: "Synchronisation de la progression multi-appareils",
      ar: "مزامنة التقدم عبر الأجهزة",
    },
    details: [
      {
        zh: "开卷模式的已阅标记和当前题号现在可以在手机和电脑之间自动同步",
        en: "Open-book reviewed marks and current question now sync between phone and computer",
        fr: "Les marques de lecture et la question en cours se synchronisent entre téléphone et ordinateur",
        ar: "علامات القراءة والسؤال الحالي يتزامنان الآن بين الهاتف والحاسوب",
      },
    ],
  },
  {
    date: "2026-03-29",
    type: "fix",
    title: {
      zh: "「重新练习」按钮修复",
      en: "Redo practice button fix",
      fr: "Correction du bouton « Refaire »",
      ar: "إصلاح زر إعادة التدريب",
    },
    details: [
      {
        zh: "修复全部已阅后点击「重新练习」会错误提交 0 分成绩的问题",
        en: "Fixed 'Redo practice' incorrectly submitting a 0-score attempt after reviewing all questions",
        fr: "Correction du bouton « Refaire » qui soumettait un score de 0 après avoir revu toutes les questions",
        ar: "إصلاح زر إعادة التدريب الذي كان يرسل درجة 0 بعد مراجعة جميع الأسئلة",
      },
    ],
  },
  {
    date: "2026-03-29",
    type: "fix",
    title: {
      zh: "翻译质量修复",
      en: "Translation fixes",
      fr: "Corrections de traduction",
      ar: "إصلاحات الترجمة",
    },
    details: [
      {
        zh: "修复部分阅读题选项和句子翻译不准确的问题",
        en: "Fixed inaccurate option and sentence translations in some reading questions",
        fr: "Correction de traductions inexactes dans certaines questions de lecture",
        ar: "إصلاح ترجمات غير دقيقة في بعض أسئلة القراءة",
      },
    ],
  },
  {
    date: "2026-03-26",
    type: "feature",
    title: {
      zh: "法语速查手册",
      en: "French Quick Reference",
      fr: "Aide-mémoire français",
      ar: "مرجع سريع للفرنسية",
    },
    details: [
      {
        zh: "新增「速查」页面，涵盖数字、时间、冠词、动词变位等 15 个法语核心知识点，支持四语切换",
        en: "New Reference page covering 15 essential French topics: numbers, time, articles, verb conjugation and more, in 4 languages",
        fr: "Nouvelle page Référence couvrant 15 sujets essentiels : nombres, heure, articles, conjugaison, etc., en 4 langues",
        ar: "صفحة مرجعية جديدة تغطي 15 موضوعًا أساسيًا في الفرنسية بأربع لغات",
      },
      {
        zh: "写作和口语纠错可一键跳转到对应知识点",
        en: "Writing and speaking corrections now link directly to the relevant grammar topic",
        fr: "Les corrections d'écriture et d'oral renvoient directement au sujet de grammaire concerné",
        ar: "تصحيحات الكتابة والتحدث ترتبط مباشرة بالموضوع النحوي المعني",
      },
    ],
  },
  {
    date: "2026-03-26",
    type: "improvement",
    title: {
      zh: "听力体验优化",
      en: "Listening experience improvements",
      fr: "Amélioration de l'expérience d'écoute",
      ar: "تحسينات تجربة الاستماع",
    },
    details: [
      {
        zh: "听力练习支持键盘快捷键：空格键播放/暂停，R 键重播",
        en: "Keyboard shortcuts for listening: Space to play/pause, R to restart",
        fr: "Raccourcis clavier : Espace pour lecture/pause, R pour rejouer",
        ar: "اختصارات لوحة المفاتيح: مسافة للتشغيل/الإيقاف، R لإعادة التشغيل",
      },
      {
        zh: "解决不同题目音量差异大的问题",
        en: "Fixed inconsistent audio volume across questions",
        fr: "Correction du volume audio incohérent entre les questions",
        ar: "إصلاح مشكلة اختلاف مستوى الصوت بين الأسئلة",
      },
    ],
  },
  {
    date: "2026-03-26",
    type: "fix",
    title: {
      zh: "数据修复",
      en: "Data fixes",
      fr: "Corrections de données",
      ar: "إصلاحات البيانات",
    },
    details: [
      {
        zh: "修复部分听力题转录错位问题",
        en: "Fixed misaligned transcripts in some listening questions",
        fr: "Correction de transcriptions décalées dans certaines questions d'écoute",
        ar: "إصلاح النصوص المنقولة غير المتطابقة في بعض أسئلة الاستماع",
      },
    ],
  },
  {
    date: "2026-03-26",
    type: "fix",
    title: {
      zh: "阅读题数据校准",
      en: "Reading data calibration",
      fr: "Calibrage des données de lecture",
      ar: "معايرة بيانات القراءة",
    },
  },
  {
    date: "2026-03-26",
    type: "feature",
    title: {
      zh: "词汇卡片变位发音",
      en: "Vocabulary card conjugation audio",
      fr: "Audio de conjugaison des cartes de vocabulaire",
      ar: "نطق تصريف بطاقات المفردات",
    },
    details: [
      {
        zh: "动词变位表每个形式支持点击发音（je parle, tu parles...）",
        en: "Each verb conjugation form is now clickable for pronunciation",
        fr: "Chaque forme de conjugaison est cliquable pour la prononciation",
        ar: "كل شكل من أشكال التصريف قابل للنقر للنطق",
      },
      {
        zh: "形容词变形表同样支持发音（petit → petite, petits...）",
        en: "Adjective inflection forms also support audio playback",
        fr: "Les formes de déclinaison des adjectifs supportent aussi la lecture audio",
        ar: "أشكال تصريف الصفات تدعم أيضًا التشغيل الصوتي",
      },
    ],
  },
  {
    date: "2026-03-25",
    type: "fix",
    title: {
      zh: "开卷模式移动端修复",
      en: "Open-book mode mobile fixes",
      fr: "Corrections du mode livre ouvert sur mobile",
      ar: "إصلاحات وضع الكتاب المفتوح على الهاتف",
    },
    details: [
      {
        zh: "移动端底部恢复「下一题」按钮",
        en: "Restored 'Next question' button on mobile",
        fr: "Restauration du bouton « Question suivante » sur mobile",
        ar: "استعادة زر 'السؤال التالي' على الهاتف",
      },
      {
        zh: "修复悬浮题目导航按钮在移动端不可见的问题",
        en: "Fixed floating question nav button not visible on mobile",
        fr: "Correction du bouton de navigation flottant invisible sur mobile",
        ar: "إصلاح زر التنقل العائم غير المرئي على الهاتف",
      },
    ],
  },
  {
    date: "2026-03-25",
    type: "fix",
    title: {
      zh: "等级练习加载错误修复",
      en: "Level practice loading fix",
      fr: "Correction du chargement de la pratique par niveau",
      ar: "إصلاح تحميل التدريب حسب المستوى",
    },
    details: [
      {
        zh: "修复等级练习中已答题目加载时的 500 错误",
        en: "Fixed 500 error when loading answered questions in level practice",
        fr: "Correction de l'erreur 500 lors du chargement des questions déjà répondues",
        ar: "إصلاح خطأ 500 عند تحميل الأسئلة المجاب عليها",
      },
    ],
  },
  {
    date: "2026-03-24",
    type: "feature",
    title: {
      zh: "功能介绍页面",
      en: "Feature guide page",
      fr: "Page de guide des fonctionnalités",
      ar: "صفحة دليل الميزات",
    },
    details: [
      {
        zh: "新增 /guide 平台使用指南",
        en: "New /guide platform usage guide",
        fr: "Nouveau guide d'utilisation /guide",
        ar: "دليل استخدام المنصة الجديد",
      },
      {
        zh: "新增更新日志页面",
        en: "New changelog page",
        fr: "Nouvelle page de journal des mises à jour",
        ar: "صفحة سجل التحديثات الجديدة",
      },
    ],
  },
];

const STORAGE_KEY = "hitcf_changelog_read";

export function getLatestChangelogDate(): string {
  return changelog[0]?.date || "";
}

/** Entries newer than the user's last read. First visit: empty (all read). */
export function getUnreadChangelogEntries(): ChangelogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const lastRead = localStorage.getItem(STORAGE_KEY);
    // New users (no localStorage) → all read; only show entries after first visit
    if (!lastRead) return [];
    const cutoff = lastRead;
    return changelog.filter((e) => e.date > cutoff);
  } catch {
    return [];
  }
}

export function hasUnreadChangelog(): boolean {
  return getUnreadChangelogEntries().length > 0;
}

/** Mark all current entries as read. Dispatches "changelog-read" event for cross-component sync. */
export function markChangelogRead(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, getLatestChangelogDate());
    window.dispatchEvent(new Event("changelog-read"));
  } catch {}
}
