"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Full-screen watermark overlay rendered via canvas → CSS background-image.
 *
 * Content pages: brand "HiTCF.com" (subtle) + hidden user ID.
 * All other pages: hidden user ID only (no brand).
 *
 * Protected by MutationObserver against DevTools removal.
 */

// Routes where brand watermark is visible (content worth protecting)
const CONTENT_PREFIXES = [
  "/practice/", "/exam/", "/results/", "/tests",
  "/writing-practice/", "/writing-exam/",
  "/speaking-practice", "/speaking-conversation",
  "/vocabulary", "/wrong-answers", "/speed-drill",
];

function isContentPage(pathname: string): boolean {
  // Strip locale prefix (e.g. /en/practice/... → /practice/...)
  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/)/, "");
  return CONTENT_PREFIXES.some((p) => stripped.startsWith(p));
}

export function WatermarkOverlay() {
  const user = useAuthStore((s) => s.user);
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const contentPage = isContentPage(pathname);

  const generateWatermark = useCallback((): string | null => {
    if (!user) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const tileW = 440;
    const tileH = 260;
    canvas.width = tileW;
    canvas.height = tileH;

    const showIdentity = user.watermark_visible ?? false;
    const isDark = resolvedTheme === "dark";
    const rgb = isDark ? "255, 255, 255" : "0, 0, 0";
    const identityOpacity = showIdentity ? 0.06 : 0.018;

    ctx.clearRect(0, 0, tileW, tileH);
    ctx.save();
    ctx.translate(tileW / 2, tileH / 2);
    ctx.rotate((-22 * Math.PI) / 180);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Brand — only on content pages
    if (contentPage) {
      ctx.font = "600 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = `rgba(${rgb}, 0.09)`;
      ctx.fillText("HiTCF.com", 0, -20);
    }

    // User identity (hidden) — on ALL pages
    const uid = user.id.slice(-8);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = `rgba(${rgb}, ${identityOpacity})`;
    ctx.fillText(uid, 0, contentPage ? 8 : -4);
    ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(ts, 0, contentPage ? 24 : 12);

    ctx.restore();
    return canvas.toDataURL("image/png");
  }, [user, resolvedTheme, contentPage]);

  const applyWatermark = useCallback(() => {
    const el = overlayRef.current;
    if (!el) return;
    const dataUrl = generateWatermark();
    if (!dataUrl) return;

    el.style.cssText = [
      "position:fixed",
      "inset:0",
      "pointer-events:none",
      "z-index:9999",
      `background-image:url(${dataUrl})`,
      "background-repeat:repeat",
      "print-color-adjust:exact",
      "-webkit-print-color-adjust:exact",
    ].join(";");
  }, [generateWatermark]);

  useEffect(() => {
    if (!user) return;
    applyWatermark();

    // Refresh timestamp every 5 minutes
    const timer = setInterval(applyWatermark, 5 * 60 * 1000);

    // MutationObserver: re-attach if overlay is removed via DevTools
    const parent = overlayRef.current?.parentElement;
    if (parent) {
      observerRef.current = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type !== "childList") continue;
          const removed = Array.from(m.removedNodes);
          if (removed.includes(overlayRef.current as Node)) {
            parent.appendChild(overlayRef.current as Node);
            applyWatermark();
            return;
          }
        }
      });
      observerRef.current.observe(parent, { childList: true });
    }

    return () => {
      clearInterval(timer);
      observerRef.current?.disconnect();
    };
  }, [user, applyWatermark]);

  if (!user) return null;

  return <div ref={overlayRef} data-watermark aria-hidden="true" />;
}
