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
      message: "\u5353\u8D8A\u8868\u73B0\uFF01\u4F60\u5DF2\u7ECF\u8D85\u8D8A\u4E86 CLB 7 \u7684\u8981\u6C42\uFF01",
      gradient: "from-purple-500/15 to-purple-600/5 border-purple-200 dark:border-purple-800",
      textColor: "text-purple-700 dark:text-purple-300",
    };
  }
  if (pct >= 0.78) {
    return {
      emoji: "\u{1F389}",
      message: "\u975E\u5E38\u68D2\uFF01\u4F60\u5DF2\u8FBE\u5230 CLB 7 \u6C34\u5E73\uFF01",
      gradient: "from-blue-500/15 to-blue-600/5 border-blue-200 dark:border-blue-800",
      textColor: "text-blue-700 dark:text-blue-300",
    };
  }
  if (pct >= 0.65) {
    return {
      emoji: "\u{1F4AA}",
      message: "\u4E0D\u9519\uFF01\u518D\u52A0\u628A\u52B2\u5C31\u80FD\u7A81\u7834 CLB 7\uFF01",
      gradient: "from-green-500/15 to-green-600/5 border-green-200 dark:border-green-800",
      textColor: "text-green-700 dark:text-green-300",
    };
  }
  if (pct >= 0.5) {
    return {
      emoji: "\u{1F4C8}",
      message: "\u6709\u8FDB\u6B65\uFF01\u575A\u6301\u7EC3\u4E60\uFF0CCLB 7 \u5728\u5411\u4F60\u9760\u8FD1\uFF01",
      gradient: "from-yellow-500/15 to-yellow-600/5 border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-700 dark:text-yellow-300",
    };
  }
  return {
    emoji: "\u{1F44A}",
    message: "\u52A0\u6CB9\uFF01\u6BCF\u4E00\u6B21\u7EC3\u4E60\u90FD\u662F\u8FDB\u6B65\uFF01",
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
            TCF {tcf.level} \u00B7 CLB 7 \u8981\u6C42\u2248 78% \u6B63\u786E\u7387
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
