"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  RefreshCw,
  Pencil,
  Trash2,
  Volume2,
  Loader2,
  User,
  GraduationCap,
  Briefcase,
  Heart,
  Users,
  Coffee,
  Plane,
  Check,
  X,
  Play,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import {
  type SpeakingScriptResponse,
  type ScriptTopic,
  deleteSpeakingScript,
  getSpeakingScript,
  updateScriptExchange,
} from "@/lib/api/speaking-scripts";

const ALL_THEMES = [
  "identite",
  "etudes",
  "travail",
  "loisirs",
  "famille",
  "quotidien",
  "immigration",
] as const;

const THEME_ICONS: Record<string, LucideIcon> = {
  identite: User,
  etudes: GraduationCap,
  travail: Briefcase,
  loisirs: Heart,
  famille: Users,
  quotidien: Coffee,
  immigration: Plane,
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
  onScriptUpdate: (script: SpeakingScriptResponse) => void;
  onRegenerate: () => void;
  onEditPersona: () => void;
  onStartPractice: () => void;
}

function TopicContent({
  topic,
  scriptId,
  t,
  tc,
  onScriptUpdate,
}: {
  topic: ScriptTopic;
  scriptId: string;
  t: (key: string) => string;
  tc: (key: string) => string;
  onScriptUpdate: (script: SpeakingScriptResponse) => void;
}) {
  const tts = useSpeechSynthesis("fr-CA-SylvieNeural");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

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

  const startEdit = useCallback((idx: number, text: string) => {
    setEditingIdx(idx);
    setEditText(text);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingIdx(null);
    setEditText("");
  }, []);

  const saveEdit = useCallback(async () => {
    if (editingIdx === null || !editText.trim()) return;
    setSaving(true);
    try {
      const updated = await updateScriptExchange(scriptId, {
        theme: topic.theme,
        exchange_index: editingIdx,
        candidate_fr: editText.trim(),
      });
      onScriptUpdate(updated);
      setEditingIdx(null);
      setEditText("");
    } catch {
      toast.error(tc("errors.generic"));
    } finally {
      setSaving(false);
    }
  }, [editingIdx, editText, scriptId, topic.theme, onScriptUpdate, tc]);

  return (
    <div className="space-y-3">
      {topic.exchanges.map((ex, exIdx) => (
        <div key={exIdx} className="space-y-1.5">
          {/* Examiner question */}
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <span className="mr-1.5 text-xs font-medium text-muted-foreground">
              {t("examiner")}:
            </span>
            <span className="text-sm">{ex.examiner_fr}</span>
            {(ex.examiner_zh || ex.examiner_en) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {ex.examiner_zh}
                {ex.examiner_zh && ex.examiner_en && " / "}
                {ex.examiner_en}
              </p>
            )}
          </div>

          {/* Candidate answer */}
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm dark:bg-blue-950/30">
            {editingIdx === exIdx ? (
              <div className="space-y-2">
                <textarea
                  className="w-full rounded border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveEdit();
                    }
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={saveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    <X className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              </div>
            ) : (
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
                    onClick={() => startEdit(exIdx, ex.candidate_fr)}
                  >
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                  </Button>
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
            )}
          </div>
          {(ex.zh || ex.en) && (
            <div className="px-3 text-xs text-muted-foreground">
              {ex.zh && <span>{ex.zh}</span>}
              {ex.zh && ex.en && <span> / </span>}
              {ex.en && <span>{ex.en}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ScriptDisplay({
  script,
  onScriptUpdate,
  onRegenerate,
  onEditPersona,
  onStartPractice,
}: ScriptDisplayProps) {
  const t = useTranslations("speakingScripts");
  const tc = useTranslations("common");
  const [activeTheme, setActiveTheme] = useState<string>(
    script.topics[0]?.theme ?? "identite",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Build set of generated themes for quick lookup
  const generatedThemes = new Set(script.topics.map((t) => t.theme));
  const isPartial = script.generation_status === "partial";

  // Scroll to hash anchor
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && generatedThemes.has(hash)) {
      setActiveTheme(hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabClick = useCallback(
    async (theme: string) => {
      // If already generated, just switch
      if (generatedThemes.has(theme)) {
        setActiveTheme(theme);
        return;
      }

      // Not yet generated — refresh from server
      if (refreshing) return;
      setRefreshing(true);
      try {
        const updated = await getSpeakingScript(script.id);
        onScriptUpdate(updated);
        // Check if the clicked theme is now available
        const nowHas = updated.topics.some((t) => t.theme === theme);
        if (nowHas) {
          setActiveTheme(theme);
        } else {
          toast.info(t("themeGenerating"));
        }
      } catch {
        toast.error(tc("errors.generic"));
      } finally {
        setRefreshing(false);
      }
    },
    [generatedThemes, refreshing, script.id, onScriptUpdate, t, tc],
  );

  const activeTopic = script.topics.find((t) => t.theme === activeTheme);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(t("destroyConfirm"))) return;
    setDeleting(true);
    try {
      await deleteSpeakingScript(script.id);
      try {
        localStorage.removeItem("hitcf_speaking_persona");
      } catch {
        // ignore
      }
      toast.success(t("destroySuccess"));
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
          {isPartial && ` / 7`}
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
        {isPartial && (
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            {t("generatingRemaining")}
          </Badge>
        )}
      </div>

      {/* Theme tabs */}
      <div className="flex flex-wrap gap-2">
        {ALL_THEMES.map((theme) => {
          const isGenerated = generatedThemes.has(theme);
          const isActive = activeTheme === theme;
          const Icon = THEME_ICONS[theme] ?? User;

          return (
            <button
              key={theme}
              onClick={() => handleTabClick(theme)}
              disabled={refreshing}
              className={`
                flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm
                transition-all
                ${
                  isActive && isGenerated
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : isGenerated
                      ? "border-border bg-card font-medium hover:border-primary/50 hover:bg-primary/5"
                      : "border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground"
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t(`themes.${theme}`)}</span>
              {isGenerated && (
                <Badge variant="outline" className="ml-0.5 text-[10px] px-1 py-0">
                  {script.topics.find((tp) => tp.theme === theme)?.exchanges.length}
                </Badge>
              )}
              {!isGenerated && isPartial && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active topic content */}
      {activeTopic ? (
        <Card id={activeTheme}>
          <CardContent className="pt-5">
            <TopicContent
              topic={activeTopic}
              scriptId={script.id}
              t={t}
              tc={tc}
              onScriptUpdate={onScriptUpdate}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex min-h-[20vh] items-center justify-center pt-5">
            <div className="text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
              <p>{t("themeGenerating")}</p>
              <p className="mt-1 text-xs">{t("themeGeneratingHint")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          size="sm"
          onClick={onStartPractice}
          disabled={isPartial}
        >
          <Play className="mr-1.5 h-3.5 w-3.5" />
          {t("practice.start")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRegenerate}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              {t("regenerate")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditPersona}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              {t("editPersona")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              {t("destroyData")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
