"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, Headphones, BookOpenText, MessageCircle, PenLine, ExternalLink, Lock, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAuthStore } from "@/stores/auth-store";
import { getTestSet, getTestSetQuestions } from "@/lib/api/test-sets";
import { createAttempt } from "@/lib/api/attempts";
import { gradeWriting } from "@/lib/api/writing";
import type { TestSetDetail, QuestionBrief, WritingFeedback } from "@/lib/api/types";

function buildChatGPTUrl(topic: QuestionBrief, isTache2: boolean): string {
  const prompt = isTache2
    ? `Tu es mon partenaire de pratique pour le TCF Canada Expression Orale Tâche 2. Voici le sujet :\n\n"${topic.question_text}"\n\nJoue le rôle décrit dans le sujet. Je vais te poser des questions comme dans l'examen. Réponds naturellement en français, puis après 5-6 échanges, donne-moi un feedback sur ma performance (grammaire, vocabulaire, fluidité). Parle uniquement en français.`
    : `Tu es mon examinateur pour le TCF Canada Expression Orale Tâche 3. Voici le sujet :\n\n"${topic.question_text}"\n\nJe vais donner mon opinion sur ce sujet pendant environ 2-3 minutes. Écoute-moi, puis donne-moi un feedback détaillé sur : la structure de mon argumentation, la richesse du vocabulaire, la grammaire, et des suggestions d'amélioration. Parle uniquement en français.`;

  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "批改失败，请稍后重试";
      setGradingErrors((prev) => ({ ...prev, [topic.id]: message }));
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
                  {result && <WritingFeedbackPanel feedback={result} />}
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
  const canAccessPaid = useAuthStore((s) => s.canAccessPaid);
  const [test, setTest] = useState<TestSetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [startingExam, setStartingExam] = useState(false);
  const [topics, setTopics] = useState<QuestionBrief[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const locked = test ? !test.is_free && !canAccessPaid() : false;

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
      })
      .catch(() => setTest(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleStart = async () => {
    if (!test) return;
    setStarting(true);
    try {
      const attempt = await createAttempt({
        test_set_id: test.id,
        mode: "practice",
      });
      router.push(`/practice/${attempt.id}`);
    } catch (err) {
      console.error("Failed to create attempt", err);
      setStarting(false);
    }
  };

  const handleStartExam = async () => {
    if (!test) return;
    setStartingExam(true);
    try {
      const attempt = await createAttempt({
        test_set_id: test.id,
        mode: "exam",
      });
      router.push(`/exam/${attempt.id}`);
    } catch (err) {
      console.error("Failed to create exam attempt", err);
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
    <Link
      href="/tests"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      返回题库
    </Link>
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
                    ? "在角色扮演场景中提问和互动。点击话题下方的按钮，使用 ChatGPT 进行对话练习。"
                    : "就某个话题表达你的观点并论证。点击话题下方的按钮，使用 ChatGPT 进行表达练习。"}
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
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={buildChatGPTUrl(topic, isTache2)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          用 ChatGPT 练习
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

          {/* Exam tips */}
          <div className="mt-6 rounded-md bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">考前须知</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>考试模式：计时进行，不可暂停；不显示即时答案；可标记题目稍后回顾</li>
              <li>提交后显示成绩报告和 TCF 预估等级</li>
              <li>练习模式：无时间限制，每题作答后立即显示正确答案和解析</li>
            </ul>
          </div>

          <div className="mt-4 flex gap-3">
            {locked ? (
              <PaywallButton />
            ) : (
              <>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleStart}
                  disabled={starting || startingExam}
                >
                  {starting ? "正在开始..." : "开始练习"}
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  variant="outline"
                  onClick={handleStartExam}
                  disabled={starting || startingExam}
                >
                  {startingExam ? "正在开始..." : "开始考试"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
