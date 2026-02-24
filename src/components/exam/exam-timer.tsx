"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ExamTimerProps {
  timeLimitSeconds: number;
  startedAt: string;
  onTimeUp: () => void;
}

export function ExamTimer({ timeLimitSeconds, startedAt, onTimeUp }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return Math.max(0, timeLimitSeconds - elapsed);
  });
  const [announcement, setAnnouncement] = useState("");
  const announced = useRef<Set<number>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const left = Math.max(0, timeLimitSeconds - elapsed);
      setRemaining(left);

      if (left === 300 && !announced.current.has(300)) {
        announced.current.add(300);
        setAnnouncement("注意：剩余 5 分钟");
      } else if (left === 60 && !announced.current.has(60)) {
        announced.current.add(60);
        setAnnouncement("注意：剩余 1 分钟");
      }

      if (left <= 0) {
        clearInterval(timer);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimitSeconds, startedAt, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining < 300; // < 5 minutes
  const isCritical = remaining < timeLimitSeconds * 0.2; // < 20%
  const progressValue = timeLimitSeconds > 0 ? (remaining / timeLimitSeconds) * 100 : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "flex items-center gap-1.5 font-mono text-sm font-medium",
          isCritical ? "text-red-600 font-bold animate-pulse" : isLow ? "text-red-500" : "",
        )}
        aria-live={isCritical ? "assertive" : "polite"}
        aria-atomic="true"
        aria-label={`剩余时间 ${minutes} 分 ${seconds} 秒`}
      >
        <Clock className="h-4 w-4" />
        <span>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
      <Progress
        value={progressValue}
        className={cn(
          "h-1 w-24",
          isCritical ? "[&>div]:bg-red-500" : isLow ? "[&>div]:bg-amber-500" : "",
        )}
      />
      <div aria-live="assertive" className="sr-only">{announcement}</div>
    </div>
  );
}
