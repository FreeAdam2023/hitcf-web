"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAttempts } from "@/lib/api/attempts";
import { getInProgressDrills, type InProgressAttempt } from "@/lib/api/speed-drill";
import { listSpeakingAttempts } from "@/lib/api/speaking-attempts";
import { listConversations } from "@/lib/api/speaking-conversation";
import { listWritingExamHistory, type WritingExamHistoryItem } from "@/lib/api/writing-exam";
import { useTranslations } from "next-intl";
import { localizeTestName } from "@/lib/test-name";
import type { AttemptResponse, SpeakingAttemptResponse, SpeakingConversationResponse } from "@/lib/api/types";

type ContinueItem =
  | { kind: "attempt"; data: AttemptResponse; time: number }
  | { kind: "drill"; data: InProgressAttempt; time: number }
  | { kind: "speaking"; data: SpeakingAttemptResponse; time: number }
  | { kind: "conversation"; data: SpeakingConversationResponse; time: number }
  | { kind: "writingExam"; data: WritingExamHistoryItem; time: number };

export function ContinueBanner({ onVisibleChange }: { onVisibleChange?: (visible: boolean) => void } = {}) {
  const t = useTranslations();
  const [item, setItem] = useState<ContinueItem | null>(null);

  useEffect(() => {
    Promise.all([
      // 1. Listening/reading attempts
      listAttempts({ page_size: 5 }).then((res) =>
        res.items
          .filter((a) => a.status === "in_progress")
          .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()),
      ).catch(() => [] as AttemptResponse[]),

      // 2. Speed drills (等级练习)
      getInProgressDrills().catch(() => [] as InProgressAttempt[]),

      // 3. Speaking practice (pronunciation)
      listSpeakingAttempts({ page_size: 5 }).then((res) =>
        res.items.filter((a) => a.status === "in_progress"),
      ).catch(() => [] as SpeakingAttemptResponse[]),

      // 4. Speaking conversation (AI dialogue)
      listConversations({ page_size: 5, status: "active" }).then((res) =>
        res.items,
      ).catch(() => [] as SpeakingConversationResponse[]),

      // 5. Writing exam
      listWritingExamHistory({ page_size: 5 }).then((res) =>
        res.items.filter((e) => e.status === "in_progress"),
      ).catch(() => [] as WritingExamHistoryItem[]),
    ]).then(([attempts, drills, speakingAttempts, conversations, writingExams]) => {
      const candidates: ContinueItem[] = [];

      if (attempts[0]) {
        candidates.push({ kind: "attempt", data: attempts[0], time: new Date(attempts[0].started_at).getTime() });
      }
      if (drills[0]) {
        candidates.push({ kind: "drill", data: drills[0], time: new Date(drills[0].started_at).getTime() });
      }
      if (speakingAttempts[0]) {
        candidates.push({ kind: "speaking", data: speakingAttempts[0], time: new Date(speakingAttempts[0].started_at).getTime() });
      }
      if (conversations[0]) {
        candidates.push({ kind: "conversation", data: conversations[0], time: new Date(conversations[0].started_at).getTime() });
      }
      if (writingExams[0]) {
        candidates.push({ kind: "writingExam", data: writingExams[0], time: new Date(writingExams[0].created_at).getTime() });
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => b.time - a.time);
        setItem(candidates[0]);
      }
    });
  }, []);

  useEffect(() => {
    onVisibleChange?.(item !== null);
  }, [item, onVisibleChange]);

  if (!item) return null;

  // ── Listening / Reading attempt ──
  if (item.kind === "attempt") {
    const attempt = item.data;
    const path = attempt.mode === "exam" ? "exam" : "practice";
    const modeLabel = t(`common.modes.${attempt.mode}`);
    return (
      <BannerShell onDismiss={() => setItem(null)}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium opacity-90">{t("continueBanner.title")}</p>
          <p className="mt-0.5 truncate text-base font-semibold">
            {attempt.test_set_type ? localizeTestName(t, attempt.test_set_type, attempt.test_set_name || "") : (attempt.test_set_name || t("continueBanner.name"))}
            <ModeBadge label={modeLabel} />
          </p>
          <p className="mt-0.5 text-xs opacity-80">
            {t("continueBanner.progress", { answered: attempt.answered_count, total: attempt.total })}
          </p>
        </div>
        <ContinueButton href={`/${path}/${attempt.id}`} />
      </BannerShell>
    );
  }

  // ── Speed drill (等级练习) ──
  if (item.kind === "drill") {
    const drill = item.data;
    const pct = drill.total > 0 ? Math.round((drill.answered_count / drill.total) * 100) : 0;
    return (
      <BannerShell onDismiss={() => setItem(null)}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium opacity-90">{t("speedDrill.inProgress")}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium opacity-80">
              {drill.answered_count}/{drill.total}
            </span>
          </div>
        </div>
        <ContinueButton href={`/practice/${drill.attempt_id}`} />
      </BannerShell>
    );
  }

  // ── Speaking practice (pronunciation) ──
  if (item.kind === "speaking") {
    const sa = item.data;
    return (
      <BannerShell onDismiss={() => setItem(null)}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium opacity-90">{t("continueBanner.title")}</p>
          <p className="mt-0.5 truncate text-base font-semibold">
            {sa.test_set_name || t("common.types.speaking")}
            <ModeBadge label={t("common.types.speaking")} />
          </p>
        </div>
        <ContinueButton href="/speaking-practice" />
      </BannerShell>
    );
  }

  // ── Speaking conversation (AI dialogue) ──
  if (item.kind === "conversation") {
    const conv = item.data;
    const label = `Tâche ${conv.tache_type}`;
    return (
      <BannerShell onDismiss={() => setItem(null)}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium opacity-90">{t("continueBanner.title")}</p>
          <p className="mt-0.5 truncate text-base font-semibold">
            {label}
            {conv.scene_briefing?.scenario && (
              <span className="ml-1 text-sm font-normal opacity-80">
                — {conv.scene_briefing.scenario.slice(0, 40)}{conv.scene_briefing.scenario.length > 40 ? "…" : ""}
              </span>
            )}
            <ModeBadge label={t("continueBanner.conversation")} />
          </p>
          <p className="mt-0.5 text-xs opacity-80">
            {t("continueBanner.turns", { count: conv.turn_count })}
          </p>
        </div>
        <ContinueButton href={`/speaking-conversation?resume=${conv.id}`} />
      </BannerShell>
    );
  }

  // ── Writing exam ──
  if (item.kind === "writingExam") {
    const we = item.data;
    return (
      <BannerShell onDismiss={() => setItem(null)}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium opacity-90">{t("continueBanner.title")}</p>
          <p className="mt-0.5 truncate text-base font-semibold">
            {t("common.types.writing")}
            <ModeBadge label={t("common.modes.exam")} />
          </p>
        </div>
        <ContinueButton href={`/writing-exam/${we.id}`} />
      </BannerShell>
    );
  }

  return null;
}

// ── Shared sub-components ──

function BannerShell({ children, onDismiss }: { children: React.ReactNode; onDismiss: () => void }) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground shadow-md">
      <div className="flex items-center justify-between gap-4">
        {children}
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ContinueButton({ href }: { href: string }) {
  const t = useTranslations();
  return (
    <Button asChild size="sm" variant="secondary" className="shrink-0 font-semibold">
      <Link href={href}>
        <Play className="me-1.5 h-4 w-4" />
        {t("continueBanner.continue")}
      </Link>
    </Button>
  );
}

function ModeBadge({ label }: { label: string }) {
  return (
    <span className="ml-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
      {label}
    </span>
  );
}
