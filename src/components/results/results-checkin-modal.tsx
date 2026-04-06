"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { Download, Share2, X, Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckinPoster } from "@/components/checkin/checkin-poster";
import { fetchDailyCheckin, type DailyCheckinData } from "@/lib/api/stats";
import { getAttemptProgress, type ProgressResponse } from "@/lib/api/attempts";

/* ── poster dimensions ─────────────────────────────────── */

const POSTER_W = 1080;
const POSTER_H = 1440;
const PREVIEW_W = 300;
const PREVIEW_H = PREVIEW_W * (POSTER_H / POSTER_W); // 400

/* ── modal with flip animation ───────────────────────── */

interface ResultsCheckinModalProps {
  onClose: () => void;
}

export function ResultsCheckinModal({ onClose }: ResultsCheckinModalProps) {
  const t = useTranslations("checkinCard");
  const posterRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [visible, setVisible] = useState(false);

  const [checkinData, setCheckinData] = useState<DailyCheckinData | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch daily checkin data
  useEffect(() => {
    Promise.all([
      fetchDailyCheckin().catch(() => null),
      getAttemptProgress().catch(() => null),
    ]).then(([checkin, prog]) => {
      setCheckinData(checkin);
      setProgress(prog);
      setDataLoaded(true);
    });
  }, []);

  // Trigger entrance animation after data loads
  useEffect(() => {
    if (!dataLoaded || !checkinData) return;
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [dataLoaded, checkinData]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (!posterRef.current) return;
    setSaving(true);
    setSaved(false);
    try {
      const dataUrl = await toPng(posterRef.current, { width: POSTER_W, height: POSTER_H, pixelRatio: 1 });
      const link = document.createElement("a");
      link.download = `hitcf-checkin-${checkinData?.date || "today"}.png`;
      link.href = dataUrl;
      link.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setSaving(false);
    }
  }, [checkinData?.date]);

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleShare = useCallback(async () => {
    if (!posterRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(posterRef.current, { width: POSTER_W, height: POSTER_H, pixelRatio: 1 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `hitcf-checkin-${checkinData?.date || "today"}.png`, { type: "image/png" });
      await navigator.share({ files: [file], title: t("shareTitle"), text: t("shareText") });
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") handleSave();
    } finally {
      setSharing(false);
    }
  }, [checkinData?.date, t, handleSave]);

  // Portal to document.body so `fixed` positioning isn't broken by
  // ancestor transforms (MainContainer uses animate-fade-in-up which
  // applies transform and creates a new containing block).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Don't render until data is loaded; hide if no activity today
  if (!mounted || !dataLoaded) return null;
  if (!checkinData) return null;

  const content = (
    <>
      {/* Offscreen poster for image generation */}
      <div style={{ position: "fixed", left: -9999, top: 0 }} aria-hidden>
        <CheckinPoster ref={posterRef} data={checkinData} progress={progress} />
      </div>

      {/* Modal overlay */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${visible ? "bg-black/60 backdrop-blur-sm" : "bg-transparent"}`}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Card with flip animation */}
        <div
          className="relative"
          style={{ perspective: "1200px" }}
        >
          <div
            style={{
              transform: visible ? "rotateY(720deg) scale(1)" : "rotateY(0deg) scale(0.3)",
              opacity: visible ? 1 : 0,
              transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Visual preview card (scaled down from poster) */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20"
              style={{ width: PREVIEW_W, height: PREVIEW_H }}
            >
              <div style={{
                transform: `scale(${PREVIEW_W / POSTER_W})`,
                transformOrigin: "top left",
                width: POSTER_W,
                height: POSTER_H,
              }}>
                <CheckinPoster data={checkinData} progress={progress} />
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="flex items-center justify-center gap-3 mt-4"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.5s ease 1s",
              }}
            >
              <Button
                size="sm"
                className="gap-2 bg-white text-black hover:bg-white/90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {saved ? t("saved") : t("saveImage")}
              </Button>
              {canShare && (
                <Button
                  size="sm"
                  className="gap-2 bg-white/20 text-white border border-white/40 hover:bg-white/30"
                  onClick={handleShare}
                  disabled={sharing}
                >
                  {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                  {t("share")}
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
