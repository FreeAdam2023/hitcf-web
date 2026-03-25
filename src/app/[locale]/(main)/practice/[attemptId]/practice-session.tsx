"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CheckCircle, LayoutGrid, AlertTriangle, BookmarkCheck, FileText, Play, BookOpen, Star, Eye, EyeOff, Lightbulb, BookCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePracticeStore } from "@/stores/practice-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranscriptLang } from "@/hooks/use-transcript-lang";
import { submitAnswer, completeAttempt } from "@/lib/api/attempts";
import { toggleBookmark, checkBookmarks } from "@/lib/api/bookmarks";
import { fetchDrillNav, loadDrillQuestion } from "@/lib/api/speed-drill";
import { NAV_PAGE_SIZE } from "@/stores/practice-store";
import { getQuestionDetail, generateExplanation, getExplanationStatus } from "@/lib/api/questions";
import type { ExplanationResponse } from "@/lib/api/questions";
import { getQuotaStatus, type QuotaStatus } from "@/lib/api/subscriptions";
import { ApiError, QuotaExceededError } from "@/lib/api/client";
import { QuotaExceededModal } from "@/components/shared/quota-exceeded-modal";
import { QuestionDisplay } from "@/components/practice/question-display";
import { OptionList } from "@/components/practice/option-list";
import { QuestionNavigator } from "@/components/practice/question-navigator";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ReportDialog } from "@/components/practice/report-dialog";
import { cn } from "@/lib/utils";
import { getTcfLevelByQuestionNumber } from "@/lib/tcf-levels";
import { FrenchText, type WordSaveContext } from "@/components/practice/french-text";
import { SentenceAnalysisInline } from "@/components/practice/sentence-analysis-inline";
import type { AudioPlayerHandle } from "@/components/practice/audio-player";
import type { AudioSegment, Explanation, QuestionBrief } from "@/lib/api/types";

/** Strip leading key prefix from option translation text (e.g. "a happy birthday" → "happy birthday") */
function stripKeyPrefix(text: string, key: string): string {
  const lower = key.toLowerCase();
  const upper = key.toUpperCase();
  for (const prefix of [`${upper}. `, `${lower}. `, `${upper} `, `${lower} `]) {
    if (text.startsWith(prefix)) return text.slice(prefix.length);
  }
  return text;
}

