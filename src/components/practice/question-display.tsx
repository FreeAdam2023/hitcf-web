"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { QuestionBrief } from "@/lib/api/types";
import { AudioPlayer } from "./audio-player";
import { getImageUrl } from "@/lib/api/media";
import { LevelBadge } from "@/components/shared/level-badge";

interface QuestionDisplayProps {
  question: QuestionBrief;
  index: number;
  total: number;
}

function getListeningInstruction(questionNumber: number): string | null {
  if (questionNumber >= 1 && questionNumber <= 2) {
    return "Écoutez les 4 propositions, choisissez celle qui correspond à l\u2019image.";
  }
  if (questionNumber >= 3 && questionNumber <= 39) {
    return "Écoutez l\u2019extrait sonore et les 4 propositions. Choisissez la bonne réponse.";
  }
  return null;
}

export function QuestionDisplay({ question, index, total }: QuestionDisplayProps) {
  const isListening = question.type === "listening";
  const instruction = isListening
    ? getListeningInstruction(question.question_number)
    : null;
  const isImageQuestion =
    isListening &&
    question.question_text?.startsWith("![");

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const loadImage = useCallback(async () => {
    if (!isImageQuestion) return;
    setImageLoading(true);
    try {
      const res = await getImageUrl(question.id);
      setImageSrc(res.url);
    } catch {
      setImageSrc(null);
    } finally {
      setImageLoading(false);
    }
  }, [question.id, isImageQuestion]);

  useEffect(() => {
    setImageSrc(null);
    if (isImageQuestion) {
      loadImage();
    }
  }, [question.id, isImageQuestion, loadImage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          第 {index + 1} 题 / 共 {total} 题
        </h2>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          {isListening ? "听力" : "阅读"}
          {question.level && <LevelBadge level={question.level} />}
        </span>
      </div>

      {isListening && question.audio_url && (
        <AudioPlayer questionId={question.id} />
      )}

      {instruction && (
        <p className="text-sm text-muted-foreground italic">{instruction}</p>
      )}

      {isImageQuestion && (
        <div className="flex justify-center">
          {imageLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={`Question ${question.question_number}`}
              className="max-h-64 rounded-md border"
            />
          ) : null}
        </div>
      )}

      {question.passage && (
        <div className="max-h-[40vh] md:max-h-[60vh] overflow-y-auto rounded-md border bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {question.passage}
        </div>
      )}

      {question.question_text && !isImageQuestion && !isListening && (
        <p className="text-base font-medium">{question.question_text}</p>
      )}
    </div>
  );
}
