"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

/**
 * Synthesize a short firework "pop + sparkle" sound using Web Audio API.
 * No external audio file needed.
 */
function playFireworkSound() {
  try {
    const ctx = new AudioContext();

    // --- Layer 1: Low "boom" sweep ---
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = "sine";
    boom.connect(boomGain);
    boomGain.connect(ctx.destination);
    boom.frequency.setValueAtTime(300, ctx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
    boomGain.gain.setValueAtTime(0.25, ctx.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    boom.start(ctx.currentTime);
    boom.stop(ctx.currentTime + 0.3);

    // --- Layer 2: White noise "crackle" burst ---
    const noiseDuration = 0.6;
    const bufferSize = Math.floor(ctx.sampleRate * noiseDuration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.08));
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 3000;
    noiseFilter.Q.value = 0.5;
    noise.buffer = buffer;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.18, ctx.currentTime + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + noiseDuration);
    noise.start(ctx.currentTime + 0.03);

    // --- Layer 3: High-frequency "sparkle" pops ---
    for (let i = 0; i < 8; i++) {
      const delay = 0.08 + Math.random() * 0.5;
      const sparkOsc = ctx.createOscillator();
      const sparkGain = ctx.createGain();
      sparkOsc.type = "sine";
      sparkOsc.connect(sparkGain);
      sparkGain.connect(ctx.destination);
      const freq = 1800 + Math.random() * 4000;
      sparkOsc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      sparkOsc.frequency.exponentialRampToValueAtTime(
        freq * 0.3,
        ctx.currentTime + delay + 0.12,
      );
      sparkGain.gain.setValueAtTime(0.06, ctx.currentTime + delay);
      sparkGain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + delay + 0.12,
      );
      sparkOsc.start(ctx.currentTime + delay);
      sparkOsc.stop(ctx.currentTime + delay + 0.12);
    }

    // Cleanup
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Silently fail if AudioContext is unavailable
  }
}

/** Score-based confetti intensity */
function fireConfetti(scorePercent: number) {
  const duration = scorePercent >= 80 ? 3000 : scorePercent >= 60 ? 2000 : 1200;
  const particleCount = scorePercent >= 80 ? 80 : scorePercent >= 60 ? 50 : 25;

  const colors =
    scorePercent >= 80
      ? ["#FFD700", "#FFA500", "#FF6347", "#00CED1", "#7B68EE"]
      : scorePercent >= 60
        ? ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"]
        : ["#94a3b8", "#cbd5e1", "#a78bfa"];

  const end = Date.now() + duration;

  function frame() {
    // Left side
    confetti({
      particleCount: Math.floor(particleCount / 3),
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 9999,
    });
    // Right side
    confetti({
      particleCount: Math.floor(particleCount / 3),
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }

  // Initial center burst
  confetti({
    particleCount: particleCount * 2,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
    colors,
    zIndex: 9999,
  });

  // Then side streams
  frame();

  // Extra starburst for high scores
  if (scorePercent >= 80) {
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 160,
        origin: { x: 0.5, y: 0.35 },
        colors: ["#FFD700", "#FFA500", "#FF4500"],
        zIndex: 9999,
        scalar: 1.2,
        gravity: 0.8,
      });
    }, 800);
  }
}

/**
 * Fires confetti + firework sound on mount. Intensity varies by score.
 *
 * @param scorePercent - 0–100. Pass undefined to skip.
 */
export function useCelebration(scorePercent: number | undefined) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (scorePercent === undefined || firedRef.current) return;
    firedRef.current = true;

    // Small delay so the page paints first
    const timer = setTimeout(() => {
      fireConfetti(scorePercent);
      playFireworkSound();
    }, 400);

    return () => clearTimeout(timer);
  }, [scorePercent]);
}
