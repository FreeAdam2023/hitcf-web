"use client";

import { useState, useCallback } from "react";
import { Copy, Check, ExternalLink, Lightbulb, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TACHE1_PROMPT = `Tu es l'examinateur du TCF Canada pour la Tâche 1 (Entretien dirigé). Simule un entretien de 2 minutes.

Règles :
- Pose-moi des questions simples et variées sur : mon identité, mon parcours (études/travail), mes centres d'intérêt, ma famille, mes projets au Canada.
- Commence par "Bonjour, installez-vous. Nous allons commencer l'entretien."
- Pose UNE question à la fois, attends ma réponse, puis enchaîne naturellement.
- Après 6-8 échanges, termine l'entretien et donne-moi un feedback détaillé sur : la fluidité, la grammaire, le vocabulaire, la prononciation estimée.
- Parle uniquement en français.`;

const THEME_FR = [
  { fr: "Identité", examples: "Votre nom, nationalité, âge, ville" },
  { fr: "Études", examples: "Votre parcours, diplômes, matières" },
  { fr: "Travail", examples: "Votre métier, expérience, entreprise" },
  { fr: "Loisirs", examples: "Sports, musique, lecture, voyages" },
  { fr: "Famille", examples: "Parents, enfants, frères et sœurs" },
  { fr: "Quotidien", examples: "Routine, repas, transport, logement" },
  { fr: "Projet Canada", examples: "Pourquoi le Canada, objectifs, plans" },
];

export function SpeakingTache1Guide() {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(TACHE1_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const topicLabels: string[] = [
    t("speakingGuide.topics.0"),
    t("speakingGuide.topics.1"),
    t("speakingGuide.topics.2"),
    t("speakingGuide.topics.3"),
    t("speakingGuide.topics.4"),
    t("speakingGuide.topics.5"),
    t("speakingGuide.topics.6"),
  ];

  const flowSteps: string[] = [
    t("speakingGuide.flowSteps.0"),
    t("speakingGuide.flowSteps.1"),
    t("speakingGuide.flowSteps.2"),
    t("speakingGuide.flowSteps.3"),
  ];

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Card className="border-l-4 border-l-amber-500 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <MessageCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{t("speakingGuide.title")}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("speakingGuide.subtitle")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Theme chips */}
          <div>
            <p className="mb-2.5 text-sm font-medium">{t("speakingGuide.commonTopics")}</p>
            <div className="flex flex-wrap gap-2">
              {THEME_FR.map((theme, idx) => (
                <div
                  key={theme.fr}
                  className="group relative rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-700 dark:hover:bg-amber-950/30"
                >
                  <span className="font-medium">{topicLabels[idx]}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">{theme.fr}</span>
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block">
                    {theme.examples}
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
                <p><strong className="text-foreground">{t("speakingGuide.noFixedTopics")}</strong> — {t("speakingGuide.noFixedTopicsDesc")}</p>
                <p>{t("speakingGuide.prepStrategy")}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleCopy}>
              {copied ? (
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
            <Button variant="outline" asChild>
              <a
                href={`https://chatgpt.com/?q=${encodeURIComponent(TACHE1_PROMPT)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                {t("speakingGuide.chatgptSimulation")}
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`https://grok.com/?q=${encodeURIComponent(TACHE1_PROMPT)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                {t("speakingGuide.grokSimulation")}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* What to expect */}
      <Card>
        <CardContent className="pt-5">
          <p className="mb-3 text-sm font-medium">{t("speakingGuide.examFlow")}</p>
          <div className="space-y-3">
            {flowSteps.map((text, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {idx + 1}
                </span>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
