"use client";

import { useState, useCallback } from "react";
import { Copy, Check, ExternalLink, Lightbulb, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TACHE1_PROMPT = `Tu es l'examinateur du TCF Canada pour la Tâche 1 (Entretien dirigé). Simule un entretien de 2 minutes.

Règles :
- Pose-moi des questions simples et variées sur : mon identité, mon parcours (études/travail), mes centres d'intérêt, ma famille, mes projets au Canada.
- Commence par "Bonjour, installez-vous. Nous allons commencer l'entretien."
- Pose UNE question à la fois, attends ma réponse, puis enchaîne naturellement.
- Après 6-8 échanges, termine l'entretien et donne-moi un feedback détaillé sur : la fluidité, la grammaire, le vocabulaire, la prononciation estimée.
- Parle uniquement en français.`;

const THEMES = [
  { label: "身份", fr: "Identité", examples: "Votre nom, nationalité, âge, ville" },
  { label: "学业", fr: "Études", examples: "Votre parcours, diplômes, matières" },
  { label: "工作", fr: "Travail", examples: "Votre métier, expérience, entreprise" },
  { label: "爱好", fr: "Loisirs", examples: "Sports, musique, lecture, voyages" },
  { label: "家庭", fr: "Famille", examples: "Parents, enfants, frères et sœurs" },
  { label: "日常", fr: "Quotidien", examples: "Routine, repas, transport, logement" },
  { label: "移民", fr: "Projet Canada", examples: "Pourquoi le Canada, objectifs, plans" },
];

export function SpeakingTache1Guide() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(TACHE1_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Card className="border-l-4 border-l-amber-500 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <MessageCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Tâche 1 · 自我介绍面试</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Entretien dirigé — 考官围绕日常话题即兴提问，约 2 分钟
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Theme chips */}
          <div>
            <p className="mb-2.5 text-sm font-medium">常见提问主题</p>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <div
                  key={t.label}
                  className="group relative rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-700 dark:hover:bg-amber-950/30"
                >
                  <span className="font-medium">{t.label}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">{t.fr}</span>
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block">
                    {t.examples}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong className="text-foreground">没有固定题目</strong> — 考官即兴提问，不可预测具体问题</p>
                <p>准备策略：每个主题准备 2-3 句自然回答，不要背诵，保持对话感</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleCopy}>
              {copied ? (
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
            <Button variant="outline" asChild>
              <a
                href={`https://chatgpt.com/?q=${encodeURIComponent(TACHE1_PROMPT)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                ChatGPT 模拟
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`https://grok.com/?q=${encodeURIComponent(TACHE1_PROMPT)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Grok 模拟
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* What to expect */}
      <Card>
        <CardContent className="pt-5">
          <p className="mb-3 text-sm font-medium">考试流程</p>
          <div className="space-y-3">
            {[
              { step: "1", text: "考官说「Bonjour, installez-vous」，开始计时" },
              { step: "2", text: "简短自我介绍（姓名、国籍、职业）" },
              { step: "3", text: "考官就 3-4 个主题各问 1-2 个问题" },
              { step: "4", text: "自然回答，每个回答 2-3 句即可，共约 2 分钟" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {item.step}
                </span>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
