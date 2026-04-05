"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Play short UI feedback sounds for correct/wrong answers in practice mode.
 *
 * Synthesized via Web Audio API — no mp3 files, no licensing, tight control
 * over tone/envelope. Both sounds are under 200ms and deliberately subdued
 * to fit a serious exam-prep product (not Duolingo-loud).
 *
 * Respects user preference (`user.sound_enabled`), stays silent when the
 * tab is hidden, and auto-lazy-inits the AudioContext on first play (browsers
 * block AudioContext creation outside user-gesture handlers).
 */
export function useSoundEffect() {
  const soundEnabled = useAuthStore((s) => s.user?.sound_enabled ?? true);
  const ctxRef = useRef<AudioContext | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      try {
        ctxRef.current = new Ctor();
      } catch {
        return null;
      }
    }
    // Resume if suspended (happens after user navigates away and back)
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  /**
   * Play a short pleasant two-note ascending arpeggio (C5 → G5).
   * Rewarding without being childish.
   */
  const playCorrect = useCallback(() => {
    if (!soundEnabled) return;
    if (typeof document !== "undefined" && document.hidden) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes: Array<{ freq: number; start: number; dur: number }> = [
      { freq: 523.25, start: 0, dur: 0.08 }, // C5
      { freq: 783.99, start: 0.08, dur: 0.12 }, // G5
    ];

    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = n.freq;
      const t0 = now + n.start;
      const t1 = t0 + n.dur;
      // Soft attack (5ms) → peak 0.18 → exponential decay to 0.0001
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t1 + 0.02);
    }
  }, [soundEnabled, getContext]);

  /**
   * Play a soft low-pitched "thud" (A3, 220Hz) — gentle feedback without
   * shame. Not descending, not a buzzer.
   */
  const playWrong = useCallback(() => {
    if (!soundEnabled) return;
    if (typeof document !== "undefined" && document.hidden) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 220; // A3
    // Soft attack → peak 0.22 → longer exponential decay (warm thud)
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }, [soundEnabled, getContext]);

  return { playCorrect, playWrong, soundEnabled };
}
