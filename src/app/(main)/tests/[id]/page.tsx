"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, FileText, Headphones, BookOpenText, MessageCircle, PenLine, ExternalLink, Lock, Loader2, CheckCircle2, AlertCircle, ArrowRight, Copy, Check, RotateCcw, Play } from "lucide-react";
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
import { gradeWriting, getWritingSubmissions } from "@/lib/api/writing";
import type { TestSetDetail, QuestionBrief, WritingFeedback } from "@/lib/api/types";

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

function buildWritingChatGPTUrl(topic: QuestionBrief, taskNum: number): string {
  const passageText = topic.passage ? `\n\nDocuments de référence :\n${topic.passage}` : "";
  const prompt = `Tu es mon correcteur pour le TCF Canada Expression Écrite Tâche ${taskNum}. Voici le sujet :\n\n"${topic.question_text}"${passageText}\n\nJe vais écrire mon texte ci-dessous. Corrige-le et donne-moi un feedback détaillé sur : la grammaire, l'orthographe, le vocabulaire, la cohérence, la structure. Donne une note estimée (A1-C2) et des suggestions d'amélioration. Réponds en français.`;

  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}

const TASK_LABELS: Record<number, string> = {
  1: "Tâche 1 · 短消息 (60-120 词)",
  2: "Tâche 2 · 博客文章 (120-160 词)",
  3: "Tâche 3 · 议论文 (200-300 词)",
};

const TASK_WORD_RANGES: Record<number, [number, number]> = {
  1: [60, 120],
  2: [120, 160],
  3: [200, 300],
};

const CRITERION_LABELS: Record<string, { name: string; desc: string }> = {
  adequation: { name: "Adéquation", desc: "任务完成度" },
  coherence: { name: "Cohérence", desc: "连贯性" },
  vocabulaire: { name: "Vocabulaire", desc: "词汇" },
  grammaire: { name: "Grammaire", desc: "语法" },
};

