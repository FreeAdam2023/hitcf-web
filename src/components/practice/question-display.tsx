"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, ChevronDown, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { QuestionBrief } from "@/lib/api/types";
import { AudioPlayer, type AudioPlayerHandle } from "./audio-player";
import { getImageUrl } from "@/lib/api/media";
import { LevelBadge } from "@/components/shared/level-badge";
import { getTcfPoints } from "@/lib/tcf-levels";
import { FrenchText, type WordSaveContext } from "./french-text";
import { SentenceAnalysisInline } from "./sentence-analysis-inline";
import { PassageContent } from "./passage-content";
import { localizeTestName } from "@/lib/test-name";

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
  /** Exam mode: pass to AudioPlayer for minimal UI */
  examMode?: boolean;
  /** Action buttons (bookmark, report) rendered in the header row */
  actions?: React.ReactNode;
  /** Control EN translation visibility (Chinese locale only) */
  showEn?: boolean;
  /** Control native translation visibility */
  showNative?: boolean;
  /** Whether options are locked (answered) — enables sentence analysis on question text */
  locked?: boolean;
  /** Whether in exam mode — hides sentence analysis */
  isExam?: boolean;
}

export function QuestionDisplay({ question, index, total, audioMaxPlays, onAudioPlaybackComplete, vocabDisabled, onImageLoaded, saveContext, audioRef, onAudioTimeUpdate, answered, autoPlayAudio, examMode, actions, showEn, showNative, locked, isExam }: QuestionDisplayProps) {
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
    <div className={`space-y-4 ${examMode ? "select-none" : ""}`}>
      {!examMode && (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("common.questionCounter", { current: index + 1, total })}
          </h2>
          {actions}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span>{isListening ? t("common.types.listening") : t("common.types.reading")}</span>
          {question.level && <LevelBadge level={question.level} size="sm" />}
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium tabular-nums">
            {t("common.points", { points: getTcfPoints(question.original_question_number ?? question.question_number) })}
          </span>
          {question.test_set_name && (
            <>
              <span className="text-border">|</span>
              <span>
                {localizeTestName(t, isListening ? "listening" : "reading", question.test_set_name!)}
                {question.original_question_number != null && ` · Q${question.original_question_number}`}
              </span>
            </>
          )}
        </div>

        {/* Question ID — plain read-only label. Feedback dialog attaches
            the id automatically; this is just so users can see and reference
            it in any external channel (screenshot, email, etc.). */}
        <div className="mt-1 text-[11px] text-muted-foreground/70">
          {t("practice.questionDisplay.idLabel")}{" "}
          <code className="font-mono">{question.id}</code>
        </div>
      </div>
      )}

      {isListening && question.audio_url && (
        <AudioPlayer
          ref={audioRef}
          questionId={question.id}
          audioUrl={question.audio_url}
          maxPlays={audioMaxPlays}
          onPlaybackComplete={onAudioPlaybackComplete}
          onTimeUpdate={onAudioTimeUpdate}
          autoPlay={autoPlayAudio}
          examMode={examMode}
        />
      )}

      {instructionData && (
        <div>
          <p className="text-base text-muted-foreground italic">
            {instructionData.fr}
            {locale !== "fr" && (
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="ml-1.5 inline-flex items-center gap-0.5 not-italic text-xs text-primary/70 hover:text-primary"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${showTranslation || answered ? "rotate-180" : ""}`} />
              </button>
            )}
          </p>
          {(showTranslation || answered) && locale !== "fr" && (
            <div className="mt-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {locale === "zh" && (showEn ?? true) && (
                <p className="text-sm text-blue-600 dark:text-blue-400">{instructionData.en}</p>
              )}
              {locale === "zh" && (showNative ?? true) && (
                <p className="text-[11px] lg:text-xs text-muted-foreground pl-1">{t(instructionData.zhKey)}</p>
              )}
              {locale !== "zh" && <p className="text-sm text-emerald-600 dark:text-emerald-400">{t(instructionData.zhKey)}</p>}
            </div>
          )}
        </div>
      )}

      {mayHaveImage && (imageLoading || imageSrc) && (
        <div className="flex justify-center">
          {imageLoading ? (
            <div className="flex h-48 w-72 items-center justify-center rounded-md border bg-muted/50">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : imageSrc ? (
            <div className="relative">
              {!imageLoaded && (
                <div className="flex h-48 w-72 items-center justify-center rounded-md border bg-muted/50 animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={`Question ${question.question_number}`}
                className={`max-h-64 rounded-md border${!imageLoaded ? " absolute opacity-0" : ""}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => { setImageSrc(null); setImageLoaded(false); }}
              />
            </div>
          ) : null}
        </div>
      )}

      {question.passage && (
        <div className="rounded-md border bg-muted/50 p-4 text-base leading-relaxed">
          <PassageContent text={question.passage} disabled={vocabDisabled} saveContext={saveContext} />
        </div>
      )}

      {question.question_text && !(isListening && instructionData) && (
        <QuestionTextWithAnalysis
          question={question}
          vocabDisabled={vocabDisabled}
          saveContext={saveContext}
          locked={locked}
          isExam={isExam}
          answered={answered}
          locale={locale}
          showEn={showEn}
          showNative={showNative}
          qEn={qEn}
          qTranslations={qTranslations}
          hasTranslation={hasTranslation}
        />
      )}
    </div>
  );
}

/** Question text with inline sentence analysis button (reading questions) */
function QuestionTextWithAnalysis({ question, vocabDisabled, saveContext, locked, isExam, answered, locale, showEn, showNative, qEn, qTranslations, hasTranslation }: {
  question: QuestionBrief;
  vocabDisabled?: boolean;
  saveContext?: WordSaveContext;
  locked?: boolean;
  isExam?: boolean;
  answered?: boolean;
  locale: string;
  showEn?: boolean;
  showNative?: boolean;
  qEn: string | null | undefined;
  qTranslations: (string | null | undefined)[];
  hasTranslation: boolean;
}) {
  const t = useTranslations();
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div>
      <p className="text-base font-medium">
        <span className="inline">
          <FrenchText text={question.question_text!} disabled={vocabDisabled} saveContext={saveContext} />
          {locked && !isExam && (
            <button
              onClick={() => setShowAnalysis((v) => !v)}
              className={`ml-1 inline-flex items-center gap-1 rounded p-0.5 text-xs transition-colors hover:bg-muted hover:text-primary ${showAnalysis ? "text-primary" : "text-muted-foreground/50"}`}
              title={t("sentenceAnalysis.trigger")}
            >
              <BookOpen className="h-3 w-3" />
            </button>
          )}
        </span>
      </p>
      {answered && hasTranslation && (
        <div className="mt-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {locale === "zh" && (showEn ?? true) && qEn && <p className="text-base text-blue-600 dark:text-blue-400">{qEn}</p>}
          {locale === "zh" && (showNative ?? true) && qTranslations[1] && <p className="text-sm text-muted-foreground pl-1">{qTranslations[1]}</p>}
          {locale !== "zh" && qTranslations[0] && <p className="text-base text-emerald-600 dark:text-emerald-400">{qTranslations[0]}</p>}
        </div>
      )}
      {showAnalysis && (
        <SentenceAnalysisInline
          questionId={question.id}
          sentenceIndex={200}
          sentenceFr={question.question_text!}
          saveContext={saveContext}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </div>
  );
}
