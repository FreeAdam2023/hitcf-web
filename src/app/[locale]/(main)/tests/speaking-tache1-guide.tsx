"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Copy, Check, ExternalLink, FileText, Lightbulb, MessageCircle, Mic, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { startTache1Conversation } from "@/lib/api/speaking-conversation";
import { listSpeakingScripts } from "@/lib/api/speaking-scripts";

const TACHE1_PROMPT = `Tu es l'examinateur du TCF Canada pour la Tâche 1 (Entretien dirigé). Simule un entretien de 2 minutes.

Règles :
- Pose-moi des questions simples et variées sur : mon identité, mon parcours (études/travail), mes centres d'intérêt, ma famille, mes projets au Canada.
- Commence par "Bonjour, installez-vous. Nous allons commencer l'entretien."
- Pose UNE question à la fois, attends ma réponse, puis enchaîne naturellement.
- Après 6-8 échanges, termine l'entretien et donne-moi un feedback détaillé sur : la fluidité, la grammaire, le vocabulaire, la prononciation estimée.
- Parle uniquement en français.`;

const THEME_FR = [
  // Core (high frequency)
  { fr: "Identité", key: "identite", examples: "Votre nom, nationalité, âge, ville", core: true },
  { fr: "Études", key: "etudes", examples: "Votre parcours, diplômes, matières", core: true },
  { fr: "Travail", key: "travail", examples: "Votre métier, expérience, entreprise", core: true },
  { fr: "Loisirs", key: "loisirs", examples: "Sports, musique, lecture, voyages", core: true },
  { fr: "Famille", key: "famille", examples: "Parents, enfants, frères et sœurs", core: true },
  { fr: "Quotidien", key: "quotidien", examples: "Routine, repas, transport, logement", core: true },
  { fr: "Projet Canada", key: "immigration", examples: "Pourquoi le Canada, objectifs, plans", core: true },
  // Supplementary
  { fr: "Logement", key: "logement", examples: "Votre appartement, quartier, voisins", core: false },
  { fr: "Voyages", key: "voyages", examples: "Pays visités, vacances, itinéraire", core: false },
  { fr: "Langues", key: "langues", examples: "Langues parlées, apprentissage du français", core: false },
  { fr: "Caractère", key: "caractere", examples: "Votre personnalité, qualités, défauts", core: false },
  { fr: "Souhaits", key: "souhaits", examples: "Projets futurs, rêves, objectifs", core: false },
  { fr: "Événements passés", key: "evenements_passes", examples: "Souvenirs marquants, expériences", core: false },
];

export function SpeakingTache1Guide() {
  const t = useTranslations();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [hasScript, setHasScript] = useState(false);

  useEffect(() => {
    listSpeakingScripts()
      .then((scripts) => setHasScript(scripts.length > 0))
      .catch(() => {});
  }, []);

  const handleStartAI = useCallback(async () => {
    setStarting(true);
    try {
      const session = await startTache1Conversation();
      router.push(`/speaking-conversation?sessionId=${session.id}`);
    } catch {
      setStarting(false);
    }
  }, [router]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(TACHE1_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const topicLabels: string[] = THEME_FR.map((_, idx) => t(`speakingGuide.topics.${idx}`));

  const flowSteps: string[] = [
    t("speakingGuide.flowSteps.0"),
    t("speakingGuide.flowSteps.1"),
    t("speakingGuide.flowSteps.2"),
    t("speakingGuide.flowSteps.3"),
  ];

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Card className="border-l-4 border-l-amber-500">
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
              {THEME_FR.filter(th => th.core).map((theme, idx) =>
                hasScript ? (
                  <Link
                    key={theme.key}
                    href={`/speaking-scripts#${theme.key}`}
                    className="group relative rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm transition-colors hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/40"
                  >
                    <span className="font-medium text-emerald-800 dark:text-emerald-300">{topicLabels[idx]}</span>
                    <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">{theme.fr}</span>
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block">
                      {theme.examples}
                    </div>
                  </Link>
                ) : (
                  <div
                    key={theme.key}
                    className="group relative rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-700 dark:hover:bg-amber-950/30"
                  >
                    <span className="font-medium">{topicLabels[idx]}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">{theme.fr}</span>
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block">
                      {theme.examples}
                    </div>
                  </div>
                ),
              )}
            </div>
            <p className="mb-2 mt-4 text-sm font-medium text-muted-foreground">{t("speakingGuide.supplementaryTopics")}</p>
            <div className="flex flex-wrap gap-2">
              {THEME_FR.filter(th => !th.core).map((theme) => {
                const idx = THEME_FR.findIndex(t => t.key === theme.key);
                return hasScript ? (
                  <Link
                    key={theme.key}
                    href={`/speaking-scripts#${theme.key}`}
                    className="group relative rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-2 text-sm transition-colors hover:border-sky-400 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 dark:hover:border-sky-600 dark:hover:bg-sky-900/40"
                  >
                    <span className="font-medium text-sky-800 dark:text-sky-300">{topicLabels[idx]}</span>
                    <span className="ml-1.5 text-xs text-sky-600 dark:text-sky-400">{theme.fr}</span>
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block">
                      {theme.examples}
                    </div>
                  </Link>
                ) : (
                  <div
                    key={theme.key}
                    className="group relative rounded-lg border border-dashed bg-card px-3 py-2 text-sm transition-colors hover:border-sky-300 hover:bg-sky-50/50 dark:hover:border-sky-700 dark:hover:bg-sky-950/30"
                  >
                    <span className="font-medium">{topicLabels[idx]}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">{theme.fr}</span>
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block">
                      {theme.examples}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demo video + Official PDF */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href="https://www.youtube.com/watch?v=Oy8X80PfLqA&t=310s"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center gap-2.5 rounded-lg border border-red-200 bg-red-50/50 px-4 py-3 text-sm transition-colors hover:border-red-300 hover:bg-red-100/60 dark:border-red-900 dark:bg-red-950/20 dark:hover:border-red-700 dark:hover:bg-red-900/30"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-800 dark:text-red-300">{t("speakingGuide.watchDemo")}</span>
              <span className="text-xs text-red-600 dark:text-red-400">YouTube</span>
            </a>
            <a
              href="https://www.france-education-international.fr/document/tcf-tp-qc-ca-exemple-epreuve-eo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3 text-sm transition-colors hover:border-blue-300 hover:bg-blue-100/60 dark:border-blue-900 dark:bg-blue-950/20 dark:hover:border-blue-700 dark:hover:bg-blue-900/30"
            >
              <FileText className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-800 dark:text-blue-300">{t("speakingGuide.officialExample")}</span>
              <span className="text-xs text-blue-600 dark:text-blue-400">PDF</span>
            </a>
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
            <Button onClick={handleStartAI} disabled={starting}>
              <Mic className="mr-1.5 h-3.5 w-3.5" />
              {starting ? t("common.actions.starting") : t("speakingGuide.startAIConversation")}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/speaking-scripts">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                {hasScript
                  ? t("speakingScripts.viewMyScript")
                  : t("speakingScripts.generateScript")}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <a
                    href={`https://chatgpt.com/?q=${encodeURIComponent(TACHE1_PROMPT)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> ChatGPT
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://grok.com/?q=${encodeURIComponent(TACHE1_PROMPT)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Grok
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy} className="gap-2">
                  {copied ? (
                    <><Check className="h-3.5 w-3.5" /> {t("common.actions.copied")}</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> {t("common.actions.copyPrompt")}</>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
