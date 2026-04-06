"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, X, Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { AttemptReview } from "@/lib/api/types";
import { localizeTestName } from "@/lib/test-name";

/* ── helpers ─────────────────────────────────────────────── */

function useBase64Image(src: string): string {
  const [dataUrl, setDataUrl] = useState(src);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      setDataUrl(c.toDataURL("image/png"));
    };
    img.src = src;
  }, [src]);
  return dataUrl;
}

function getEncouragement(pct: number, t: (k: string) => string) {
  if (pct >= 90) return { emoji: "\u{1F3C6}", msg: t("excellent"), color: "#a855f7" };
  if (pct >= 75) return { emoji: "\u{1F389}", msg: t("great"), color: "#3b82f6" };
  if (pct >= 60) return { emoji: "\u{1F4AA}", msg: t("good"), color: "#22c55e" };
  if (pct >= 40) return { emoji: "\u{1F525}", msg: t("progress"), color: "#f59e0b" };
  return { emoji: "\u{1F4A1}", msg: t("keepGoing"), color: "#ef4444" };
}

/* ── card poster (rendered offscreen for html-to-image) ── */

interface CardProps {
  attempt: AttemptReview;
  displayName: string;
  scorePct: number;
  logoSrc: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (k: string, v?: any) => string;
}

function CardPoster({ attempt, displayName, scorePct, logoSrc, t }: CardProps) {
  const enc = getEncouragement(scorePct, t);
  const dateStr = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })
    : new Date().toLocaleDateString("zh-CN");
  const modeLabel =
    attempt.mode === "exam" ? t("modeExam")
      : attempt.mode === "speed_drill" ? t("modeSpeedDrill")
        : t("modePractice");

  return (
    <div
      style={{
        width: 720,
        height: 960,
        background: "linear-gradient(160deg, #0d0117 0%, #1a0a2e 25%, #2d1154 50%, #4a1942 75%, #1a0a2e 100%)",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: 120, left: "50%", transform: "translateX(-50%)",
        width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${enc.color}40 0%, ${enc.color}15 40%, transparent 70%)`,
        pointerEvents: "none", filter: "blur(40px)",
      }} />

      {/* Brand bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "36px 44px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="HiTCF" width={56} height={56} style={{ borderRadius: 10 }} />
          <span style={{ fontSize: 32, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>HiTCF</span>
        </div>
        <span style={{ fontSize: 24, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{dateStr}</span>
      </div>

      {/* Mode badge */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
        <div style={{
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 50, padding: "8px 24px", fontSize: 20, fontWeight: 600,
          color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em",
        }}>
          {modeLabel}
        </div>
      </div>

      {/* Test name */}
      <div style={{
        textAlign: "center", padding: "20px 44px 0", fontSize: 36, fontWeight: 700,
        color: "rgba(255,255,255,0.85)", lineHeight: 1.3,
      }}>
        {displayName}
      </div>

      {/* Giant score */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "36px 44px 16px",
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{enc.emoji}</div>
        <div style={{
          fontSize: 120, fontWeight: 900, lineHeight: 1, color: "#ffffff",
          textShadow: `0 0 60px ${enc.color}80, 0 0 120px ${enc.color}40`,
        }}>
          {scorePct}%
        </div>
        <div style={{
          fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginTop: 12,
        }}>
          {attempt.score}/{attempt.total} {t("correct")}
        </div>
      </div>

      {/* Encouragement */}
      <div style={{
        textAlign: "center", fontSize: 32, fontWeight: 700,
        color: enc.color, letterSpacing: "0.05em", padding: "0 44px",
      }}>
        {enc.msg}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom brand */}
      <div style={{
        padding: "0 44px 28px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 200, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 28 }}>
          <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>hitcf.com</span>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>|</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>{t("tagline")}</span>
        </div>
      </div>
    </div>
  );
}

/* ── modal with flip animation ───────────────────────── */

interface ResultsCheckinModalProps {
  attempt: AttemptReview;
  onClose: () => void;
}

export function ResultsCheckinModal({ attempt, onClose }: ResultsCheckinModalProps) {
  const t = useTranslations("checkinCard");
  const tCommon = useTranslations();
  const posterRef = useRef<HTMLDivElement>(null);
  const logoSrc = useBase64Image("/logo.png");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [visible, setVisible] = useState(false);

  const scorePct = attempt.total > 0 ? Math.round(((attempt.score ?? 0) / attempt.total) * 100) : 0;
  const isSpeedDrill = attempt.mode === "speed_drill";
  const displayName = isSpeedDrill
    ? tCommon("common.modes.speed_drill")
    : attempt.test_set_type && attempt.test_set_name
      ? localizeTestName(tCommon, attempt.test_set_type, attempt.test_set_name)
      : (attempt.test_set_name || "");

  // Trigger entrance animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

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
      const dataUrl = await toPng(posterRef.current, { width: 720, height: 960, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `hitcf-result-${attempt.id}.png`;
      link.href = dataUrl;
      link.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setSaving(false);
    }
  }, [attempt.id]);

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleShare = useCallback(async () => {
    if (!posterRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(posterRef.current, { width: 720, height: 960, pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `hitcf-result-${attempt.id}.png`, { type: "image/png" });
      await navigator.share({ files: [file], title: t("shareTitle"), text: t("shareText") });
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") handleSave();
    } finally {
      setSharing(false);
    }
  }, [attempt.id, t, handleSave]);

  return (
    <>
      {/* Offscreen poster for image generation */}
      <div style={{ position: "fixed", left: -9999, top: 0 }} aria-hidden>
        <div ref={posterRef}>
          <CardPoster
            attempt={attempt}
            displayName={displayName}
            scorePct={scorePct}
            logoSrc={logoSrc}
            t={t}
          />
        </div>
      </div>

      {/* Modal overlay */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${visible ? "bg-black/60 backdrop-blur-sm" : "bg-transparent"}`}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Card with flip animation */}
        <div
          className="relative"
          style={{
            perspective: "1200px",
          }}
        >
          <div
            style={{
              transform: visible ? "rotateY(720deg) scale(1)" : "rotateY(0deg) scale(0.3)",
              opacity: visible ? 1 : 0,
              transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Visual preview card (scaled down from 720x960 poster) */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20"
              style={{ width: 320, height: 427 }}
            >
              <div style={{
                transform: `scale(${320 / 720})`,
                transformOrigin: "top left",
                width: 720,
                height: 960,
              }}>
                <CardPoster
                  attempt={attempt}
                  displayName={displayName}
                  scorePct={scorePct}
                  logoSrc={logoSrc}
                  t={t}
                />
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
                  variant="outline"
                  className="gap-2 border-white/30 text-white hover:bg-white/10"
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
}
