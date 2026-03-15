"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { getEstimatedTcfLevel, TCF_MAX_SCORE } from "@/lib/tcf-levels";
import { cn, formatTime } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ScoreCardProps {
  score: number;
  total: number;
  answeredCount?: number;
  timeTakenSeconds?: number | null;
  tcfPoints?: number;
}

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

function CircularProgress({
  value,
  size = 140,
  strokeWidth = 8,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const pct = Math.min(Math.max(value, 0), 100);
  const correctLen = animated ? (pct / 100) * circumference : 0;
  const wrongLen = animated ? ((100 - pct) / 100) * circumference : 0;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/40"
      />
      {/* Wrong (red) ring — drawn first as full background */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#fca5a5"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (correctLen + wrongLen)}
        className="transition-all ease-out dark:stroke-red-400/60"
        style={{ transitionDuration: "1.4s" }}
      />
      {/* Correct (green) ring — drawn on top */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#22c55e"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - correctLen}
        className="transition-all ease-out"
        style={{ transitionDuration: "1.4s" }}
      />
    </svg>
  );
}

export function ScoreCard({
  score,
  total,
  timeTakenSeconds,
  tcfPoints,
}: ScoreCardProps) {
  const t = useTranslations();
  const isPointBased = tcfPoints != null;
  const pct = isPointBased
    ? Math.round((tcfPoints / TCF_MAX_SCORE) * 100)
    : total > 0
      ? Math.round((score / total) * 100)
      : 0;
  const tcf = isPointBased
    ? getEstimatedTcfLevel(tcfPoints)
    : getEstimatedTcfLevel(0);
  const displayTcf = useCountUp(isPointBased ? tcfPoints : score, 1400);
  const displayPct = useCountUp(pct, 1400);

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
      <CardContent className="flex flex-col items-center py-8">
        {/* Circular progress ring with score inside */}
        <div className="relative flex items-center justify-center">
          <CircularProgress value={pct} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isPointBased ? (
              <>
                <div className="text-4xl font-bold leading-none">
                  {displayTcf}
                  <span className="text-lg text-muted-foreground">/{TCF_MAX_SCORE}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {displayPct}%
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold leading-none">
                  {displayTcf}
                  <span className="text-lg text-muted-foreground">/{total}</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {displayPct}%
                </div>
              </>
            )}
          </div>
        </div>

        {/* Level badge — pops in after count-up */}
        {isPointBased && (
          <div
            className={cn(
              "mt-4 opacity-0 scale-75 transition-all duration-500 ease-out",
              "animate-badge-pop",
            )}
          >
            <span
              className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${tcf.color} ${tcf.bgColor}`}
            >
              {tcf.level} · {t(`tcfLevels.${tcf.level}.description`)}
            </span>
          </div>
        )}

        {/* Meta info */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            {t('results.scoreCard.answered', { score, total })}
          </span>
          {total - score > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-300 dark:bg-red-400/60" />
              {t('results.scoreCard.wrong', { count: total - score })}
            </span>
          )}
          {timeTakenSeconds != null && timeTakenSeconds > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {t('results.scoreCard.timeUsed', { time: formatTime(timeTakenSeconds) })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
