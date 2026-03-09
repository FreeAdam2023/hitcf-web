"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Full-screen watermark overlay rendered via canvas → CSS background-image.
 *
 * Brand "HiTCF.com" is always subtly visible.
 * User identity (name + timestamp) controlled by backend `watermark_visible`:
 * - false (default): identity imperceptible (opacity ~0.018)
 * - true: identity subtly visible (opacity ~0.06)
 *
 * Protected by MutationObserver against DevTools removal.
 */
export function WatermarkOverlay() {
  const user = useAuthStore((s) => s.user);
  const { resolvedTheme } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const generateWatermark = useCallback((): string | null => {
    if (!user) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const tileW = 320;
    const tileH = 200;
    canvas.width = tileW;
    canvas.height = tileH;

    const showIdentity = user.watermark_visible ?? false;
    const isDark = resolvedTheme === "dark";
    const rgb = isDark ? "255, 255, 255" : "0, 0, 0";
    const brandOpacity = 0.06;
    const identityOpacity = showIdentity ? 0.06 : 0.018;

    ctx.clearRect(0, 0, tileW, tileH);
    ctx.save();
    ctx.translate(tileW / 2, tileH / 2);
    ctx.rotate((-22 * Math.PI) / 180);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Brand — always subtly visible
    ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = `rgba(${rgb}, ${brandOpacity})`;
    ctx.fillText("HiTCF.com", 0, -16);

    // User identity — hidden by default, visible when admin enables
    const name = user.name || user.email.split("@")[0];
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = `rgba(${rgb}, ${identityOpacity})`;
    ctx.fillText(name, 0, 2);
    ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(ts, 0, 18);

    ctx.restore();
    return canvas.toDataURL("image/png");
  }, [user, resolvedTheme]);

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
