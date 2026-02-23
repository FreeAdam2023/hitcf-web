"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getEstimatedTcfLevel } from "@/lib/tcf-levels";

interface EncouragementCardProps {
  score: number;
  total: number;
}

interface Tier {
  emoji: string;
  message: string;
  gradient: string;
  textColor: string;
}

function getTier(score: number, total: number): Tier {
  const pct = total > 0 ? score / total : 0;

  if (pct >= 0.9) {
    return {
      emoji: "\u{1F3C6}",
      message: "卓越表现！你已经超越了 CLB 7 的要求！",
      gradient: "from-purple-500/15 to-purple-600/5 border-purple-200 dark:border-purple-800",
      textColor: "text-purple-700 dark:text-purple-300",
    };
  }
  if (pct >= 0.78) {
    return {
      emoji: "\u{1F389}",
      message: "非常棒！你已达到 CLB 7 水平！",
      gradient: "from-blue-500/15 to-blue-600/5 border-blue-200 dark:border-blue-800",
      textColor: "text-blue-700 dark:text-blue-300",
    };
  }
  if (pct >= 0.65) {
    return {
      emoji: "\u{1F4AA}",
      message: "不错！再加把劲就能突破 CLB 7！",
      gradient: "from-green-500/15 to-green-600/5 border-green-200 dark:border-green-800",
      textColor: "text-green-700 dark:text-green-300",
    };
  }
  if (pct >= 0.5) {
    return {
      emoji: "\u{1F4C8}",
      message: "有进步！坚持练习，CLB 7 在向你靠近！",
      gradient: "from-yellow-500/15 to-yellow-600/5 border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-700 dark:text-yellow-300",
    };
  }
  return {
    emoji: "\u{1F44A}",
    message: "加油！每一次练习都是进步！",
    gradient: "from-stone-500/10 to-stone-600/5 border-stone-200 dark:border-stone-700",
    textColor: "text-stone-700 dark:text-stone-300",
  };
}

export function EncouragementCard({ score, total }: EncouragementCardProps) {
  const tier = getTier(score, total);
  const tcf = getEstimatedTcfLevel(score, total);

  return (
    <Card className={`border bg-gradient-to-r ${tier.gradient}`}>
      <CardContent className="flex items-center gap-4 py-5">
        <span className="text-4xl">{tier.emoji}</span>
        <div>
          <p className={`text-base font-semibold ${tier.textColor}`}>
            {tier.message}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            TCF {tcf.level} · CLB 7 要求≈ 78% 正确率
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
