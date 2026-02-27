"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2 } from "lucide-react";
import { getEstimatedTcfLevel, TCF_MAX_SCORE } from "@/lib/tcf-levels";
import { cn, formatTime } from "@/lib/utils";

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
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Delay slightly so the animation is visible
    const timer = setTimeout(() => {
      const pct = Math.min(Math.max(value, 0), 100);
      setOffset(circumference - (pct / 100) * circumference);
    }, 100);
    return () => clearTimeout(timer);
  }, [value, circumference]);

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
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-primary transition-all ease-out"
        style={{ transitionDuration: "1.4s" }}
      />
    </svg>
  );
}

export function ScoreCard({
  score,
  total,
  answeredCount,
  timeTakenSeconds,
  tcfPoints,
}: ScoreCardProps) {
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
              {tcf.level} · {tcf.description}
            </span>
          </div>
        )}

        {/* Meta info */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          {answeredCount != null && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              答对 {score}/{total} 题
            </span>
          )}
          {timeTakenSeconds != null && timeTakenSeconds > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              用时 {formatTime(timeTakenSeconds)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
