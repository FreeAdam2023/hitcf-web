export interface TcfLevel {
  level: string;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

const LEVELS: TcfLevel[] = [
  { level: "C2", label: "C2 优秀", color: "text-purple-700", bgColor: "bg-purple-100", description: "接近母语水平" },
  { level: "C1", label: "C1 熟练", color: "text-blue-700", bgColor: "bg-blue-100", description: "流利且自如" },
  { level: "B2", label: "B2 中高级", color: "text-green-700", bgColor: "bg-green-100", description: "独立使用语言" },
  { level: "B1", label: "B1 中级", color: "text-yellow-700", bgColor: "bg-yellow-100", description: "日常交流无障碍" },
  { level: "A2", label: "A2 初级", color: "text-orange-700", bgColor: "bg-orange-100", description: "简单日常表达" },
  { level: "A1", label: "A1 入门", color: "text-red-700", bgColor: "bg-red-100", description: "基础词汇短语" },
];

export function getEstimatedTcfLevel(score: number, total: number): TcfLevel {
  if (total <= 0) return LEVELS[5]; // A1
  const pct = score / total;
  if (pct >= 0.9) return LEVELS[0];  // C2
  if (pct >= 0.78) return LEVELS[1]; // C1
  if (pct >= 0.65) return LEVELS[2]; // B2
  if (pct >= 0.5) return LEVELS[3];  // B1
  if (pct >= 0.35) return LEVELS[4]; // A2
  return LEVELS[5]; // A1
}