function SpeakingTopicList({ topics, isTache2 }: { topics: QuestionBrief[]; isTache2: boolean }) {
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
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        复制 Prompt
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

function scoreColor(score: number): string {
  if (score >= 4) return "bg-green-500";
  if (score >= 3) return "bg-yellow-500";
  if (score >= 2) return "bg-orange-500";
  return "bg-red-500";
}

function WritingFeedbackPanel({ feedback }: { feedback: WritingFeedback }) {
  const criteria = ["adequation", "coherence", "vocabulaire", "grammaire"] as const;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Total score + level */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold">{feedback.total_score}</span>
          <span className="text-sm text-muted-foreground"> / 20</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">NCLC {feedback.estimated_nclc}</Badge>
          <Badge variant="outline">{feedback.estimated_level}</Badge>
        </div>
      </div>

      {/* 4 criteria scores */}
      <div className="grid gap-3">
        {criteria.map((key) => {
          const c = feedback[key];
          const label = CRITERION_LABELS[key];
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {label.name}
                  <span className="ml-1 text-xs text-muted-foreground">({label.desc})</span>
                </span>
                <span className="text-sm font-semibold">{c.score}/5</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all ${scoreColor(c.score)}`}
                  style={{ width: `${(c.score / 5) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{c.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Overall comment */}
      <Separator />
      <div>
        <p className="mb-1 text-sm font-medium">总评</p>
        <p className="text-sm text-muted-foreground">{feedback.overall_comment}</p>
      </div>

      {/* Corrections */}
      {feedback.corrections.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="mb-2 text-sm font-medium">语法修正</p>
            <div className="space-y-2">
              {feedback.corrections.map((c, i) => (
                <div key={i} className="rounded-md bg-muted/50 p-2.5 text-xs">
                  <div className="flex items-start gap-1.5">
                    <span className="line-through text-red-500">{c.original}</span>
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="font-medium text-green-600">{c.corrected}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{c.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Vocab suggestions */}
      {feedback.vocab_suggestions.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="mb-2 text-sm font-medium">词汇建议</p>
            <div className="space-y-2">
              {feedback.vocab_suggestions.map((v, i) => (
                <div key={i} className="rounded-md bg-muted/50 p-2.5 text-xs">
                  <div className="flex items-start gap-1.5">
                    <span className="text-muted-foreground">{v.original}</span>
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="font-medium text-blue-600">{v.suggestion}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{v.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
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
  const [essayTexts, setEssayTexts] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState<Record<string, boolean>>({});
  const [gradingResults, setGradingResults] = useState<Record<string, WritingFeedback>>({});
  const [gradingErrors, setGradingErrors] = useState<Record<string, string>>({});
  const [submittedTopics, setSubmittedTopics] = useState<Record<string, string>>({});
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load writing history on mount
  useEffect(() => {
    if (topics.length === 0) return;
    const controller = new AbortController();
    setHistoryLoading(true);

    Promise.allSettled(
      topics.map((topic) =>
        getWritingSubmissions(topic.id, { signal: controller.signal })
          .then((submissions) => {
            if (submissions.length > 0) {
              const latest = submissions[0];
              setGradingResults((prev) => ({ ...prev, [topic.id]: latest.feedback }));
              setEssayTexts((prev) => ({ ...prev, [topic.id]: latest.essay_text }));
              setSubmittedTopics((prev) => ({
                ...prev,
                [topic.id]: latest.created_at,
              }));
            }
          })
      ),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        toast.error("部分写作历史加载失败");
      }
      setHistoryLoading(false);
    });

    return () => controller.abort();
  }, [topics]);

  const handleEssayChange = useCallback((topicId: string, text: string) => {
    setEssayTexts((prev) => ({ ...prev, [topicId]: text }));
  }, []);

  const handleGrade = useCallback(async (topic: QuestionBrief, taskNum: number) => {
    const essay = essayTexts[topic.id]?.trim();
    if (!essay) return;

    setGrading((prev) => ({ ...prev, [topic.id]: true }));
    setGradingErrors((prev) => ({ ...prev, [topic.id]: "" }));

    try {
      const result = await gradeWriting(topic.id, taskNum, essay);
      setGradingResults((prev) => ({ ...prev, [topic.id]: result.feedback }));
      setSubmittedTopics((prev) => ({ ...prev, [topic.id]: result.created_at }));
      toast.success("批改完成！");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "批改失败，请稍后重试";
      setGradingErrors((prev) => ({ ...prev, [topic.id]: message }));
      toast.error(message);
    } finally {
      setGrading((prev) => ({ ...prev, [topic.id]: false }));
    }
  }, [essayTexts]);

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
                <Badge variant="outline">写作</Badge>
                {test.is_free && <Badge variant="secondary">免费</Badge>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                每组包含 3 个写作任务（短消息、博客文章、议论文）。在下方输入作文并提交 AI 批改，或使用 ChatGPT 练习。
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
        <div className="space-y-4">
          {historyLoading && (
            <p className="text-xs text-muted-foreground animate-pulse">加载写作历史...</p>
          )}
          {topics.map((topic, idx) => {
            const taskNum = idx + 1;
            const essay = essayTexts[topic.id] || "";
            const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
            const wordRange = TASK_WORD_RANGES[taskNum] || [60, 300];
            const isGrading = grading[topic.id] || false;
            const result = gradingResults[topic.id];
            const error = gradingErrors[topic.id];

            return (
              <Card key={topic.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {taskNum}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {TASK_LABELS[taskNum] || `Tâche ${taskNum}`}
                    </span>
                    {submittedTopics[topic.id] && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
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

                  {/* Essay textarea */}
                  <textarea
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 min-h-[120px] resize-y"
                    placeholder="在此输入你的法语作文..."
                    value={essay}
                    onChange={(e) => handleEssayChange(topic.id, e.target.value)}
                    disabled={isGrading}
                    rows={6}
                  />

                  {/* Word count hint */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      字数：
                      <span className={
                        wordCount > 0 && (wordCount < wordRange[0] || wordCount > wordRange[1])
                          ? "text-orange-500 font-medium"
                          : wordCount >= wordRange[0] && wordCount <= wordRange[1]
                          ? "text-green-600 font-medium"
                          : ""
                      }>
                        {wordCount}
                      </span>
                      {" "}/ {wordRange[0]}-{wordRange[1]} 词
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleGrade(topic, taskNum)}
                      disabled={isGrading || !essay.trim() || wordCount < 10}
                    >
                      {isGrading ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          批改中...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          提交批改
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={buildWritingChatGPTUrl(topic, taskNum)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        ChatGPT 练习
                      </a>
                    </Button>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Grading result */}
                  {result && (
                    <>
                      {submittedTopics[topic.id] && (
                        <p className="text-xs text-muted-foreground">
                          上次提交：{new Date(submittedTopics[topic.id]).toLocaleString("zh-CN")}
                        </p>
                      )}
                      <WritingFeedbackPanel feedback={result} />
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaywallButton() {
  const router = useRouter();
  return (
    <Button className="w-full" size="lg" onClick={() => router.push("/pricing")}>
      <Lock className="mr-2 h-4 w-4" />
      订阅解锁
    </Button>
  );
}

export default function TestDetailPage() {
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
      toast.error("创建练习失败，请重试");
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
      toast.error("创建考试失败，请重试");
      setStartingExam(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!test) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        题套不存在或已删除
      </div>
    );
  }

  const backLink = (
    <Breadcrumb items={[{ label: "题库", href: `/tests?tab=${test.type}` }, { label: test.name }]} />
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
                  <Badge variant="outline">口语</Badge>
                  <Badge variant="outline">
                    {isTache2 ? "Tâche 2 · 情景对话" : "Tâche 3 · 观点论述"}
                  </Badge>
                  {test.is_free && <Badge variant="secondary">免费</Badge>}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {isTache2
                    ? "在角色扮演场景中提问和互动。复制 Prompt 后粘贴到你喜欢的 AI 工具进行对话练习。"
                    : "就某个话题表达你的观点并论证。复制 Prompt 后粘贴到你喜欢的 AI 工具进行表达练习。"}
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
                  {test.type === "listening" ? "听力" : "阅读"}
                </Badge>
                {test.is_free && <Badge variant="secondary">免费</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>题目数量</span>
            </div>
            <div className="font-medium">{test.question_count} 题</div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>限时</span>
            </div>
            <div className="font-medium">{test.time_limit_minutes} 分钟</div>
          </div>

          {/* Exam tips — type-specific */}
          <div className="mt-6 rounded-md bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground space-y-3">
            <div className="space-y-1">
              <p className="font-medium text-foreground text-sm">
                {test.type === "listening" ? "听力考试模式" : "阅读考试模式"}
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                {test.type === "listening" ? (
                  <>
                    <li>听力音频仅播放一次，不可重听</li>
                    <li>选择答案后自动进入下一题，不可返回修改</li>
                    <li>全程计时，{test.time_limit_minutes} 分钟内完成 {test.question_count} 题</li>
                  </>
                ) : (
                  <>
                    <li>可自由切换题目，答案可修改</li>
                    <li>全程计时，{test.time_limit_minutes} 分钟内完成 {test.question_count} 题</li>
                  </>
                )}
                <li>提交后显示成绩报告和 TCF 预估等级</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground text-sm">练习模式</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>无时间限制，可反复听音频</li>
                <li>每题作答后立即显示正确答案和详细解析</li>
                <li>错题自动收入错题本</li>
              </ul>
            </div>
          </div>

          {/* Suggestion card */}
          <div className="mt-3 rounded-md border border-blue-200 bg-blue-50/50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
            建议：先用练习模式熟悉题型，再用考试模式模拟真实考试节奏。
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
                      上次练习进度：{activePractice.answered_count} / {activePractice.total} 题
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStart(false)}
                        disabled={starting || startingExam}
                      >
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        {starting ? "正在开始..." : "继续练习"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStart(true)}
                        disabled={starting || startingExam}
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        重新开始
                      </Button>
                    </div>
                  </div>
                )}
                {/* Active exam resume card */}
                {activeExam && activeExam.answered_count > 0 && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
                    <p className="text-sm font-medium">
                      上次考试进度：{activeExam.answered_count} / {activeExam.total} 题
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExam(false)}
                        disabled={starting || startingExam}
                      >
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        {startingExam ? "正在开始..." : "继续考试"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartExam(true)}
                        disabled={starting || startingExam}
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        重新开始
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
                      {starting ? "正在开始..." : "开始练习"}
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
                      {startingExam ? "正在开始..." : "开始考试"}
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
