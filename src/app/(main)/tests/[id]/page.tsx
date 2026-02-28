"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Clock, FileText, Headphones, BookOpenText, MessageCircle, PenLine, ExternalLink, Lock, Copy, Check, RotateCcw, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { useAuthStore } from "@/stores/auth-store";
import { getTestSet, getTestSetQuestions } from "@/lib/api/test-sets";
import { createAttempt, getActiveAttempt } from "@/lib/api/attempts";
import type { ActiveAttemptResponse } from "@/lib/api/types";
import type { TestSetDetail, QuestionBrief } from "@/lib/api/types";

function buildSpeakingPrompt(topic: QuestionBrief, isTache2: boolean): string {
  return isTache2
    ? `Tu es mon partenaire de pratique pour le TCF Canada Expression Orale Tâche 2. Voici le sujet :\n\n"${topic.question_text}"\n\nJoue le rôle décrit dans le sujet. Je vais te poser des questions comme dans l'examen. Réponds naturellement en français, puis après 5-6 échanges, donne-moi un feedback sur ma performance (grammaire, vocabulaire, fluidité). Parle uniquement en français.`
    : `Tu es mon examinateur pour le TCF Canada Expression Orale Tâche 3. Voici le sujet :\n\n"${topic.question_text}"\n\nJe vais donner mon opinion sur ce sujet pendant environ 2-3 minutes. Écoute-moi, puis donne-moi un feedback détaillé sur : la structure de mon argumentation, la richesse du vocabulaire, la grammaire, et des suggestions d'amélioration. Parle uniquement en français.`;
}

function buildChatGPTUrl(topic: QuestionBrief, isTache2: boolean): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(buildSpeakingPrompt(topic, isTache2))}`;
}

function buildGrokUrl(topic: QuestionBrief, isTache2: boolean): string {
  return `https://grok.com/?q=${encodeURIComponent(buildSpeakingPrompt(topic, isTache2))}`;
}

function buildMistralUrl(): string {
  return "https://chat.mistral.ai/chat";
}

