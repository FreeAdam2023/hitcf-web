export interface ChangelogEntry {
  date: string;
  version?: string;
  type: "feature" | "improvement" | "fix";
  title: string;
  details?: string[];
}

// Only user-facing changes — no admin/backend internals
export const changelog: ChangelogEntry[] = [
  {
    date: "2026-03-26",
    type: "fix",
    title: "阅读题数据校准",
  },
  {
    date: "2026-03-26",
    type: "feature",
    title: "词汇卡片变位发音",
    details: [
      "动词变位表每个形式支持点击发音（je parle, tu parles...）",
      "形容词变形表同样支持发音（petit → petite, petits...）",
    ],
  },
  {
    date: "2026-03-25",
    type: "fix",
    title: "开卷模式移动端修复",
    details: [
      "移动端底部恢复「下一题」按钮（之前被「已阅」替换）",
      "修复悬浮题目导航按钮在移动端不可见的问题",
      "修复 Enter 键无法触发「已阅」按钮的问题",
    ],
  },
  {
    date: "2026-03-25",
    type: "fix",
    title: "等级练习加载错误修复",
    details: ["修复等级练习中已答题目加载时的 500 错误"],
  },
  {
    date: "2026-03-24",
    type: "feature",
    title: "功能介绍页面",
    details: ["新增 /guide 平台使用指南", "新增更新日志页面"],
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
    const cutoff = lastRead || getDateNDaysAgo(7);
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
