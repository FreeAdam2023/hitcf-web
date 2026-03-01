"use client";

import { Mic, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpeakingRecorderProps {
  isRecording: boolean;
  duration: number;
  transcript: string;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
  error: string | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SpeakingRecorder({
  isRecording,
  duration,
  transcript,
  interimTranscript,
  onStart,
  onStop,
  error,
}: SpeakingRecorderProps) {
  const t = useTranslations("speakingPractice");

  return (
    <div className="space-y-4">
      {/* Mic button + timer */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={isRecording ? onStop : onStart}
          className={cn(
            "relative flex h-20 w-20 items-center justify-center rounded-full transition-all",
            isRecording
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
              : "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900",
          )}
        >
          {isRecording && (
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30" />
          )}
          {isRecording ? (
            <Square className="relative h-7 w-7" />
          ) : (
            <Mic className="relative h-8 w-8" />
          )}
        </button>

        {isRecording ? (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-sm font-medium tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("clickToRecord")}
          </p>
        )}

        {isRecording && (
          <Button size="sm" variant="destructive" onClick={onStop}>
            <Square className="mr-1.5 h-3.5 w-3.5" />
            {t("stopRecording")}
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Transcript */}
      {(transcript || interimTranscript) && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("transcript")}
          </p>
          <p className="text-sm leading-relaxed">
            {transcript}
            {interimTranscript && (
              <span className="text-muted-foreground">{transcript ? " " : ""}{interimTranscript}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
