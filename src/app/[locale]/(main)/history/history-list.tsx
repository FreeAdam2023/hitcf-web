"use client";

import { useEffect, useState, useCallback } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Headphones,
  BookOpen,
  Mic,
  PenLine,
  ChevronRight,
  Clock,
  Trophy,
  TrendingUp,
  Loader2,
  Trash2,
  Flame,
  MapPin,
  CalendarDays,
  AlertTriangle,
  Navigation,
  Pencil,
  X,
  Info,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteAttempt, getAttemptProgress, listAttempts } from "@/lib/api/attempts";
import type { ProgressResponse } from "@/lib/api/attempts";
import { deleteSpeakingAttempt, listSpeakingAttempts } from "@/lib/api/speaking-attempts";
import { listConversations, deleteConversation } from "@/lib/api/speaking-conversation";
import { estimateTcfLevelFromRatio } from "@/lib/tcf-levels";
import { useTranslations, useLocale } from "next-intl";
import type { AttemptResponse, SpeakingAttemptResponse, SpeakingConversationResponse } from "@/lib/api/types";
import { TYPE_COLORS, TYPE_KEYS } from "@/lib/constants";
import { localizeTestName } from "@/lib/test-name";
import { getStatsOverview, type StatsOverview } from "@/lib/api/stats";
import { setExamDate } from "@/lib/api/auth";
import { CLB7Readiness } from "@/components/dashboard/clb7-readiness";
import { useAuthStore } from "@/stores/auth-store";
import { getPhaseMessage, getDaysUntil, getCancelDeadline, EXAM_CENTERS, CITY_OPTIONS } from "@/lib/countdown";
import { cn } from "@/lib/utils";

// Unified history item type
interface HistoryItem {
  id: string;
  test_set_name: string | null;
  test_set_type: string;
  mode: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  updated_at: string | null;
  // For listening/reading/writing
  score: number | null;
  total: number;
  answered_count: number;
  // For speaking
  speakingOverall: number | null;
  // For conversations
  tacheType?: number;
  conversationScore?: number | null;
  // Exam time limit (for expired detection)
  time_limit_minutes: number | null;
  is_mock_exam: boolean;
  // Source discriminator
  _source: "attempt" | "speaking" | "conversation";
}

function fromAttempt(a: AttemptResponse): HistoryItem {
  return {
    id: a.id,
    test_set_name: a.test_set_name ?? null,
    test_set_type: a.test_set_type ?? "",
    mode: a.mode,
    status: a.status,
    started_at: a.started_at,
    completed_at: a.completed_at,
    updated_at: a.updated_at ?? null,
    score: a.score,
    total: a.total,
    answered_count: a.answered_count,
    speakingOverall: null,
    time_limit_minutes: a.time_limit_minutes ?? null,
    is_mock_exam: a.is_mock_exam ?? false,
    _source: "attempt",
  };
}

function fromSpeaking(s: SpeakingAttemptResponse): HistoryItem {
  return {
    id: s.id,
    test_set_name: s.test_set_name,
    test_set_type: "speaking",
    mode: s.mode,
    status: s.status,
    started_at: s.started_at,
    completed_at: s.completed_at,
    updated_at: null,
    score: null,
    total: 100,
    answered_count: 0,
    speakingOverall: s.scores?.overall ?? null,
    time_limit_minutes: null,
    is_mock_exam: false,
    _source: "speaking",
  };
}

function fromConversation(c: SpeakingConversationResponse): HistoryItem {
  const tacheLabel = `Tâche ${c.tache_type}`;
  const scenario = c.scene_briefing?.scenario;
  const name = scenario
    ? `${tacheLabel} — ${scenario.slice(0, 60)}${scenario.length > 60 ? "…" : ""}`
    : tacheLabel;
  return {
    id: c.id,
    test_set_name: name,
    test_set_type: "speaking",
    mode: "conversation",
    status: c.status === "abandoned" ? "completed" : c.status,
    started_at: c.started_at,
    completed_at: c.completed_at ?? null,
    updated_at: null,
    score: null,
    total: 30,
    answered_count: c.turn_count,
    speakingOverall: null,
    tacheType: c.tache_type,
    conversationScore: c.evaluation?.total_score ?? null,
    time_limit_minutes: null,
    is_mock_exam: false,
    _source: "conversation",
  };
}

