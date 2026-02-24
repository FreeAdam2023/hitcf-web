export const TYPE_LABELS: Record<string, string> = {
  listening: "听力",
  reading: "阅读",
  speaking: "口语",
  writing: "写作",
};

export const MODE_LABELS: Record<string, string> = {
  practice: "练习",
  exam: "考试",
  speed_drill: "速练",
};

/** Per-type colour classes for badges, borders, icons, backgrounds */
export const TYPE_COLORS: Record<
  string,
  { badge: string; border: string; icon: string; bg: string }
> = {
  listening: {
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    border: "border-l-blue-500",
    icon: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  reading: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    border: "border-l-emerald-500",
    icon: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  speaking: {
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    border: "border-l-amber-500",
    icon: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  writing: {
    badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    border: "border-l-purple-500",
    icon: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
};

export const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || "/cdn-cgi/access/login";
export const CLB7_TARGET = 0.78;