/** Transcript block: sentence-by-sentence trilingual cards (FR / EN bridge / Native) */
function TranscriptBlock({
  question,
  explanation,
  showEn,
  showNative,
  onToggleNative,
  transcriptLabel,
  locale,
  audioTimestamps,
  currentAudioTime,
  onSentenceClick,
  saveContext,
  questionId,
}: {
  question: QuestionBrief;
  explanation: Explanation | null;
  showEn: boolean;
  showNative: boolean;
  onToggleNative: () => void;
  transcriptLabel: string;
  locale: string;
  audioTimestamps?: AudioSegment[] | null;
  currentAudioTime?: number;
  onSentenceClick?: (start: number, end: number) => void;
  saveContext?: WordSaveContext;
  questionId?: string;
}) {
  const t = useTranslations();
  const [analysisTarget, setAnalysisTarget] = useState<{ index: number; fr: string } | null>(null);
  const isListening = question.type === "listening";
  const isReading = question.type === "reading";
  const hasTranscript = !!question.transcript;
  // Show option translations: reading only (listening A1/A2 options already in transcript)
  const showTranscriptOptions =
    isReading && question.options.length > 0;

  const sentences = explanation?.sentence_translation;

  // Build sentence index → time range map from audio timestamps
  const sentenceTimeMap = useMemo(() => {
    if (!audioTimestamps) return null;
    const map = new Map<number, { start: number; end: number }>();
    for (const seg of audioTimestamps) {
      if (seg.sentence_index != null) {
        const existing = map.get(seg.sentence_index);
        if (existing) {
          existing.start = Math.min(existing.start, seg.start);
          existing.end = Math.max(existing.end, seg.end);
        } else {
          map.set(seg.sentence_index, { start: seg.start, end: seg.end });
        }
      }
    }
    return map.size > 0 ? map : null;
  }, [audioTimestamps]);

  // Reading: only show when sentence translations are available
  if (isReading && (!sentences || sentences.length === 0)) return null;
  // Listening: show when transcript, audio timestamps, or options exist
  if (!isReading && !hasTranscript && !audioTimestamps?.length && !showTranscriptOptions) return null;

  return (
    <div className="rounded-lg bg-muted/50 p-3 text-sm lg:text-base animate-in fade-in duration-300">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="flex items-center gap-1.5 font-medium">
            <FileText className="h-4 w-4" />
            {transcriptLabel}
          </h4>
          {sentenceTimeMap && (
            <span className="text-[10px] text-muted-foreground">
              {t("practice.session.clickToPlay")}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {/* Non-Chinese locales keep toggles here (Chinese toggles moved to question header) */}
          {locale !== "zh" && locale !== "fr" && (
            <button
              onClick={onToggleNative}
              className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                showNative
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {locale === "en" ? "EN" : locale.toUpperCase()}
            </button>
          )}
        </div>
      </div>

      {/* Sentence-by-sentence trilingual cards */}
      {sentences && sentences.length > 0 && !(isListening && audioTimestamps?.length) ? (
        (() => {
          // Detect if ALL sentences are option-format (e.g. "a joyeux anniversaire")
          const optPattern = /^([a-dA-D])[\.\s]+(.+)$/;
          const isOptionFormat = sentences.every((s) => optPattern.test(s.fr.trim()));

          return isOptionFormat ? (
            <div className="space-y-3">
              {sentences.map((s, i) => {
                const match = s.fr.trim().match(optPattern)!;
                const key = match[1].toUpperCase();
                const frText = match[2];
                const nativeText = s.native || s.zh;
                return (
                  <div key={i} className="space-y-0.5">
                    <p className="font-medium leading-relaxed text-foreground">
                      {key}. <FrenchText text={frText} saveContext={saveContext} sentenceTranslations={sentences} />
                    </p>
                    {locale === "zh" && showEn && s.en && (
                      <p className="pl-6 leading-relaxed text-blue-600 dark:text-blue-400">
                        {stripKeyPrefix(s.en, key)}
                      </p>
                    )}
                    {locale === "zh" && showNative && nativeText && (
                      <p className="pl-7 text-xs leading-relaxed text-muted-foreground">
                        {stripKeyPrefix(nativeText, key)}
                      </p>
                    )}
                    {locale !== "zh" && locale !== "fr" && showNative && nativeText && (
                      <p className="pl-6 leading-relaxed text-emerald-600 dark:text-emerald-400">
                        {stripKeyPrefix(nativeText, key)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {sentences.map((s, i) => {
                const nativeText = s.native || s.zh;
                const isKey = (isReading || isListening) && s.is_key;
                const timeRange = sentenceTimeMap?.get(i);
                const isPlaying = timeRange && currentAudioTime != null
                  && currentAudioTime >= timeRange.start
                  && currentAudioTime < timeRange.end;
                const clickable = !!timeRange && !!onSentenceClick;
                return (
                  <div
                    key={i}
                    className={[
                      "space-y-0.5 rounded-md px-2 py-2.5 transition-colors",
                      isKey ? "border-l-[3px] border-amber-500 bg-amber-50 pl-3 dark:bg-amber-950/30" : "",
                      isPlaying ? "bg-primary/10" : "",
                      clickable ? "cursor-pointer hover:bg-primary/5" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={clickable ? () => onSentenceClick!(timeRange!.start, timeRange!.end) : undefined}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={clickable ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSentenceClick!(timeRange!.start, timeRange!.end);
                      }
                    } : undefined}
                  >
                    <p className="font-medium leading-relaxed text-foreground">
                      {clickable && <Play className="mr-1 inline h-3 w-3 text-muted-foreground" />}
                      <FrenchText text={s.fr} saveContext={saveContext} sentenceTranslations={sentences} />
                      {isKey && <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400" title={t("explanation.keyClue")}>{t("explanation.keyLabel")}</span>}
                      <button
                        onClick={(e) => { e.stopPropagation(); setAnalysisTarget((prev) => prev?.index === i ? null : { index: i, fr: s.fr }); }}
                        className={`ml-1 inline-flex shrink-0 rounded p-0.5 transition-colors hover:bg-muted hover:text-primary ${analysisTarget?.index === i ? "text-primary" : "text-muted-foreground/50"}`}
                        title={t("sentenceAnalysis.trigger")}
                      >
                        <BookOpen className="h-3 w-3" />
                      </button>
                    </p>
                    {locale === "zh" && showEn && s.en && (
                      <p className={`leading-relaxed text-blue-600 dark:text-blue-400${clickable ? " pl-4" : ""}`}>
                        {s.en}
                      </p>
                    )}
                    {locale === "zh" && showNative && nativeText && (
                      <p className={`text-xs leading-relaxed text-muted-foreground${clickable ? " pl-5" : " pl-1"}`}>
                        {nativeText}
                      </p>
                    )}
                    {locale !== "zh" && locale !== "fr" && showNative && nativeText && (
                      <p className={`leading-relaxed text-emerald-600 dark:text-emerald-400${clickable ? " pl-4" : ""}`}>
                        {nativeText}
                      </p>
                    )}
                    {analysisTarget?.index === i && questionId && (
                      <SentenceAnalysisInline
                        questionId={questionId}
                        sentenceIndex={i}
                        sentenceFr={s.fr}
                        saveContext={saveContext}
                        onClose={() => setAnalysisTarget(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()
      ) : audioTimestamps && audioTimestamps.length > 0 ? (
        /* Whisper segments as clickable French sentences with inline translations */
        <div className="space-y-2">
          {audioTimestamps.map((seg, i) => {
            const timeRange = sentenceTimeMap?.get(seg.sentence_index ?? i);
            const isPlaying = timeRange && currentAudioTime != null
              && currentAudioTime >= timeRange.start
              && currentAudioTime < timeRange.end;
            const clickable = !!timeRange && !!onSentenceClick;
            const segNative = locale === "zh" ? seg.zh : locale === "ar" ? seg.ar : seg.en;
            const isKey = seg.is_key;
            return (
              <div
                key={i}
                className={[
                  "rounded-md px-2 py-1 transition-colors",
                  isKey ? "border-l-[3px] border-amber-500 bg-amber-50 pl-3 dark:bg-amber-950/30" : "",
                  isPlaying ? "bg-primary/10" : "",
                  clickable ? "cursor-pointer hover:bg-primary/5" : "",
                ].filter(Boolean).join(" ")}
                onClick={clickable ? () => onSentenceClick!(timeRange!.start, timeRange!.end) : undefined}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={clickable ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSentenceClick!(timeRange!.start, timeRange!.end);
                  }
                } : undefined}
              >
                <p className="font-medium leading-relaxed text-foreground">
                  {clickable && <Play className="mr-1 inline h-3 w-3 text-muted-foreground" />}
                  <FrenchText text={seg.text} saveContext={saveContext} sentenceTranslations={[{ fr: seg.text, en: seg.en ?? undefined, zh: seg.zh ?? undefined, native: segNative ?? undefined }]} />
                  {isKey && <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400" title={t("explanation.keyClue")}>{t("explanation.keyLabel")}</span>}
                  <button
                    onClick={(e) => { e.stopPropagation(); const idx = seg.sentence_index ?? i; setAnalysisTarget((prev) => prev?.index === idx ? null : { index: idx, fr: seg.text }); }}
                    className={`ml-1 inline-flex shrink-0 rounded p-0.5 transition-colors hover:bg-muted hover:text-primary ${analysisTarget?.index === (seg.sentence_index ?? i) ? "text-primary" : "text-muted-foreground/50"}`}
                    title={t("sentenceAnalysis.trigger")}
                  >
                    <BookOpen className="h-3 w-3" />
                  </button>
                </p>
                {locale === "zh" && showEn && seg.en && (
                  <p className={`leading-relaxed text-blue-600 dark:text-blue-400${clickable ? " pl-4" : ""}`}>
                    {seg.en}
                  </p>
                )}
                {locale === "zh" && showNative && segNative && (
                  <p className={`text-xs leading-relaxed text-muted-foreground${clickable ? " pl-5" : " pl-1"}`}>
                    {segNative}
                  </p>
                )}
                {locale !== "zh" && locale !== "fr" && showNative && segNative && (
                  <p className={`leading-relaxed text-emerald-600 dark:text-emerald-400${clickable ? " pl-4" : ""}`}>
                    {segNative}
                  </p>
                )}
                {analysisTarget?.index === (seg.sentence_index ?? i) && questionId && (
                  <SentenceAnalysisInline
                    questionId={questionId}
                    sentenceIndex={seg.sentence_index ?? i}
                    sentenceFr={seg.text}
                    saveContext={saveContext}
                    onClose={() => setAnalysisTarget(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : hasTranscript ? (
        /* Fallback: raw transcript before explanation loads */
        <p className="whitespace-pre-wrap leading-relaxed text-foreground">
          <FrenchText text={question.transcript!} saveContext={saveContext} />
        </p>
      ) : null}

      {/* Option translations moved to OptionList component */}

    </div>
  );
}

export function PracticeSession() {
  const t = useTranslations();
  const router = useRouter();
  const {
    attemptId,
    testSetName,
    testSetType,
    questions,
    currentIndex,
    answers,
    previousAnswers,
    setAnswer,
    goNext,
    goPrev,
    goToQuestion,
    drillMode,
    drillTotal,
    drillQuestionIds,
    drillAnsweredIds,
    drillNavLoadedPages,
    loadedQuestions,
    setDrillQuestion,
    setDrillNavPage,
  } = usePracticeStore();

  const totalQuestions = drillMode ? drillTotal : questions.length;

  const locale = useLocale();
  const hasActiveSub = useAuthStore((s) => s.hasActiveSubscription);
  const isSubscriber = hasActiveSub();
  const { showEn, showNative, toggleEn, toggleNative } = useTranscriptLang();

  const [openBook, setOpenBook] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`openBook:${attemptId}`) === "1";
  });
  const toggleOpenBook = useCallback(() => {
    setOpenBook((v) => {
      const next = !v;
      if (next) localStorage.setItem(`openBook:${attemptId}`, "1");
      else localStorage.removeItem(`openBook:${attemptId}`);
      return next;
    });
  }, [attemptId]);

  // ── Open-book reviewed tracking ──
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(`reviewed:${attemptId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const toggleReviewed = useCallback(() => {
    const q = questions[currentIndex];
    if (!q) return;
    setReviewedIds((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id); else next.add(q.id);
      try { localStorage.setItem(`reviewed:${attemptId}`, JSON.stringify(Array.from(next))); } catch { /* quota */ }
      return next;
    });
  }, [attemptId, questions, currentIndex]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [wrongCollected, setWrongCollected] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [quotaModal, setQuotaModal] = useState<{
    open: boolean;
    type: "question" | "explanation";
    used: number;
    limit: number;
  }>({ open: false, type: "question", used: 0, limit: 0 });
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState(false);
  // hasImage state removed — horizontal layout now uses question.has_image directly
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);
  const [audioTime, setAudioTime] = useState(0);

  // ── Bookmarks ──
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // In drill mode, bookmark status comes per-question via loadDrillQuestion
    if (drillMode || questions.length === 0) return;
    const ids = questions.map((q) => q.id);
    checkBookmarks(ids)
      .then((res) => setBookmarkedIds(new Set(res.bookmarked)))
      .catch(() => {});
  }, [questions, drillMode]);

  // ── Drill mode: on-demand question loading ──
  const drillLoadingRef = useRef<string | null>(null); // question ID being loaded

  useEffect(() => {
    if (!drillMode || !attemptId) return;

    // 1. Ensure nav page is loaded (contains question IDs for this index)
    const navPage = Math.floor(currentIndex / NAV_PAGE_SIZE) + 1;
    if (!drillNavLoadedPages.has(navPage)) {
      fetchDrillNav(attemptId, navPage)
        .then((nav) => setDrillNavPage(navPage, nav.question_ids, nav.answered_ids))
        .catch((err) => console.error("Failed to load nav page", err));
      return; // effect re-runs after store updates
    }

    // 2. Load question on demand
    const qid = drillQuestionIds[currentIndex];
    if (!qid) return;

    if (loadedQuestions.has(qid)) {
      if (!questions[currentIndex]) setDrillQuestion(loadedQuestions.get(qid)!);
      return;
    }

    if (drillLoadingRef.current === qid) return;
    drillLoadingRef.current = qid;

    const applyQuestion = (q: QuestionBrief & { bookmarked?: boolean; answered?: boolean; selected?: string; is_correct?: boolean; correct_answer?: string }) => {
      if (q.bookmarked) setBookmarkedIds((prev) => new Set(prev).add(q.id));
      if (q.answered && q.selected && q.correct_answer !== undefined) {
        if (!answers.get(q.id)) {
          setAnswer(q.id, {
            question_id: q.id, question_number: q.question_number,
            selected: q.selected, is_correct: q.is_correct ?? false,
            correct_answer: q.correct_answer ?? null, level: q.level,
          });
        }
      }
      setDrillQuestion(q);
    };

    loadDrillQuestion(qid, attemptId)
      .then(applyQuestion)
      .catch((err) => console.error("Failed to load drill question", err))
      .finally(() => {
        if (drillLoadingRef.current === qid) { drillLoadingRef.current = null; }
      });

    // 3. Prefetch next question
    const nextQid = drillQuestionIds[currentIndex + 1];
    if (nextQid && !loadedQuestions.has(nextQid)) {
      loadDrillQuestion(nextQid, attemptId).then(applyQuestion).catch(() => {});
    }

    // 4. Prefetch next nav page if approaching boundary
    const posInPage = currentIndex % NAV_PAGE_SIZE;
    if (posInPage >= NAV_PAGE_SIZE - 2) {
      const nextNavPage = navPage + 1;
      if (!drillNavLoadedPages.has(nextNavPage) && (nextNavPage - 1) * NAV_PAGE_SIZE < drillTotal) {
        fetchDrillNav(attemptId, nextNavPage).then((nav) => setDrillNavPage(nextNavPage, nav.question_ids, nav.answered_ids)).catch(() => {});
      }
    }
  }, [drillMode, attemptId, currentIndex, drillQuestionIds, drillNavLoadedPages, loadedQuestions, questions, setDrillQuestion, setDrillNavPage, answers, setAnswer, drillTotal]);

  // ── Quota tracking (free users) ──
  const [initialQuota, setInitialQuota] = useState<QuotaStatus | null>(null);
  const [sessionAnswered, setSessionAnswered] = useState(0);

  useEffect(() => {
    if (!isSubscriber) {
      getQuotaStatus().then(setInitialQuota).catch(() => {});
    }
  }, [isSubscriber]);

  // Show modal immediately when entering practice at quota limit
  useEffect(() => {
    if (!initialQuota || isSubscriber || initialQuota.questions.unlimited) return;
    if (initialQuota.questions.used >= initialQuota.questions.limit) {
      setQuotaModal({
        open: true,
        type: "question",
        used: initialQuota.questions.used,
        limit: initialQuota.questions.limit,
      });
    }
  }, [initialQuota, isSubscriber]);

  const quotaReached = useMemo(() => {
    if (isSubscriber || !initialQuota || initialQuota.questions.unlimited) return false;
    return (initialQuota.questions.used + sessionAnswered) >= initialQuota.questions.limit;
  }, [isSubscriber, initialQuota, sessionAnswered]);

  const showQuotaModal = useCallback(() => {
    setQuotaModal({
      open: true,
      type: "question",
      used: (initialQuota?.questions.used ?? 0) + sessionAnswered,
      limit: initialQuota?.questions.limit ?? 0,
    });
  }, [initialQuota, sessionAnswered]);

  // Fetch explanation — called once by parent, shared with both panels
  // POST returns 202 {status:"generating"} when async generation starts → poll GET every 3s
  // POST returns {status:"ready", ...data} when cached → use immediately
  // Backward compat: POST may return explanation data without status field
  const fetchingRef = useRef(false);
  const expectedQuestionRef = useRef<string>("");
  const fetchExplanation = useCallback((questionId: string, force?: boolean) => {
    if (fetchingRef.current && !force) return;
    fetchingRef.current = true;
    expectedQuestionRef.current = questionId;
    setExplanationLoading(true);
    setExplanationError(false);

    const handleResponse = (data: ExplanationResponse) => {
      if (expectedQuestionRef.current !== questionId) {
        fetchingRef.current = false;
        return;
      }
      // Async generation in progress → start polling via GET
      if (data.status === "generating") {
        startPolling(questionId);
        return;
      }
      // Ready (explicit status or backward compat with no status field)
      if (data.status === "ready" || !("status" in data) || data.status === undefined) {
        const explanationData = { ...data } as Record<string, unknown>;
        delete explanationData.status;
        setExplanation(explanationData as unknown as Explanation);
        fetchingRef.current = false;
        setExplanationLoading(false);
        return;
      }
      // not_started or unexpected → error
      setExplanationError(true);
      fetchingRef.current = false;
      setExplanationLoading(false);
    };

    const handleError = (err: unknown) => {
      if (expectedQuestionRef.current !== questionId) {
        fetchingRef.current = false;
        return;
      }
      if (err instanceof QuotaExceededError) {
        setQuotaModal({ open: true, type: "explanation", used: err.used, limit: err.limit });
        fetchingRef.current = false;
        setExplanationLoading(false);
        return;
      }
      if (err instanceof ApiError && err.status === 429) {
        setExplanationError(true);
        fetchingRef.current = false;
        setExplanationLoading(false);
        return;
      }
      setExplanationError(true);
      fetchingRef.current = false;
      setExplanationLoading(false);
    };

    // Poll GET endpoint every 3s, max 20 times (60s total)
    const startPolling = (qId: string) => {
      let pollCount = 0;
      const poll = () => {
        if (expectedQuestionRef.current !== qId) {
          fetchingRef.current = false;
          return;
        }
        pollCount++;
        if (pollCount > 20) {
          setExplanationError(true);
          fetchingRef.current = false;
          setExplanationLoading(false);
          return;
        }
        getExplanationStatus(qId, locale)
          .then((data) => {
            if (expectedQuestionRef.current !== qId) {
              fetchingRef.current = false;
              return;
            }
            if (data.status === "ready") {
              const explanationData = { ...data } as Record<string, unknown>;
              delete explanationData.status;
              setExplanation(explanationData as unknown as Explanation);
              fetchingRef.current = false;
              setExplanationLoading(false);
            } else if (data.status === "generating") {
              setTimeout(poll, 3000);
            } else {
              // not_started or unexpected after POST triggered generation → error
              setExplanationError(true);
              fetchingRef.current = false;
              setExplanationLoading(false);
            }
          })
          .catch(handleError);
      };
      setTimeout(poll, 3000);
    };

    // Kick off with POST
    generateExplanation(questionId, force, locale)
      .then(handleResponse)
      .catch(handleError);
  }, [locale]);

  // Clear pending selection and indicators when navigating
  useEffect(() => {
    setSelectedKey(null);
    setSavedIndicator(false);
    setWrongCollected(false);
    setExplanation(null);
    setExplanationLoading(false);
    setExplanationError(false);
    setAudioTime(0);
    fetchingRef.current = false;
  }, [currentIndex]);

  // Prevent accidental navigation (browser back/forward swipe + tab close)
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; });

  // Prevent accidental back navigation (but no beforeunload — answers are saved in real-time)
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (answersRef.current.size > 0) {
        window.history.pushState(null, "", window.location.href);
        toast.error(t("practice.session.exitWarning"));
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const rawQuestion = questions[currentIndex];
  // Keep showing the last loaded question during drill transitions to avoid flash
  const lastQuestionRef = useRef<QuestionBrief | null>(null);
  if (rawQuestion) lastQuestionRef.current = rawQuestion;
  const question = rawQuestion ?? (drillMode ? lastQuestionRef.current : null);
  const isStaleQuestion = drillMode && !rawQuestion && !!lastQuestionRef.current;
  const realAnswer = question ? (answers.get(question.id) ?? previousAnswers.get(question.id) ?? null) : null;
  // Open-book mode: fetch correct_answer directly from question detail API
  const [openBookCorrect, setOpenBookCorrect] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!openBook || !question || openBookCorrect[question.id]) return;
    getQuestionDetail(question.id)
      .then((d) => {
        if (d.correct_answer) {
          setOpenBookCorrect((prev) => ({ ...prev, [d.id]: d.correct_answer! }));
        }
      })
      .catch(() => {});
  }, [openBook, question, openBookCorrect]);

  const openBookAnswer: typeof realAnswer = (() => {
    if (!openBook || !question) return null;
    const correctKey = openBookCorrect[question.id];
    if (!correctKey) return null;
    return {
      selected: correctKey,
      correct_answer: correctKey,
      is_correct: true,
      question_id: question.id,
      question_number: question.question_number,
      level: question.level,
    };
  })();
  const currentAnswer = realAnswer ?? openBookAnswer;

  const saveContext: WordSaveContext | undefined = question
    ? {
        sourceType: testSetType ?? question.type,
        testSetId: undefined, // not available in practice store
        testSetName: testSetName ?? undefined,
        questionId: question.id,
        questionNumber: question.question_number,
      }
    : undefined;

  const handleToggleBookmark = useCallback(async () => {
    if (!question) return;
    try {
      const res = await toggleBookmark(question.id);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (res.bookmarked) next.add(question.id);
        else next.delete(question.id);
        return next;
      });
      toast.success(res.bookmarked ? t("review.bookmarks.added") : t("review.bookmarks.removed"));
    } catch {
      toast.error(t("common.errors.operationFailed"));
    }
  }, [question, t]);

  // Prefetch explanation as soon as question loads (transcript translations + explanation ready before user answers)
  useEffect(() => {
    if (question && !explanation && !explanationLoading && !explanationError) {
      fetchExplanation(question.id);
    }
  }, [question, explanation, explanationLoading, explanationError, fetchExplanation]);

  // In practice mode, clicking an option only sets the pending selection (does not submit)
  const handleSelect = useCallback((key: string) => {
    if (!question || !attemptId) return;
    if (answers.has(question.id) || previousAnswers.has(question.id) || submitting) return;
    setSelectedKey(key);
  }, [question, attemptId, answers, previousAnswers, submitting]);

  // Confirm button triggers actual submission
  const handleConfirm = useCallback(async () => {
    if (!selectedKey || !question || !attemptId) return;
    if (answers.has(question.id) || previousAnswers.has(question.id) || submitting) return;
    // Frontend quota gate — avoid wasting a round-trip
    if (quotaReached) {
      showQuotaModal();
      return;
    }
    setSubmitting(true);
    setSubmittingKey(selectedKey);
    try {
      const res = await submitAnswer(attemptId, {
        question_id: question.id,
        question_number: question.question_number,
        selected: selectedKey,
      });
      let correctAnswer = res.correct_answer;
      if (correctAnswer === undefined) {
        try {
          const detail = await getQuestionDetail(question.id);
          correctAnswer = detail.correct_answer;
        } catch {
          // ignore
        }
      }
      const fullAnswer = { ...res, correct_answer: correctAnswer ?? null };
      setAnswer(question.id, fullAnswer);
      setSelectedKey(null);
      setSessionAnswered((c) => c + 1);
      if (fullAnswer.is_correct === false) {
        setWrongCollected(true);
        setTimeout(() => setWrongCollected(false), 2500);
      } else {
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      }
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        setQuotaModal({
          open: true,
          type: err.code === "QUESTION_QUOTA_EXCEEDED" ? "question" : "explanation",
          used: err.used,
          limit: err.limit,
        });
      } else {
        console.error("Failed to submit answer", err);
        toast.error(t("common.errors.submitFailed"));
      }
    } finally {
      setSubmitting(false);
      setSubmittingKey(null);
    }
  }, [selectedKey, question, attemptId, answers, previousAnswers, submitting, setAnswer, quotaReached, showQuotaModal]);

  const handleComplete = async () => {
    if (!attemptId) return;
    setCompleting(true);
    try {
      await completeAttempt(attemptId);
      router.push(`/results/${attemptId}`);
    } catch (err) {
      console.error("Failed to complete attempt", err);
      setCompleting(false);
    }
  };

  const handleGoToQuestion = (index: number) => {
    // Block navigation to unanswered questions when quota is reached
    if (quotaReached) {
      const targetId = drillMode ? drillQuestionIds[index] : questions[index]?.id;
      if (targetId && !answers.has(targetId)) {
        showQuotaModal();
        return;
      }
    }
    goToQuestion(index);
  };

  const handleNext = useCallback(() => {
    // Block navigation to next unanswered question when quota is reached
    if (quotaReached) {
      const nextId = drillMode ? drillQuestionIds[currentIndex + 1] : questions[currentIndex + 1]?.id;
      if (nextId && !answers.has(nextId)) {
        showQuotaModal();
        return;
      }
    }
    goNext();
  }, [goNext, questions, currentIndex, answers, quotaReached, showQuotaModal, drillMode, drillQuestionIds]);

  // Fetch nav page IDs when navigator display page changes (drill mode)
  const handleNavPageChange = useCallback((displayPage: number) => {
    if (!drillMode || !attemptId) return;
    const backendPage = displayPage + 1; // 0-based display → 1-based backend
    if (!drillNavLoadedPages.has(backendPage)) {
      fetchDrillNav(attemptId, backendPage)
        .then((nav) => setDrillNavPage(backendPage, nav.question_ids, nav.answered_ids))
        .catch(() => {});
    }
  }, [drillMode, attemptId, drillNavLoadedPages, setDrillNavPage]);

  const handlePrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  // Stable refs for keyboard handler to avoid listener churn
  const handleSelectRef = useRef(handleSelect);
  useEffect(() => { handleSelectRef.current = handleSelect; });
  const handleConfirmRef = useRef(handleConfirm);
  useEffect(() => { handleConfirmRef.current = handleConfirm; });
  const handleNextRef = useRef(handleNext);
  useEffect(() => { handleNextRef.current = handleNext; });
  const handlePrevRef = useRef(handlePrev);
  useEffect(() => { handlePrevRef.current = handlePrev; });

  // Keyboard shortcuts: 1-4 / A-D select, Enter confirm, arrows navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const q = questions[currentIndex];
      if (!q) return;
      const answered = answersRef.current.has(q.id) || previousAnswers.has(q.id);

      // Enter = confirm pending selection
      if (e.key === "Enter" && !answered) {
        e.preventDefault();
        handleConfirmRef.current();
        return;
      }

      // Ignore when modifier keys are held (e.g. Ctrl+C to copy)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const keyMap: Record<string, number> = {
        "1": 0, "2": 1, "3": 2, "4": 3,
        a: 0, b: 1, c: 2, d: 3,
      };
      const optIndex = keyMap[e.key.toLowerCase()];
      if (optIndex !== undefined && !answered && q.options[optIndex]) {
        e.preventDefault();
        handleSelectRef.current(q.options[optIndex].key);
        return;
      }

      // Enter in open-book mode = toggle reviewed
      if (e.key === "Enter" && openBook) {
        e.preventDefault();
        toggleReviewed();
        return;
      }

      if (e.key === "ArrowRight" && currentIndex < totalQuestions - 1) {
        e.preventDefault();
        handleNextRef.current();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        handlePrevRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [questions, currentIndex, previousAnswers, totalQuestions, openBook, toggleReviewed]);

  if (!question || !attemptId) return <LoadingSpinner />;

  const isLast = currentIndex === totalQuestions - 1;
  const totalAnswered = drillMode
    ? drillAnsweredIds.size
    : new Set([...Array.from(answers.keys()), ...Array.from(previousAnswers.keys())]).size;
  const allAnswered = totalAnswered >= totalQuestions;

  return (
    <>
    <div className="grid gap-2 lg:gap-3 lg:grid-cols-[220px_1fr_360px] lg:h-full lg:overflow-hidden lg:rounded-xl lg:bg-muted/40 lg:p-2.5">
      {/* 左侧：题号导航 (桌面) */}
      <div className="hidden lg:block overflow-y-auto scrollbar-on-hover rounded-xl bg-card border shadow-sm p-3">
          <QuestionNavigator
            total={totalQuestions}
            currentIndex={currentIndex}
            answers={answers}
            questionIds={drillMode ? drillQuestionIds : questions.map((q) => q.id)}
            onNavigate={handleGoToQuestion}
            questions={drillMode ? undefined : questions.map((q) => ({ type: q.type, level: q.level || ((q.type === "listening" || q.type === "reading") ? getTcfLevelByQuestionNumber(q.question_number) : null) }))}
            previousAnswers={previousAnswers}
            drillAnsweredIds={drillMode ? drillAnsweredIds : undefined}
            onNavPageChange={drillMode ? handleNavPageChange : undefined}
            reviewedIds={openBook ? reviewedIds : undefined}
          />
      </div>

      {/* 中间：主内容 */}
      <div className={cn(
        "flex flex-col gap-4 overflow-y-auto scrollbar-on-hover pb-20 lg:pb-0 lg:rounded-xl lg:bg-card lg:border lg:shadow-sm lg:p-5 transition-opacity duration-150",
        isStaleQuestion && "opacity-40 pointer-events-none",
      )}>
        <QuestionDisplay
          question={question}
          index={currentIndex}
          total={totalQuestions}
          saveContext={saveContext}
          audioRef={audioPlayerRef}
          onAudioTimeUpdate={setAudioTime}
          answered={!!currentAnswer}
          autoPlayAudio={question.type === "listening" && currentIndex > 0}
          showEn={showEn}
          showNative={showNative}
          actions={
            <div className="flex shrink-0 items-center gap-1.5">
              {/* 功能区 */}
              <button
                onClick={toggleOpenBook}
                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                  openBook
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
                title={openBook ? t("practice.session.openBookOff") : t("practice.session.openBookOn")}
              >
                {openBook ? <EyeOff className="mr-0.5 inline h-3 w-3" /> : <Eye className="mr-0.5 inline h-3 w-3" />}
                {openBook ? t("practice.session.answerMode") : t("practice.session.openBook")}
              </button>
              {locale === "zh" && currentAnswer && (
                <>
                  <button
                    onClick={toggleEn}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                      showEn
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                    title={showEn ? t("practice.session.hideEn") : t("practice.session.showEn")}
                  >
                    EN
                  </button>
                  <button
                    onClick={toggleNative}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                      showNative
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                    title={showNative ? t("practice.session.hideZh") : t("practice.session.showZh")}
                  >
                    ZH
                  </button>
                </>
              )}
              {/* 分隔线 */}
              <div className="h-4 w-px bg-border" />
              {/* 操作区 */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 shrink-0",
                  question && bookmarkedIds.has(question.id)
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-muted-foreground hover:text-yellow-500",
                )}
                title={t("review.bookmarks.toggle")}
                onClick={handleToggleBookmark}
              >
                <Star className={cn("h-4 w-4", question && bookmarkedIds.has(question.id) && "fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-orange-500"
                title={t("practice.session.reportTitle")}
                onClick={() => setReportOpen(true)}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
              </Button>
            </div>
          }
        />

        <OptionList
          options={question.options}
          answer={currentAnswer}
          onSelect={handleSelect}
          disabled={submitting}
          pendingSelected={selectedKey}
          submittingKey={submittingKey}
          audioOnly={question.type === "listening" && question.options.every((o) => !o.text?.trim())}
          horizontal={!!question.has_image}
          saveContext={saveContext}
          optionTranslations={(currentAnswer || openBook) ? explanation?.option_translations : undefined}
          showEn={(currentAnswer || openBook) ? showEn : false}
          showNative={(currentAnswer || openBook) ? showNative : false}
          locale={locale}
        />

        {/* Confirm button: visible when option selected but not yet submitted */}
        {selectedKey && !currentAnswer && (
          <div className="flex justify-center">
            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="min-w-[160px]"
            >
              {submitting ? t("common.actions.submitting") : t("practice.session.confirmAnswer")}
            </Button>
          </div>
        )}

        {savedIndicator && (
          <p className="text-xs text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-bottom-2 duration-300">{t("practice.session.answerCorrect")}</p>
        )}
        {wrongCollected && (
          <div className="wrong-answer-toast flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700 shadow-sm dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300">
            <span className="wrong-answer-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
              <BookmarkCheck className="h-4 w-4" />
            </span>
            <span className="font-medium">{t("practice.session.addedToWrongNote")}</span>
          </div>
        )}

        {/* 快捷导航：选项下方，桌面端显示 */}
        <div className="hidden lg:flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("practice.session.prev")}
          </Button>

          {openBook ? (
            <Button
              variant={question && reviewedIds.has(question.id) ? "default" : "outline"}
              size="sm"
              onClick={toggleReviewed}
              className={question && reviewedIds.has(question.id) ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
            >
              <BookCheck className="mr-1 h-4 w-4" />
              {t("practice.session.reviewed")}
            </Button>
          ) : allAnswered ? (
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={completing}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              {completing ? t("common.actions.submitting") : t("practice.session.completePractice")}
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={isLast}
          >
            {t("practice.session.next")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* 提示栏 */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground/60 flex-wrap">
          <span className="hidden lg:inline"><kbd className="rounded border border-border/50 px-1 py-0.5 font-mono text-[10px]">A</kbd>-<kbd className="rounded border border-border/50 px-1 py-0.5 font-mono text-[10px]">D</kbd> {t("practice.session.kbSelect")}</span>
          <span className="hidden lg:inline"><kbd className="rounded border border-border/50 px-1 py-0.5 font-mono text-[10px]">Enter</kbd> {openBook ? t("practice.session.reviewed") : t("practice.session.kbConfirm")}</span>
          <span className="hidden lg:inline"><kbd className="rounded border border-border/50 px-1 py-0.5 font-mono text-[10px]">←</kbd> <kbd className="rounded border border-border/50 px-1 py-0.5 font-mono text-[10px]">→</kbd> {t("practice.session.kbNavigate")}</span>
          <span>💡 {t("practice.wordCardHint")}</span>
        </div>

        {/* 听力原文 / 阅读逐句翻译 — 答题后展开 */}
        {currentAnswer && (question.type === "listening" || question.type === "reading") && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <TranscriptBlock
              question={question}
              explanation={explanation}
              showEn={showEn}
              showNative={showNative}
              onToggleNative={toggleNative}
              transcriptLabel={
                question.type === "listening"
                  ? t("practice.session.tabTranscript")
                  : t("practice.session.passageTranslation")
              }
              locale={locale}
              audioTimestamps={question.audio_timestamps}
              currentAudioTime={audioTime}
              onSentenceClick={(start, end) => audioPlayerRef.current?.playSegment(start, end)}
              saveContext={saveContext}
              questionId={question.id}
            />
          </div>
        )}

        {/* 移动端：解析面板 — 答题后展开 */}
        {currentAnswer && (
          <div className="shrink-0 animate-in fade-in slide-in-from-top-2 duration-300 lg:hidden">
            <ExplanationPanel
              explanation={explanation}
              questionId={question.id}
              defaultOpen={true}
              selectedAnswer={currentAnswer?.selected}
              correctAnswer={currentAnswer?.correct_answer}
              loading={explanationLoading}
              error={explanationError}
              onRetry={() => fetchExplanation(question.id)}
              onForceRefresh={() => fetchExplanation(question.id, true)}
              onOpen={() => !explanation && !explanationLoading && fetchExplanation(question.id)}
              saveContext={saveContext}
            />
          </div>
        )}

        {/* 底部导航：解析/翻译之后再放一组，桌面端显示 */}
        {currentAnswer && (question.type === "listening" || question.type === "reading") && (
          <div className="hidden lg:block">
            <Separator />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t("practice.session.prev")}
              </Button>

              {openBook ? (
                <Button
                  variant={question && reviewedIds.has(question.id) ? "default" : "outline"}
                  size="sm"
                  onClick={toggleReviewed}
                  className={question && reviewedIds.has(question.id) ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                >
                  <BookCheck className="mr-1 h-4 w-4" />
                  {t("practice.session.reviewed")}
                </Button>
              ) : allAnswered ? (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  disabled={completing}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  {completing ? t("common.actions.submitting") : t("practice.session.completePractice")}
                </Button>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={isLast}
              >
                {t("practice.session.next")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 右侧：解析面板 (桌面) */}
      <div className="hidden lg:block overflow-y-auto scrollbar-on-hover rounded-xl bg-card border shadow-sm p-3">
        <div className="space-y-3">
          {currentAnswer ? (
            <ExplanationPanel
              explanation={explanation}
              questionId={question.id}
              defaultOpen={true}
              selectedAnswer={currentAnswer?.selected}
              correctAnswer={currentAnswer?.correct_answer}
              loading={explanationLoading}
              error={explanationError}
              onRetry={() => fetchExplanation(question.id)}
              onForceRefresh={() => fetchExplanation(question.id, true)}
              onOpen={() => !explanation && !explanationLoading && fetchExplanation(question.id)}
              saveContext={saveContext}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              <Lightbulb className="mb-2 h-8 w-8 text-muted-foreground/30" />
              <p>{t("practice.session.viewAfterAnswer")}</p>
            </div>
          )}
        </div>
      </div>

    </div>

      {/* Mobile bottom navigation bar — portal to body to avoid transform breaking fixed on iOS */}
      {typeof document !== "undefined" && createPortal(
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("practice.session.prev")}
          </Button>

          {openBook ? (
            <Button
              variant={question && reviewedIds.has(question.id) ? "default" : "ghost"}
              size="sm"
              onClick={toggleReviewed}
              className={question && reviewedIds.has(question.id) ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
            >
              <BookCheck className="mr-1 h-4 w-4" />
              {t("practice.session.reviewed")}
            </Button>
          ) : allAnswered ? (
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={completing}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              {completing ? t("common.actions.submitting") : t("practice.session.completePractice")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={isLast}
            >
              {t("practice.session.next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>,
      document.body)}

      {/* Mobile floating navigator (question grid) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed right-4 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 h-10 w-10 rounded-full shadow-lg lg:hidden"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <div className="p-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            <QuestionNavigator
              total={totalQuestions}
              currentIndex={currentIndex}
              answers={answers}
              questionIds={drillMode ? drillQuestionIds : questions.map((q) => q.id)}
              onNavigate={handleGoToQuestion}
              questions={drillMode ? undefined : questions.map((q) => ({ type: q.type, level: q.level || ((q.type === "listening" || q.type === "reading") ? getTcfLevelByQuestionNumber(q.question_number) : null) }))}
              drillAnsweredIds={drillMode ? drillAnsweredIds : undefined}
              onNavPageChange={drillMode ? handleNavPageChange : undefined}
              reviewedIds={openBook ? reviewedIds : undefined}
            />
          </div>
        </SheetContent>
      </Sheet>

      {question && (
        <ReportDialog
          questionId={question.id}
          open={reportOpen}
          onOpenChange={setReportOpen}
        />
      )}

      <QuotaExceededModal
        open={quotaModal.open}
        onOpenChange={(open) => setQuotaModal((prev) => ({ ...prev, open }))}
        type={quotaModal.type}
        used={quotaModal.used}
        limit={quotaModal.limit}
      />
    </>
  );
}
