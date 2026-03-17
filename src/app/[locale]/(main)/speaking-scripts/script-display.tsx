"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Download,
  RefreshCw,
  Pencil,
  Trash2,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import {
  type SpeakingScriptResponse,
  exportScriptCSV,
  deleteSpeakingScript,
} from "@/lib/api/speaking-scripts";

const THEME_ICONS: Record<string, string> = {
  identite: "👤",
  etudes: "🎓",
  travail: "💼",
  loisirs: "🎯",
  famille: "👨‍👩‍👧",
  quotidien: "🏠",
  immigration: "✈️",
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  A2: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  B1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  B2: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  C1: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  C2: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
};

interface ScriptDisplayProps {
  script: SpeakingScriptResponse;
  onRegenerate: () => void;
  onEditPersona: () => void;
}

export function ScriptDisplay({
  script,
  onRegenerate,
  onEditPersona,
}: ScriptDisplayProps) {
  const t = useTranslations("speakingScripts");
  const tc = useTranslations("common");
  const tts = useSpeechSynthesis("fr-CA-SylvieNeural");
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(
    () => new Set(script.topics.map((_, i) => i)),
  );
  const [deleting, setDeleting] = useState(false);

  const toggleTopic = useCallback((idx: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleSpeak = useCallback(
    (text: string) => {
      if (tts.isSpeaking) {
        tts.stop();
        return;
      }
      tts.speak(text);
    },
    [tts],
  );

  const handleExport = useCallback(async () => {
    try {
      await exportScriptCSV(script.id);
      toast.success(t("exportSuccess"));
    } catch {
      toast.error(tc("errors.generic"));
    }
  }, [script.id, t, tc]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteSpeakingScript(script.id);
      toast.success(t("deleteSuccess"));
      onRegenerate();
    } catch {
      toast.error(tc("errors.generic"));
      setDeleting(false);
    }
  }, [script.id, t, tc, onRegenerate]);

  return (
    <div className="space-y-4">
      {/* Info bar */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{script.target_level}</Badge>
        <span>
          {t("topicCount", { count: script.topics.length })}
        </span>
        <span>·</span>
        <span>
          {t("exchangeCount", {
            count: script.topics.reduce(
              (sum, tp) => sum + tp.exchanges.length,
              0,
            ),
          })}
        </span>
      </div>

      {/* Topic cards */}
      {script.topics.map((topic, topicIdx) => {
        const expanded = expandedTopics.has(topicIdx);
        const icon = THEME_ICONS[topic.theme] ?? "📝";
        return (
          <Card key={topicIdx}>
            <CardHeader
              className="cursor-pointer pb-3"
              onClick={() => toggleTopic(topicIdx)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span>{icon}</span>
                  {t(`themes.${topic.theme}`)}
                  <Badge variant="outline" className="text-xs">
                    {topic.exchanges.length} Q&A
                  </Badge>
                </CardTitle>
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {expanded && (
              <CardContent className="space-y-3 pt-0">
                {topic.exchanges.map((ex, exIdx) => (
                  <div key={exIdx} className="space-y-1.5">
                    {/* Examiner question */}
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <span className="mr-1.5 font-medium text-muted-foreground">
                        {t("examiner")}:
                      </span>
                      {ex.examiner_fr}
                    </div>

                    {/* Candidate answer */}
                    <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm dark:bg-blue-950/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="mr-1.5 font-medium text-blue-700 dark:text-blue-400">
                            {t("candidate")}:
                          </span>
                          {ex.candidate_fr}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {ex.level_tag && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                LEVEL_COLORS[ex.level_tag] ?? ""
                              }`}
                            >
                              {ex.level_tag}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleSpeak(ex.candidate_fr)}
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Translations */}
                    {(ex.zh || ex.en) && (
                      <div className="px-3 text-xs text-muted-foreground">
                        {ex.zh && <span>{ex.zh}</span>}
                        {ex.zh && ex.en && <span> / </span>}
                        {ex.en && <span>{ex.en}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {t("exportCSV")}
        </Button>
        <Button variant="outline" size="sm" onClick={onRegenerate}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          {t("regenerate")}
        </Button>
        <Button variant="outline" size="sm" onClick={onEditPersona}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          {t("editPersona")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {tc("actions.cancel")}
        </Button>
      </div>
    </div>
  );
}
