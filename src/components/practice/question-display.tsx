"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import type { QuestionBrief } from "@/lib/api/types";
import { AudioPlayer } from "./audio-player";
import { getImageUrl } from "@/lib/api/media";
import { LevelBadge } from "@/components/shared/level-badge";
import { getTcfPoints } from "@/lib/tcf-levels";

const LISTENING_INSTRUCTIONS: Record<string, { fr: string; zh: string }> = {
  image: {
    fr: "Écoutez les 4 propositions, choisissez celle qui correspond à l\u2019image.",
    zh: "听四个选项，选择与图片相符的。",
  },
  audio: {
    fr: "Écoutez l\u2019extrait sonore et les 4 propositions. Choisissez la bonne réponse.",
    zh: "听录音和四个选项，选择正确答案。",
  },
};

interface QuestionDisplayProps {
  question: QuestionBrief;
  index: number;
  total: number;
  audioMaxPlays?: number;
  onAudioPlaybackComplete?: () => void;
}

export function QuestionDisplay({ question, index, total, audioMaxPlays, onAudioPlaybackComplete }: QuestionDisplayProps) {
  const isListening = question.type === "listening";
  // Listening A1/A2 questions (Q1-10) may have an associated image in Azure
  const mayHaveImage = isListening && question.question_number <= 10;
  const [showTranslation, setShowTranslation] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  // Whether the image actually rendered successfully
  const [imageLoaded, setImageLoaded] = useState(false);

  const instructionData = isListening
    ? LISTENING_INSTRUCTIONS[imageLoaded ? "image" : "audio"]
    : null;

  const loadImage = useCallback(async () => {
    if (!mayHaveImage) return;
    setImageLoading(true);
    try {
      const res = await getImageUrl(question.id);
      setImageSrc(res.url);
    } catch {
      setImageSrc(null);
    } finally {
      setImageLoading(false);
    }
  }, [question.id, mayHaveImage]);

  useEffect(() => {
    setImageSrc(null);
    setImageLoaded(false);
    if (mayHaveImage) {
      loadImage();
    }
  }, [question.id, mayHaveImage, loadImage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          第 {index + 1} 题 / 共 {total} 题
        </h2>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          {isListening ? "听力" : "阅读"}
          {question.level && <LevelBadge level={question.level} />}
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums">
            {getTcfPoints(question.question_number)} 分
          </span>
        </span>
      </div>

      {isListening && question.audio_url && (
        <AudioPlayer
          questionId={question.id}
          maxPlays={audioMaxPlays}
          onPlaybackComplete={onAudioPlaybackComplete}
        />
      )}

      {instructionData && (
        <div>
          <p className="text-sm text-muted-foreground italic">
            {instructionData.fr}
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className="ml-1.5 inline-flex items-center gap-0.5 not-italic text-xs text-primary/70 hover:text-primary"
            >
              中文
              <ChevronDown className={`h-3 w-3 transition-transform ${showTranslation ? "rotate-180" : ""}`} />
            </button>
          </p>
          {showTranslation && (
            <p className="mt-1 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
              {instructionData.zh}
            </p>
          )}
        </div>
      )}

      {mayHaveImage && (imageLoading || imageSrc) && (
        <div className={`flex justify-center${!imageLoaded && !imageLoading ? " hidden" : ""}`}>
          {imageLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={`Question ${question.question_number}`}
              className="max-h-64 rounded-md border"
              onLoad={() => setImageLoaded(true)}
              onError={() => { setImageSrc(null); setImageLoaded(false); }}
            />
          ) : null}
        </div>
      )}

      {question.passage && (
        <div className="max-h-[40vh] md:max-h-[60vh] overflow-y-auto rounded-md border bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {question.passage}
        </div>
      )}

      {question.question_text && !isListening && (
        <p className="text-base font-medium">{question.question_text}</p>
      )}
    </div>
  );
}
