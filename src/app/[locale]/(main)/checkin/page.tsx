"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useTranslations } from "next-intl";
import { Download, Loader2, Check, BookOpen, CalendarDays, Share2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { CheckinPoster } from "@/components/checkin/checkin-poster";
import { fetchDailyCheckin, type DailyCheckinData } from "@/lib/api/stats";
import { getAttemptProgress, type ProgressResponse } from "@/lib/api/attempts";

export default function CheckinPage() {
  const t = useTranslations("checkin");
  const router = useRouter();
  const posterRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<DailyCheckinData | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchDailyCheckin().catch(() => null),
      getAttemptProgress().catch(() => null),
    ]).then(([checkin, prog]) => {
      setData(checkin);
      setProgress(prog);
      setLoading(false);
    });
  }, []);

  const hasActivity =
    data &&
    (data.listening.questions_answered > 0 ||
      data.reading.questions_answered > 0 ||
      data.writing.tasks_completed > 0 ||
      data.speaking.practice_count > 0 ||
      data.speaking.conversation_count > 0 ||
      (data.speed_drill?.questions_answered ?? 0) > 0 ||
      data.vocabulary_saved > 0 ||
      (data.words_looked_up ?? 0) > 0 ||
      (data.wrong_reviews ?? 0) > 0);

  const generateBlob = async (): Promise<Blob> => {
    const dataUrl = await toPng(posterRef.current!, {
      width: 1080,
      height: 1440,
      pixelRatio: 1,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  };

  const handleSave = async () => {
    if (!posterRef.current) return;
    setSaving(true);
    setSaved(false);
    try {
      const dataUrl = await toPng(posterRef.current, {
        width: 1080,
        height: 1440,
        pixelRatio: 1,
      });
      const link = document.createElement("a");
      link.download = `hitcf-checkin-${data?.date || "today"}.png`;
      link.href = dataUrl;
      link.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleShare = async () => {
    if (!posterRef.current) return;
    setSharing(true);
    try {
      const blob = await generateBlob();
      const file = new File([blob], `hitcf-checkin-${data?.date || "today"}.png`, {
        type: "image/png",
      });
      await navigator.share({
        files: [file],
        title: t("shareTitle"),
        text: t("shareText"),
      });
    } catch (err) {
      // User cancelled or API not supported — ignore
      if (err instanceof Error && err.name !== "AbortError") {
        // Fallback: save instead
        handleSave();
      }
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasActivity) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground/60 mb-6" />
        <h1 className="text-2xl font-bold mb-3">{t("emptyTitle")}</h1>
        <p className="text-muted-foreground mb-8">{t("emptyDescription")}</p>
        <Button size="lg" onClick={() => router.push("/tests")}>
          <BookOpen className="mr-2 h-5 w-5" />
          {t("startPractice")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">{t("pageTitle")}</h1>

      {/* Poster preview — scaled to fit */}
      <div
        className="relative w-full overflow-hidden rounded-lg border bg-muted"
        style={{ aspectRatio: "3 / 4" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 1080,
              height: 1440,
              transform: "scale(var(--s))",
              transformOrigin: "top left",
            }}
            ref={(el) => {
              if (el) {
                const parent = el.parentElement;
                if (parent) {
                  const s = parent.clientWidth / 1080;
                  el.style.setProperty("--s", String(s));
                }
              }
            }}
          >
            <CheckinPoster ref={posterRef} data={data!} progress={progress} />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        {canShare ? (
          /* Mobile: share button (iOS save-to-photos via share sheet) */
          <Button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1"
            size="lg"
          >
            {sharing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            {t("saveImage")}
          </Button>
        ) : (
          /* Desktop: download as file */
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
            size="lg"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {saved ? t("saved") : t("saveImage")}
          </Button>
        )}
      </div>

    </div>
  );
}
