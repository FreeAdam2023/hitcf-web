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
    badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    border: "border-l-sky-500",
    icon: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950",
  },
  reading: {
    badge: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
    border: "border-l-teal-500",
    icon: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950",
  },
  speaking: {
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    border: "border-l-amber-500",
    icon: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  writing: {
    badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    border: "border-l-violet-500",
    icon: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950",
  },
};

export const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || "/cdn-cgi/access/login";
export const CLB7_TARGET = 0.78;
