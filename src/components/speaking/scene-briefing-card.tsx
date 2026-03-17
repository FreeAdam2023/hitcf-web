"use client";

import { useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Info, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { translateConversationText } from "@/lib/api/speaking-conversation";
import type { SceneBriefing } from "@/lib/api/types";

interface SceneBriefingCardProps {
  briefing: SceneBriefing;
}

// Fixed translations for role descriptions (backend sends only French)
const ROLE_TRANSLATIONS: Record<string, Record<string, string>> = {
  "Le candidat — répondez aux questions de l'examinateur": {
    zh: "考生 — 回答考官的问题",
    en: "Candidate — answer the examiner's questions",
    ar: "المرشح — أجب على أسئلة الممتحن",
  },
  "Le candidat — vous devez poser des questions": {
    zh: "考生 — 你需要提问",
    en: "Candidate — you should ask questions",
    ar: "المرشح — يجب عليك طرح الأسئلة",
  },
  "Le candidat — exprimez votre point de vue": {
    zh: "考生 — 表达你的观点",
    en: "Candidate — express your point of view",
    ar: "المرشح — عبّر عن وجهة نظرك",
  },
  "L'examinateur TCF": {
    zh: "TCF 考官",
    en: "TCF Examiner",
    ar: "ممتحن TCF",
  },
  "L'interlocuteur décrit dans le scénario": {
    zh: "场景中描述的对话对象",
    en: "The person described in the scenario",
    ar: "المحاور الموصوف في السيناريو",
  },
  "Entretien dirigé — questions sur la vie quotidienne": {
    zh: "引导式访谈 — 关于日常生活的提问",
    en: "Guided interview — questions about daily life",
    ar: "مقابلة موجهة — أسئلة حول الحياة اليومية",
  },
};

function getTranslation(fr: string, locale: string): string | null {
  if (locale === "fr") return null;
  return ROLE_TRANSLATIONS[fr]?.[locale] ?? null;
}

// Module-level cache for scenario translation (dynamic, needs API)
const _scenarioCache = new Map<string, string>();

export function SceneBriefingCard({ briefing }: SceneBriefingCardProps) {
  const t = useTranslations("speakingConversation");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(true);
  const [scenarioTranslation, setScenarioTranslation] = useState<string | null>(
    () => _scenarioCache.get(`${briefing.scenario}:${locale}`) ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslateScenario = useCallback(async () => {
    if (showTranslation) { setShowTranslation(false); return; }
    if (scenarioTranslation) { setShowTranslation(true); return; }
    // Check if it's a known fixed phrase
    const fixed = getTranslation(briefing.scenario, locale);
    if (fixed) {
      setScenarioTranslation(fixed);
      _scenarioCache.set(`${briefing.scenario}:${locale}`, fixed);
      setShowTranslation(true);
      return;
    }
    setLoading(true);
    try {
      const data = await translateConversationText(briefing.scenario, locale);
      setScenarioTranslation(data.translation);
      _scenarioCache.set(`${briefing.scenario}:${locale}`, data.translation);
      setShowTranslation(true);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [showTranslation, scenarioTranslation, briefing.scenario, locale]);

  const isFr = locale === "fr";

  return (
    <Card>
      <CardContent className="pt-4">
        <button
          className="flex w-full items-center justify-between text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{t("sceneBriefing")}</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expanded && (
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">{t("scenario")}:</span>{" "}
              <span className="break-words leading-relaxed">{briefing.scenario}</span>
              {!isFr && showTranslation && scenarioTranslation && (
                <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">{scenarioTranslation}</p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">{t("yourRole")}:</span>{" "}
              {briefing.your_role}
              {!isFr && getTranslation(briefing.your_role, locale) && (
                <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                  ({getTranslation(briefing.your_role, locale)})
                </span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">{t("examinerRole")}:</span>{" "}
              {briefing.examiner_role}
              {!isFr && getTranslation(briefing.examiner_role, locale) && (
                <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                  ({getTranslation(briefing.examiner_role, locale)})
                </span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">{t("targetDuration")}:</span>{" "}
              {briefing.target_duration}
            </div>
            {!isFr && (
              <button
                onClick={handleTranslateScenario}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {loading ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ) : showTranslation ? (
                  <EyeOff className="h-2.5 w-2.5" />
                ) : (
                  <Eye className="h-2.5 w-2.5" />
                )}
                {loading ? t("translating") : showTranslation ? t("hideTranslation") : t("showTranslation")}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
