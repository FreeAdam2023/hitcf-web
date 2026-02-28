export interface TcfLevel {
  level: string;
  /** @deprecated Use useTranslations('tcfLevels') with t(`${level}.label`) instead */
  label: string;
  color: string;
  bgColor: string;
  /** @deprecated Use useTranslations('tcfLevels') with t(`${level}.description`) instead */
  description: string;
}

const LEVELS: TcfLevel[] = [
  { level: "C2", label: "C2", color: "text-purple-700", bgColor: "bg-purple-100", description: "" },
  { level: "C1", label: "C1", color: "text-blue-700", bgColor: "bg-blue-100", description: "" },
  { level: "B2", label: "B2", color: "text-green-700", bgColor: "bg-green-100", description: "" },
  { level: "B1", label: "B1", color: "text-yellow-700", bgColor: "bg-yellow-100", description: "" },
  { level: "A2", label: "A2", color: "text-orange-700", bgColor: "bg-orange-100", description: "" },
  { level: "A1", label: "A1", color: "text-red-700", bgColor: "bg-red-100", description: "" },
];

/** TCF Canada 听力+阅读分值：按题号区间递增 */
export function getTcfPoints(questionNumber: number): number {
  if (questionNumber <= 4) return 3;
  if (questionNumber <= 10) return 9;
  if (questionNumber <= 19) return 15;
  if (questionNumber <= 30) return 21;
  if (questionNumber <= 35) return 27;
  return 33; // 36-39
}

export const TCF_MAX_SCORE = 699;

/** 计算 TCF 699 分制得分 */
export function calcTcfScore(
  answers: { question_number: number; is_correct: boolean | null }[],
): number {
  return answers.reduce((sum, a) => {
    if (a.is_correct) return sum + getTcfPoints(a.question_number);
    return sum;
  }, 0);
}

/**
 * 基于 NCLC 分数线判定 CEFR 等级（听力 CO 列阈值）：
 * 549+ → C2, 523+ → C1, 458+ → B2, 398+ → B1, 331+ → A2, <331 → 未达 A1
 */
export function getEstimatedTcfLevel(tcfPoints: number): TcfLevel {
  if (tcfPoints >= 549) return LEVELS[0]; // C2
  if (tcfPoints >= 523) return LEVELS[1]; // C1
  if (tcfPoints >= 458) return LEVELS[2]; // B2
  if (tcfPoints >= 398) return LEVELS[3]; // B1
  if (tcfPoints >= 331) return LEVELS[4]; // A2
  return LEVELS[5]; // A1
}

/** 从正确数/总题数估算 TCF 等级（用于无逐题数据的摘要页面） */
export function estimateTcfLevelFromRatio(score: number, total: number): TcfLevel {
  if (total <= 0) return LEVELS[5];
  return getEstimatedTcfLevel(Math.round((score / total) * TCF_MAX_SCORE));
}
