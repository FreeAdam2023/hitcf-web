"use client";

import type { QuestionBrief } from "@/lib/api/types";
import { AudioPlayer } from "./audio-player";

interface QuestionDisplayProps {
  question: QuestionBrief;
  index: number;
  total: number;
}

export function QuestionDisplay({ question, index, total }: QuestionDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          第 {index + 1} 题 / 共 {total} 题
        </h2>
        <span className="text-sm text-muted-foreground">
          {question.type === "listening" ? "听力" : "阅读"}
          {question.level && ` · ${question.level}`}
        </span>
      </div>

      {question.type === "listening" && question.audio_url && (
        <AudioPlayer questionId={question.id} />
      )}

      {question.passage && (
        <div className="max-h-[40vh] md:max-h-[60vh] overflow-y-auto rounded-md border bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {question.passage}
        </div>
      )}

      {question.question_text && (
        <p className="text-base font-medium">{question.question_text}</p>
      )}
    </div>
  );
}
