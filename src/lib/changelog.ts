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

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Entries newer than the user's last read. First visit: 7-day window. */
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
