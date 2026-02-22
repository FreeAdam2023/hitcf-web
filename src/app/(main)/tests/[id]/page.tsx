"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, FileText, Headphones, BookOpenText, MessageCircle, PenLine, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { getTestSet, getTestSetQuestions } from "@/lib/api/test-sets";
import { createAttempt } from "@/lib/api/attempts";
import type { TestSetDetail, QuestionBrief } from "@/lib/api/types";

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

export default function TestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [test, setTest] = useState<TestSetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [startingExam, setStartingExam] = useState(false);
  const [topics, setTopics] = useState<QuestionBrief[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

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

  // Speaking type: show topics with ChatGPT buttons
  if (test.type === "speaking") {
    const isTache2 = test.code.includes("tache2");
    return (
      <div className="mx-auto max-w-2xl space-y-4">
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

        {topicsLoading ? (
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

  // Writing type: show tasks with reference documents and ChatGPT buttons
  if (test.type === "writing") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
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
                  每组包含 3 个写作任务（短消息、博客文章、议论文）。点击按钮使用 ChatGPT 练习写作并获取批改反馈。
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {topicsLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
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
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={buildWritingChatGPTUrl(topic, taskNum)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        用 ChatGPT 练习写作
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Listening / Reading type: original behavior
  const TypeIcon = test.type === "listening" ? Headphones : BookOpenText;

  return (
    <div className="mx-auto max-w-2xl">
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

          <div className="mt-6 flex gap-3">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