function buildGeminiUrl(): string {
  return "https://gemini.google.com/app";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildWritingChatGPTUrl(topic: QuestionBrief, taskNum: number): string {
  const passageText = topic.passage ? `\n\nDocuments de référence :\n${topic.passage}` : "";
  const prompt = `Tu es mon correcteur pour le TCF Canada Expression Écrite Tâche ${taskNum}. Voici le sujet :\n\n"${topic.question_text}"${passageText}\n\nJe vais écrire mon texte ci-dessous. Corrige-le et donne-moi un feedback détaillé sur : la grammaire, l'orthographe, le vocabulaire, la cohérence, la structure. Donne une note estimée (A1-C2) et des suggestions d'amélioration. Réponds en français.`;

  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}


function SpeakingTopicList({ topics, isTache2 }: { topics: QuestionBrief[]; isTache2: boolean }) {
  const t = useTranslations();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(async (topic: QuestionBrief) => {
    const prompt = buildSpeakingPrompt(topic, isTache2);
    await navigator.clipboard.writeText(prompt);
    setCopiedId(topic.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, [isTache2]);

  return (
    <div className="space-y-3">
      {topics.map((topic, idx) => (
        <Card key={topic.id}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {idx + 1}
              </span>
              <div className="flex-1 space-y-3">
                <p className="text-sm leading-relaxed">
                  {topic.question_text}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleCopy(topic)}
                  >
                    {copiedId === topic.id ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        {t("common.actions.copied")}
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        {t("common.actions.copyPrompt")}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={buildChatGPTUrl(topic, isTache2)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      ChatGPT
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={buildGrokUrl(topic, isTache2)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Grok
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={buildMistralUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Mistral
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={buildGeminiUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Gemini
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WritingTestView({
  test,
  locked,
  topicsLoading,
  topics,
  backLink,
}: {
  test: TestSetDetail;
  locked: boolean;
  topicsLoading: boolean;
  topics: QuestionBrief[];
  backLink: React.ReactNode;
}) {
  const t = useTranslations();
  const router = useRouter();

  const [starting, setStarting] = useState(false);
  const [startingExam, setStartingExam] = useState(false);
  const [activePractice, setActivePractice] = useState<{ id: string } | null>(null);
  const [activeExam, setActiveExam] = useState<{ id: string } | null>(null);

  const taskLabels: Record<number, string> = {
    1: t("testDetail.writingTaskNames.0"),
    2: t("testDetail.writingTaskNames.1"),
    3: t("testDetail.writingTaskNames.2"),
  };

  // Check for active writing attempts on mount
  useEffect(() => {
    if (locked) return;
    import("@/lib/api/writing-attempts").then(({ getActiveWritingAttempt }) => {
      getActiveWritingAttempt(test.id, "practice").then((a) => setActivePractice(a)).catch(() => {});
      getActiveWritingAttempt(test.id, "exam").then((a) => setActiveExam(a)).catch(() => {});
    });
  }, [test.id, locked]);

  const handleStartPractice = async (forceNew = false) => {
    setStarting(true);
    try {
      const { createWritingAttempt } = await import("@/lib/api/writing-attempts");
      const attempt = await createWritingAttempt(
        { test_set_id: test.id, mode: "practice" },
        forceNew ? { forceNew: true } : undefined,
      );
      router.push(`/writing-practice/${attempt.id}`);
    } catch {
      toast.error(t("common.errors.createPracticeFailed"));
      setStarting(false);
    }
  };

  const handleStartExam = async (forceNew = false) => {
    setStartingExam(true);
    try {
      const { createWritingAttempt } = await import("@/lib/api/writing-attempts");
      const attempt = await createWritingAttempt(
        { test_set_id: test.id, mode: "exam" },
        forceNew ? { forceNew: true } : undefined,
      );
      router.push(`/writing-exam/${attempt.id}`);
    } catch {
      toast.error(t("common.errors.createExamFailed"));
      setStartingExam(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {backLink}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <PenLine className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <CardTitle className="text-xl">{test.name}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{t("testDetail.writingBadge")}</Badge>
                {test.is_free && <Badge variant="secondary">{t("common.status.free")}</Badge>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("testDetail.writingDescription")}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {locked ? (
        <Card>
          <CardContent className="pt-6">
            <PaywallButton />
          </CardContent>
        </Card>
      ) : topicsLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Mode description */}
          <div className="rounded-md bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground space-y-3">
            <div className="space-y-1">
              <p className="font-medium text-foreground text-sm">{t("writingExam.modeDialog.examLabel")}</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>{t("writingExam.overview.examBullet1")}</li>
                <li>{t("writingExam.overview.examBullet2")}</li>
                <li>{t("writingExam.overview.examBullet3")}</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground text-sm">{t("writingExam.modeDialog.practiceLabel")}</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>{t("writingExam.overview.practiceBullet1")}</li>
                <li>{t("writingExam.overview.practiceBullet2")}</li>
                <li>{t("writingExam.overview.practiceBullet3")}</li>
              </ul>
            </div>
          </div>

          {/* Active attempt resume cards */}
          {activePractice && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm font-medium">{t("writingExam.modeDialog.incompletePractice")}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => router.push(`/writing-practice/${activePractice.id}`)}
                  disabled={starting || startingExam}
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  {t("testCard.continuePractice")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleStartPractice(true)}
                  disabled={starting || startingExam}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  {t("testDetail.restart")}
                </Button>
              </div>
            </div>
          )}

          {activeExam && (
            <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
              <p className="text-sm font-medium">{t("writingExam.modeDialog.incompleteExam")}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/writing-exam/${activeExam.id}`)}
                  disabled={starting || startingExam}
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  {t("testCard.continueExam")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleStartExam(true)}
                  disabled={starting || startingExam}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  {t("testDetail.restart")}
                </Button>
              </div>
            </div>
          )}

          {/* Start buttons */}
          <div className="flex gap-3">
            {!activePractice && (
              <Button
                className="flex-1"
                size="lg"
                onClick={() => handleStartPractice(false)}
                disabled={starting || startingExam}
              >
                {starting ? t("common.actions.starting") : t("testCard.startPractice")}
              </Button>
            )}
            {!activeExam && (
              <Button
                className="flex-1"
                size="lg"
                variant="outline"
                onClick={() => handleStartExam(false)}
                disabled={starting || startingExam}
              >
                {startingExam ? t("common.actions.starting") : t("testCard.startExam")}
              </Button>
            )}
          </div>

          {/* Task preview (read-only) */}
          <div className="space-y-3">
            {topics.map((topic, idx) => {
              const taskNum = idx + 1;
              return (
                <Card key={topic.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {taskNum}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {taskLabels[taskNum] || `Tache ${taskNum}`}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {topic.question_text}
                    </p>
                    {topic.passage && (
                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                          {topic.passage}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function PaywallButton() {
  const t = useTranslations();
  const router = useRouter();
  return (
    <Button className="w-full" size="lg" onClick={() => router.push("/pricing")}>
      <Lock className="mr-2 h-4 w-4" />
      {t("testCard.subscribeUnlock")}
    </Button>
  );
}

export default function TestDetailPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const canAccessPaid = useAuthStore((s) => {
    const status = s.user?.subscription?.status;
    return status === "active" || status === "trialing" || s.user?.role === "admin";
  });
  const [test, setTest] = useState<TestSetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [startingExam, setStartingExam] = useState(false);
  const [topics, setTopics] = useState<QuestionBrief[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [activePractice, setActivePractice] = useState<ActiveAttemptResponse | null>(null);
  const [activeExam, setActiveExam] = useState<ActiveAttemptResponse | null>(null);

  const locked = test ? !test.is_free && !canAccessPaid : false;

  useEffect(() => {
    getTestSet(params.id)
      .then((data) => {
        setTest(data);
        // Load topics for speaking/writing tests
        if (data.type === "speaking" || data.type === "writing") {
          setTopicsLoading(true);
          getTestSetQuestions(data.id, "practice")
            .then(setTopics)
            .catch(() => setTopics([]))
            .finally(() => setTopicsLoading(false));
        }
        // Check for active attempts (listening/reading only)
        if (data.type === "listening" || data.type === "reading") {
          getActiveAttempt(data.id, "practice").then(setActivePractice).catch(() => {});
          getActiveAttempt(data.id, "exam").then(setActiveExam).catch(() => {});
        }
      })
      .catch(() => setTest(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleStart = async (forceNew = false) => {
    if (!test) return;
    setStarting(true);
    try {
      const attempt = await createAttempt(
        { test_set_id: test.id, mode: "practice" },
        { forceNew },
      );
      router.push(`/practice/${attempt.id}`);
    } catch (err) {
      console.error("Failed to create attempt", err);
      toast.error(t("common.errors.createPracticeFailed"));
      setStarting(false);
    }
  };

  const handleStartExam = async (forceNew = false) => {
    if (!test) return;
    setStartingExam(true);
    try {
      const attempt = await createAttempt(
        { test_set_id: test.id, mode: "exam" },
        { forceNew },
      );
      router.push(`/exam/${attempt.id}`);
    } catch (err) {
      console.error("Failed to create exam attempt", err);
      toast.error(t("common.errors.createExamFailed"));
      setStartingExam(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!test) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t("testDetail.notFound")}
      </div>
    );
  }

  const backLink = (
    <Breadcrumb items={[{ label: t("testDetail.breadcrumbTests"), href: `/tests?tab=${test.type}` }, { label: test.name }]} />
  );

  // Speaking type: show topics with ChatGPT buttons
  if (test.type === "speaking") {
    const isTache2 = test.code.includes("tache2");
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {backLink}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <CardTitle className="text-xl">{test.name}</CardTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{t("testDetail.speakingBadge")}</Badge>
                  <Badge variant="outline">
                    {isTache2 ? t("testDetail.speakingTache2") : t("testDetail.speakingTache3")}
                  </Badge>
                  {test.is_free && <Badge variant="secondary">{t("common.status.free")}</Badge>}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {isTache2
                    ? t("testDetail.speakingDescTache2")
                    : t("testDetail.speakingDescTache3")}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {locked ? (
          <Card>
            <CardContent className="pt-6">
              <PaywallButton />
            </CardContent>
          </Card>
        ) : topicsLoading ? (
          <LoadingSpinner />
        ) : (
          <SpeakingTopicList topics={topics} isTache2={isTache2} />
        )}
      </div>
    );
  }

  // Writing type: show tasks with textarea + grading
  if (test.type === "writing") {
    return (
      <WritingTestView
        test={test}
        locked={locked}
        topicsLoading={topicsLoading}
        topics={topics}
        backLink={backLink}
      />
    );
  }

  // Listening / Reading type: original behavior
  const TypeIcon = test.type === "listening" ? Headphones : BookOpenText;

  return (
    <div className="mx-auto max-w-2xl">
      {backLink}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <TypeIcon className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <CardTitle className="text-xl">{test.name}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {test.type === "listening" ? t("common.types.listening") : t("common.types.reading")}
                </Badge>
                {test.is_free && <Badge variant="secondary">{t("common.status.free")}</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{t("testDetail.questionCount")}</span>
            </div>
            <div className="font-medium">{t("common.questions", { count: test.question_count })}</div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t("testDetail.timeLimit")}</span>
            </div>
            <div className="font-medium">{t("common.time.minutes", { minutes: test.time_limit_minutes })}</div>
          </div>

          {/* Exam tips — type-specific */}
          <div className="mt-6 rounded-md bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground space-y-3">
            <div className="space-y-1">
              <p className="font-medium text-foreground text-sm">
                {test.type === "listening" ? t("testDetail.listeningExam") : t("testDetail.readingExam")}
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                {test.type === "listening" ? (
                  <>
                    <li>{t("testDetail.listeningExamBullets.audioOnce")}</li>
                    <li>{t("testDetail.listeningExamBullets.autoNext")}</li>
                    <li>{t("testDetail.listeningExamBullets.timedCompletion", { minutes: test.time_limit_minutes, count: test.question_count })}</li>
                  </>
                ) : (
                  <>
                    <li>{t("testDetail.readingExamBullets.freeNav")}</li>
                    <li>{t("testDetail.readingExamBullets.timedCompletion", { minutes: test.time_limit_minutes, count: test.question_count })}</li>
                  </>
                )}
                <li>{test.type === "listening" ? t("testDetail.listeningExamBullets.showScore") : t("testDetail.readingExamBullets.showScore")}</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground text-sm">{t("testCard.practiceMode")}</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>{t("testDetail.practiceBullets.replayAudio")}</li>
                <li>{t("testDetail.practiceBullets.showAnswer")}</li>
                <li>{t("testDetail.practiceBullets.wrongNote")}</li>
              </ul>
            </div>
          </div>

          {/* Suggestion card */}
          <div className="mt-3 rounded-md border border-blue-200 bg-blue-50/50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
            {t("testDetail.suggestion")}
          </div>

          <div className="mt-4 space-y-3">
            {locked ? (
              <PaywallButton />
            ) : (
              <>
                {/* Active practice resume card */}
                {activePractice && activePractice.answered_count > 0 && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-sm font-medium">
                      {t("testDetail.practiceProgress", { answered: activePractice.answered_count, total: activePractice.total })}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStart(false)}
                        disabled={starting || startingExam}
                      >
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        {starting ? t("common.actions.starting") : t("testCard.continuePractice")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStart(true)}
                        disabled={starting || startingExam}
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        {t("testDetail.restart")}
                      </Button>
                    </div>
                  </div>
                )}
                {/* Active exam resume card */}
                {activeExam && activeExam.answered_count > 0 && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
                    <p className="text-sm font-medium">
                      {t("testDetail.examProgress", { answered: activeExam.answered_count, total: activeExam.total })}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExam(false)}
                        disabled={starting || startingExam}
                      >
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        {startingExam ? t("common.actions.starting") : t("testCard.continueExam")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartExam(true)}
                        disabled={starting || startingExam}
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        {t("testDetail.restart")}
                      </Button>
                    </div>
                  </div>
                )}
                {/* Default buttons */}
                <div className="flex gap-3">
                  {!activePractice || activePractice.answered_count === 0 ? (
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={() => handleStart(false)}
                      disabled={starting || startingExam}
                    >
                      {starting ? t("common.actions.starting") : t("testCard.startPractice")}
                    </Button>
                  ) : null}
                  {!activeExam || activeExam.answered_count === 0 ? (
                    <Button
                      className="flex-1"
                      size="lg"
                      variant="outline"
                      onClick={() => handleStartExam(false)}
                      disabled={starting || startingExam}
                    >
                      {startingExam ? t("common.actions.starting") : t("testCard.startExam")}
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
