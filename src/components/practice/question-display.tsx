"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { QuestionBrief } from "@/lib/api/types";
import { AudioPlayer, type AudioPlayerHandle } from "./audio-player";
import { getImageUrl } from "@/lib/api/media";
import { LevelBadge } from "@/components/shared/level-badge";
import { getTcfPoints } from "@/lib/tcf-levels";
import { FrenchText, type WordSaveContext } from "./french-text";

const LISTENING_INSTRUCTIONS: Record<string, { fr: string; en: string; zhKey: string }> = {
  image: {
    fr: "Écoutez les 4 propositions, choisissez celle qui correspond à l\u2019image.",
    en: "Listen to the four options and choose the one matching the image.",
    zhKey: "practice.questionDisplay.imageListening",
  },
  audio: {
    fr: "Écoutez l\u2019extrait sonore et les 4 propositions. Choisissez la bonne réponse.",
    en: "Listen to the recording and four options, choose the correct answer.",
    zhKey: "practice.questionDisplay.imageListeningShort",
  },
};

interface QuestionDisplayProps {
  question: QuestionBrief;
  index: number;
  total: number;
  audioMaxPlays?: number;
  onAudioPlaybackComplete?: () => void;
  /** Disable vocabulary cards (e.g., exam mode) */
  vocabDisabled?: boolean;
  /** Callback when image load state changes (for layout adaptation) */
  onImageLoaded?: (loaded: boolean) => void;
  /** Context for saving vocabulary words */
  saveContext?: WordSaveContext;
  /** Ref for controlling audio playback (seekTo / playSegment) */
  audioRef?: React.Ref<AudioPlayerHandle>;
  /** Called with current playback time (seconds) on each audio timeupdate */
  onAudioTimeUpdate?: (time: number) => void;
  /** Whether the current question has been answered (controls translation visibility) */
  answered?: boolean;
  /** Auto-play audio when question changes (listening practice) */
  autoPlayAudio?: boolean;
}

export function QuestionDisplay({ question, index, total, audioMaxPlays, onAudioPlaybackComplete, vocabDisabled, onImageLoaded, saveContext, audioRef, onAudioTimeUpdate, answered, autoPlayAudio }: QuestionDisplayProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isListening = question.type === "listening";
  // Primary + secondary translation based on locale (like transcript block)
  const qZh = question.question_text_zh;
  const qEn = question.question_text_en;
  const qAr = question.question_text_ar;
  const qTranslations = locale === "zh" ? [qEn, qZh]
    : locale === "ar" ? [qAr, qEn]
    : locale === "en" ? [qEn, qZh] : [];
  const hasTranslation = qTranslations.some(Boolean);
  const mayHaveImage = !!question.has_image;
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

  // Notify parent when image load state changes
  useEffect(() => {
    onImageLoaded?.(imageLoaded);
  }, [imageLoaded, onImageLoaded]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {t("common.questionCounter", { current: index + 1, total })}
          </h2>
          {question.test_set_name && (
            <p className="text-xs text-muted-foreground">
              {question.test_set_name}
              {question.original_question_number != null && (
                <> · Q{question.original_question_number}</>
              )}
            </p>
          )}
        </div>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          {isListening ? t("common.types.listening") : t("common.types.reading")}
          {question.level && <LevelBadge level={question.level} />}
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums">
            {t("common.points", { points: getTcfPoints(question.original_question_number ?? question.question_number) })}
          </span>
        </span>
      </div>

      {isListening && question.audio_url && (
        <AudioPlayer
          ref={audioRef}
          questionId={question.id}
          maxPlays={audioMaxPlays}
          onPlaybackComplete={onAudioPlaybackComplete}
          onTimeUpdate={onAudioTimeUpdate}
          autoPlay={autoPlayAudio}
        />
      )}

      {instructionData && (
        <div>
          <p className="text-sm lg:text-base text-muted-foreground italic">
            {instructionData.fr}
            {locale !== "fr" && (
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="ml-1.5 inline-flex items-center gap-0.5 not-italic text-xs text-primary/70 hover:text-primary"
              >
                {t("practice.questionDisplay.tabChinese")}
                <ChevronDown className={`h-3 w-3 transition-transform ${showTranslation || answered ? "rotate-180" : ""}`} />
              </button>
            )}
          </p>
          {(showTranslation || answered) && locale !== "fr" && (
            <div className="mt-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {locale === "zh" && (
                <p className="text-xs lg:text-sm text-blue-600 dark:text-blue-400">{instructionData.en}</p>
              )}
              <p className="text-xs lg:text-sm text-emerald-600 dark:text-emerald-400">{t(instructionData.zhKey)}</p>
            </div>
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
        <div className="max-h-[40vh] md:max-h-[60vh] overflow-y-auto rounded-md border bg-muted/50 p-4 text-sm lg:text-base leading-relaxed whitespace-pre-line">
          <FrenchText text={question.passage} disabled={vocabDisabled} saveContext={saveContext} />
        </div>
      )}

      {question.question_text && (
        <div>
          {!isListening && (
            <p className="text-base font-medium">
              <FrenchText text={question.question_text} disabled={vocabDisabled} saveContext={saveContext} />
            </p>
          )}
          {isListening && (
            <p className="text-sm lg:text-base font-medium text-muted-foreground">{question.question_text}</p>
          )}
          {answered && hasTranslation && (
            <div className="mt-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {locale === "zh" && qEn && <p className="text-sm lg:text-base text-blue-600 dark:text-blue-400">{qEn}</p>}
              {qTranslations[1] && <p className="text-xs lg:text-sm text-emerald-600 dark:text-emerald-400">{qTranslations[1]}</p>}
              {locale !== "zh" && qTranslations[0] && <p className="text-sm lg:text-base text-emerald-600 dark:text-emerald-400">{qTranslations[0]}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
