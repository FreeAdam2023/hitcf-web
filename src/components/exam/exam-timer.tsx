"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const left = Math.max(0, timeLimitSeconds - elapsed);
      setRemaining(left);
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
          isLow && "text-red-500",
          isCritical && "animate-pulse",
        )}
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
          isCritical && "[&>div]:bg-red-500",
        )}
      />
    </div>
  );
}