function CountdownHeader({ examDate, examCity, onEdit }: { examDate: string; examCity: string | null; onEdit: () => void }) {
  const t = useTranslations("history.summary.countdown");
  const locale = useLocale();
  const days = getDaysUntil(examDate);
  const phase = getPhaseMessage(days);
  const center = examCity ? EXAM_CENTERS[examCity] : null;
  const cancelDate = getCancelDeadline(examDate);

  const formattedDate = new Date(examDate + "T00:00:00").toLocaleDateString(
    LOCALE_MAP[locale] || locale,
    { month: "long", day: "numeric" },
  );
  const formattedCancelDate = new Date(cancelDate + "T00:00:00").toLocaleDateString(
    LOCALE_MAP[locale] || locale,
    { month: "numeric", day: "numeric" },
  );

  const cityName = examCity ? t(`cities.${examCity}`) : "";

  const flameColor = days <= 7 ? "text-red-500" : days <= 30 ? "text-orange-500" : "text-amber-500";

  return (
    <div className="space-y-3">
      {/* Countdown number + info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex flex-col items-center justify-center rounded-xl bg-muted/50 px-3 py-1.5 min-w-[64px]", days <= 7 && "bg-red-50 dark:bg-red-950/30")}>
            <Flame className={cn("h-4 w-4 mb-0.5", flameColor)} />
            <span className={cn("text-2xl font-bold tabular-nums leading-none", flameColor)}>
              {Math.max(0, days)}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {days === 1 ? "day" : t("daysLeft", { days: "" }).trim()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">
              {t("examOn", { city: cityName, date: formattedDate })}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{t(phase)}</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={t("editExamDate")}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Policy + address row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {days > 0 && days <= 60 && (
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            {t("cancelDeadline", { date: formattedCancelDate })}
          </span>
        )}
        {center && (
          <a
            href={center.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <MapPin className="h-3 w-3" />
            {center.address}
          </a>
        )}
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/tests"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <CalendarDays className="h-3 w-3" />
          {t("mockExam")}
        </Link>
        <Link
          href="/wrong-answers"
          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          {t("reviewWrong")}
        </Link>
        {center && (
          <a
            href={center.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <Navigation className="h-3 w-3" />
            {t("navigate")}
          </a>
        )}
        <Link
          href="/blog/exam-day-guide"
          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          <Info className="h-3 w-3" />
          {t("examDayGuide")}
        </Link>
      </div>

      <div className="border-b" />
    </div>
  );
}

function ExamDatePrompt({ onSet }: { onSet: () => void }) {
  const t = useTranslations("history.summary.countdown");
  return (
    <button
      onClick={onSet}
      className="flex items-center gap-2 w-full rounded-lg border border-dashed border-muted-foreground/25 px-3 py-2.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
    >
      <CalendarDays className="h-3.5 w-3.5" />
      <span>{t("setExamDate")}</span>
      <ChevronRight className="h-3 w-3 ml-auto" />
    </button>
  );
}

function ExamDateEditor({ initialDate, initialCity, onSave, onCancel }: {
  initialDate: string | null;
  initialCity: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("history.summary.countdown");
  const [date, setDate] = useState(initialDate || "");
  const [city, setCity] = useState(initialCity || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!date) return;
    setSaving(true);
    try {
      await setExamDate(date, city || null);
      onSave();
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await setExamDate(null, null);
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 p-1">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">{t("selectDate")}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">{t("selectCity")}</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">—</option>
          {CITY_OPTIONS.map((c) => (
            <option key={c} value={c}>{t(`cities.${c}`)}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!date || saving}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : t("save")}
        </button>
        <button
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("cancel")}
        </button>
        {initialDate && (
          <button
            onClick={handleClear}
            disabled={saving}
            className="ml-auto rounded-md px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="h-3 w-3 inline mr-1" />
            {t("clearExamDate")}
          </button>
        )}
      </div>
    </div>
  );
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  listening: Headphones,
  reading: BookOpen,
  speaking: Mic,
  writing: PenLine,
};

const PAGE_SIZE = 20;

/** Parse a date string as UTC (backend returns naive UTC timestamps without Z). */
function parseUTC(dateStr: string): Date {
  // Already has timezone info (Z, +HH:MM, or -HH:MM suffix)
  if (/Z$|[+-]\d{2}:\d{2}$/.test(dateStr)) return new Date(dateStr);
  return new Date(dateStr + "Z");
}

const LOCALE_MAP: Record<string, string> = {
  zh: "zh-CN",
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-SA",
};

function formatDate(dateStr: string, locale: string): string {
  const d = parseUTC(dateStr);
  return d.toLocaleDateString(LOCALE_MAP[locale] || locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(dateStr: string): boolean {
  const d = parseUTC(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(dateStr: string): boolean {
  const d = parseUTC(dateStr);
  const diff = Date.now() - d.getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

/** Pick the most recent date for sorting and grouping. */
function latestDate(item: HistoryItem): string {
  const candidates = [item.started_at, item.completed_at, item.updated_at].filter(Boolean) as string[];
  if (candidates.length === 0) return item.started_at;
  return candidates.reduce((a, b) => (parseUTC(a).getTime() >= parseUTC(b).getTime() ? a : b));
}

function groupByDate(items: HistoryItem[]) {
  const today: HistoryItem[] = [];
  const thisWeek: HistoryItem[] = [];
  const earlier: HistoryItem[] = [];
  for (const item of items) {
    const d = latestDate(item);
    if (isToday(d)) today.push(item);
    else if (isThisWeek(d)) thisWeek.push(item);
    else earlier.push(item);
  }
  return { today, thisWeek, earlier };
}

function ProgressBar({
  icon: Icon,
  label,
  detail,
  done,
  total,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  detail: string;
  done: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5", colorClass)} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {detail}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SummaryTabs({ progress, stats }: { progress: ProgressResponse | null; stats: StatsOverview | null }) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"progress" | "readiness">("progress");
  const { user, fetchUser } = useAuthStore();
  const [editing, setEditing] = useState(false);

  if (!progress && !stats) return null;

  const examDate = user?.exam_date ?? null;
  const examCity = user?.exam_city ?? null;

  const handleSave = () => {
    setEditing(false);
    fetchUser();
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Tab header */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("progress")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "progress"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          {t("history.summary.title")}
        </button>
        {stats && stats.total_attempts > 0 && (
          <button
            onClick={() => setActiveTab("readiness")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "readiness"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Trophy className="h-3.5 w-3.5" />
            {t("history.summary.readiness")}
          </button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === "progress" && progress && (
        <div className="p-4 space-y-3">
          {/* Countdown section */}
          {editing ? (
            <ExamDateEditor
              initialDate={examDate}
              initialCity={examCity}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          ) : examDate ? (
            <CountdownHeader examDate={examDate} examCity={examCity} onEdit={() => setEditing(true)} />
          ) : null}

          <ProgressBar
            icon={Headphones}
            label={t("common.types.listening")}
            detail={t("history.summary.doneQuestions", { count: progress.listening.done, pct: progress.listening.total > 0 ? Math.round((progress.listening.done / progress.listening.total) * 100) : 0 })}
            done={progress.listening.done}
            total={progress.listening.total}
            colorClass="bg-blue-500 text-blue-500"
          />
          <ProgressBar
            icon={BookOpen}
            label={t("common.types.reading")}
            detail={t("history.summary.doneQuestions", { count: progress.reading.done, pct: progress.reading.total > 0 ? Math.round((progress.reading.done / progress.reading.total) * 100) : 0 })}
            done={progress.reading.done}
            total={progress.reading.total}
            colorClass="bg-emerald-500 text-emerald-500"
          />
          <ProgressBar
            icon={Mic}
            label={t("common.types.speaking")}
            detail={t("history.summary.done30dQuestions", { count: progress.speaking.done })}
            done={progress.speaking.done}
            total={progress.speaking.total}
            colorClass="bg-amber-500 text-amber-500"
          />
          <ProgressBar
            icon={PenLine}
            label={t("common.types.writing")}
            detail={t("history.summary.done30dSets", { count: progress.writing.done })}
            done={progress.writing.done}
            total={progress.writing.total}
            colorClass="bg-rose-500 text-rose-500"
          />

          {/* Prompt to set exam date (when not set and not editing) */}
          {!examDate && !editing && (
            <ExamDatePrompt onSet={() => setEditing(true)} />
          )}
        </div>
      )}

      {activeTab === "readiness" && stats && stats.total_attempts > 0 && (
        <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none">
          <CLB7Readiness
            listeningAccuracy={stats.listening_accuracy}
            readingAccuracy={stats.reading_accuracy}
            totalAttempts={stats.total_attempts}
            streakDays={stats.streak_days}
          />
        </div>
      )}
    </div>
  );
}

function TypeFilterChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          value === "all"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80",
        )}
      >
        {t("history.filter.all")}
      </button>
      {TYPE_KEYS.map((type) => {
        const Icon = TYPE_ICONS[type];
        const colors = TYPE_COLORS[type];
        const isActive = value === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? colors?.iconBg
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <Icon className="h-3 w-3" />
            {t(`common.types.${type}`)}
          </button>
        );
      })}
    </div>
  );
}

function DateGroup({ label, items, onDelete }: { label: string; items: HistoryItem[]; onDelete: (item: HistoryItem) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </h3>
      {items.map((a) => (
        <HistoryCard key={`${a._source}-${a.id}`} item={a} onDelete={onDelete} />
      ))}
    </div>
  );
}

function HistoryCard({ item, onDelete }: { item: HistoryItem; onDelete: (item: HistoryItem) => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const isCompleted = item.status === "completed";
  const isSpeaking = item._source === "speaking";
  const isConversation = item._source === "conversation";
  const isSpeedDrill = item.mode === "speed_drill";

  // Check if an in-progress exam has expired
  const isExpired = item.mode === "exam" && item.status === "in_progress" && !!item.time_limit_minutes && (() => {
    const started = parseUTC(item.started_at).getTime();
    return Date.now() - started > item.time_limit_minutes! * 60 * 1000;
  })();

  // URL depends on source — expired exams go to results (backend auto-completes on access)
  let url: string;
  if (isConversation) {
    url = isCompleted
      ? `/speaking-conversation/results/${item.id}`
      : `/speaking-conversation?sessionId=${item.id}`;
  } else if (isSpeaking) {
    url = `/speaking-practice/results/${item.id}`;
  } else if (isCompleted || isExpired) {
    url = `/results/${item.id}`;
  } else if (item.mode === "exam") {
    url = `/exam/${item.id}`;
  } else {
    url = `/practice/${item.id}`;
  }

  // Score display
  const pct = isConversation
    ? (item.conversationScore != null ? Math.round((item.conversationScore / 30) * 100) : null)
    : isSpeaking
      ? (item.speakingOverall != null ? Math.round(item.speakingOverall) : null)
      : (isCompleted && item.score != null && item.total > 0
          ? Math.round((item.score / item.total) * 100)
          : null);

  const tcf =
    !isSpeaking && !isSpeedDrill && isCompleted && item.score != null
      ? estimateTcfLevelFromRatio(item.score, item.total)
      : null;

  const colors = TYPE_COLORS[item.test_set_type || ""];
  const Icon = TYPE_ICONS[item.test_set_type || ""] || Trophy;
  const isExam = item.mode === "exam";

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(url)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(url);
      }}
      className={cn(
        "group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-200 cursor-pointer hover:bg-accent/50 hover:shadow-sm",
        isExam && "border-l-[3px] border-l-indigo-500 dark:border-l-indigo-400",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          colors?.iconBg || "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm lg:text-base font-medium">
            {item.mode === "speed_drill"
              ? t(`common.modes.speed_drill`)
              : item.test_set_name
                ? localizeTestName(t, item.test_set_type, item.test_set_name)
                : "-"}
          </span>
          {isExpired && (
            <Badge
              variant="outline"
              className="shrink-0 border-red-300 bg-red-50 text-red-700 text-[10px] dark:border-red-800 dark:bg-red-950 dark:text-red-400"
            >
              {t("history.expired")}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
          {item.test_set_type && (
            <span>{t(`common.types.${item.test_set_type}`)}</span>
          )}
          {isExam ? (
            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] px-1.5 py-0">
              {t(`common.modes.${item.mode}`)}
            </Badge>
          ) : (
            <span className="text-muted-foreground/70">{t(`common.modes.${item.mode}`)}</span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(latestDate(item), locale)}
          </span>
        </div>

        {/* Score bar */}
        {pct !== null && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted flex">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${pct}%`, borderRadius: pct >= 100 ? "9999px" : "9999px 0 0 9999px" }}
              />
              {pct < 100 && !isSpeaking && !isConversation && (
                <div
                  className="h-full bg-red-300 dark:bg-red-400/60 transition-all"
                  style={{ width: `${100 - pct}%`, borderRadius: "0 9999px 9999px 0" }}
                />
              )}
            </div>
            <span className="text-xs font-medium tabular-nums">
              {isConversation
                ? `${item.conversationScore}/30`
                : isSpeaking
                  ? `${pct}/100`
                  : `${item.score}/${item.total}`}
            </span>
          </div>
        )}
        {!isCompleted && !isExpired && !isSpeaking && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/40"
                style={{
                  width: `${item.total > 0 ? (item.answered_count / item.total) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {item.answered_count}/{item.total}
            </span>
          </div>
        )}
      </div>

      {/* Level badge + delete + arrow */}
      <div className="flex items-center gap-2">
        {tcf && (
          <span
            className={cn(
              "rounded-md px-2 py-1 text-xs font-semibold",
              tcf.color,
              tcf.bgColor,
            )}
          >
            {tcf.level}
          </span>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              aria-label={t("history.deleteConfirm")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("history.deleteConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("history.deleteConfirmDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("history.deleteCancel")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleting}
                onClick={async (e) => {
                  e.stopPropagation();
                  setDeleting(true);
                  try {
                    if (isConversation) {
                      await deleteConversation(item.id);
                    } else if (isSpeaking) {
                      await deleteSpeakingAttempt(item.id);
                    } else {
                      await deleteAttempt(item.id);
                    }
                    onDelete(item);
                  } catch {
                    alert(t("history.deleteFailed"));
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("history.deleteConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

export function HistoryList() {
  const t = useTranslations();
  const [allItems, setAllItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [progress, setProgress] = useState<ProgressResponse | null>(null);

  const hasMore = allItems.length < total;

  const fetchPage = useCallback(
    async (pageNum: number, type: string, reset: boolean) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      try {
        const includeRegular = type === "all" || (type !== "speaking");
        const includeSpeaking = type === "all" || type === "speaking";

        const promises: Promise<unknown>[] = [];

        if (includeRegular) {
          promises.push(
            listAttempts({
              page: pageNum,
              page_size: PAGE_SIZE,
              type: type === "all" ? undefined : type,
            }),
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        if (includeSpeaking) {
          promises.push(
            listSpeakingAttempts({
              page: pageNum,
              page_size: PAGE_SIZE,
            }),
          );
          promises.push(
            listConversations({
              page: pageNum,
              page_size: PAGE_SIZE,
            }),
          );
        } else {
          promises.push(Promise.resolve(null));
          promises.push(Promise.resolve(null));
        }

        const [regularResult, speakingResult, conversationResult] = await Promise.all(promises) as [
          { items: AttemptResponse[]; total: number } | null,
          { items: SpeakingAttemptResponse[]; total: number } | null,
          { items: SpeakingConversationResponse[]; total: number } | null,
        ];

        const regularItems = regularResult
          ? regularResult.items.map(fromAttempt)
          : [];
        const speakingItems = speakingResult
          ? speakingResult.items.map(fromSpeaking)
          : [];
        const conversationItems = conversationResult
          ? conversationResult.items.map(fromConversation)
          : [];

        // Merge and sort by most recent date (newest first)
        const merged = [...regularItems, ...speakingItems, ...conversationItems].sort((a, b) => {
          const dateA = parseUTC(latestDate(a)).getTime();
          const dateB = parseUTC(latestDate(b)).getTime();
          return dateB - dateA;
        });

        const totalCount =
          (regularResult?.total ?? 0) + (speakingResult?.total ?? 0) + (conversationResult?.total ?? 0);

        setTotal(totalCount);
        setAllItems((prev) =>
          reset ? merged : [...prev, ...merged],
        );
      } catch {
        if (reset) setAllItems([]);
      } finally {
        if (reset) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    fetchPage(1, typeFilter, true);
  }, [typeFilter, fetchPage]);

  const [stats, setStats] = useState<StatsOverview | null>(null);

  useEffect(() => {
    getAttemptProgress().then(setProgress).catch(() => {});
    getStatsOverview().then(setStats).catch(() => {});
  }, []);

  const handleTypeChange = (v: string) => {
    setTypeFilter(v);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, typeFilter, false);
  };

  const handleDelete = useCallback((item: HistoryItem) => {
    setAllItems((prev) => prev.filter((a) => !(a.id === item.id && a._source === item._source)));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  const grouped = groupByDate(allItems);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 text-gradient">
            {t("history.title")}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("history.subtitle")}
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <SummaryTabs progress={progress} stats={stats} />

          <TypeFilterChips value={typeFilter} onChange={handleTypeChange} />

          {!allItems.length ? (
            <EmptyState
              title={t(typeFilter !== "all" ? "history.empty.filteredTitle" : "history.empty.title")}
              description={t(typeFilter !== "all" ? "history.empty.filteredDescription" : "history.empty.description")}
              action={
                <Button asChild>
                  <Link href="/tests">{t("history.goToTests")}</Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="space-y-6">
                <DateGroup label={t("history.groups.today")} items={grouped.today} onDelete={handleDelete} />
                <DateGroup
                  label={t("history.groups.thisWeek")}
                  items={grouped.thisWeek}
                  onDelete={handleDelete}
                />
                <DateGroup
                  label={t("history.groups.earlier")}
                  items={grouped.earlier}
                  onDelete={handleDelete}
                />
              </div>

              {hasMore && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("history.loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
