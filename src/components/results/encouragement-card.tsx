"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getEstimatedTcfLevel } from "@/lib/tcf-levels";
import { useTranslations } from "next-intl";

interface EncouragementCardProps {
  score: number;
  total: number;
  tcfPoints?: number;
}

interface Tier {
  emoji: string;
  message: string;
  gradient: string;
  textColor: string;
}

function getTier(tcfPoints: number | undefined, score: number, total: number): Tier {
  // Use TCF points thresholds aligned with NCLC levels when available
  if (tcfPoints != null) {
    if (tcfPoints >= 549) {
      return {
        emoji: "\u{1F3C6}",
        message: "卓越表现！你已达到 NCLC 10+ 水平！",
        gradient: "from-purple-500/15 to-purple-600/5 border-purple-200 dark:border-purple-800",
        textColor: "text-purple-700 dark:text-purple-300",
      };
    }
    if (tcfPoints >= 458) {
      return {
        emoji: "\u{1F389}",
        message: "非常棒！你已达到 NCLC 7 水平！",
        gradient: "from-blue-500/15 to-blue-600/5 border-blue-200 dark:border-blue-800",
        textColor: "text-blue-700 dark:text-blue-300",
      };
    }
    if (tcfPoints >= 398) {
      return {
        emoji: "\u{1F4AA}",
        message: "不错！再加把劲就能突破 NCLC 7！",
        gradient: "from-green-500/15 to-green-600/5 border-green-200 dark:border-green-800",
        textColor: "text-green-700 dark:text-green-300",
      };
    }
    if (tcfPoints >= 331) {
      return {
        emoji: "\u{1F4C8}",
        message: "有进步！已达 NCLC 4+，坚持练习！",
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

  // Fallback for non-point-based types (speaking/writing)
  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.9) {
    return {
      emoji: "\u{1F3C6}",
      message: "卓越表现！",
      gradient: "from-purple-500/15 to-purple-600/5 border-purple-200 dark:border-purple-800",
      textColor: "text-purple-700 dark:text-purple-300",
    };
  }
  if (pct >= 0.78) {
    return {
      emoji: "\u{1F389}",
      message: "非常棒！",
      gradient: "from-blue-500/15 to-blue-600/5 border-blue-200 dark:border-blue-800",
      textColor: "text-blue-700 dark:text-blue-300",
    };
  }
  if (pct >= 0.65) {
    return {
      emoji: "\u{1F4AA}",
      message: "不错！再接再厉！",
      gradient: "from-green-500/15 to-green-600/5 border-green-200 dark:border-green-800",
      textColor: "text-green-700 dark:text-green-300",
    };
  }
  if (pct >= 0.5) {
    return {
      emoji: "\u{1F4C8}",
      message: "有进步！坚持练习！",
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

export function EncouragementCard({ score, total, tcfPoints }: EncouragementCardProps) {
  const t = useTranslations();
  const tier = getTier(tcfPoints, score, total);
  const isPointBased = tcfPoints != null;
  const tcf = isPointBased ? getEstimatedTcfLevel(tcfPoints) : null;

  return (
    <Card className={`border bg-gradient-to-r ${tier.gradient}`}>
      <CardContent className="flex items-center gap-4 py-5">
        <span className="text-4xl">{tier.emoji}</span>
        <div>
          <p className={`text-base font-semibold ${tier.textColor}`}>
            {tier.message}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isPointBased && tcf
              ? t('encouragement.nclc7Requirement', { level: tcf.level })
              : t('encouragement.scoreDisplay', { score, total })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
