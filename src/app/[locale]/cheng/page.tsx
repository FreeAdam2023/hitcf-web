"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  trail: { x: number; y: number; alpha: number }[];
  type: "spark" | "glitter" | "willow";
}

interface Firework {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
  launched: boolean;
}

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Car {
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
  color: string;
  honking: number; // frames remaining for honk animation
  launchCooldown: number;
}

const CAR_COLORS = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#e9c46a"];

// ─── Color palettes ────────────────────────────────────────────
const PALETTES = [
  ["#ff4444", "#ff6666", "#ff8888", "#ffaaaa", "#ff2222"],
  ["#44ff44", "#66ff66", "#88ff88", "#aaffaa", "#22ff22"],
  ["#4444ff", "#6666ff", "#8888ff", "#aaaaff", "#2222ff"],
  ["#ffff44", "#ffff66", "#ffff88", "#ffffaa", "#ffdd22"],
  ["#ff44ff", "#ff66ff", "#ff88ff", "#ffaaff", "#ff22ff"],
  ["#44ffff", "#66ffff", "#88ffff", "#aaffff", "#22ffff"],
  ["#ff8800", "#ffaa00", "#ffcc00", "#ffee00", "#ff6600"],
  ["#ff4488", "#ff66aa", "#ff88cc", "#ffaaee", "#ff2266"],
  ["#FFD700", "#FFA500", "#FF6347", "#FF4500", "#FFEC8B"],
  ["#7B68EE", "#9370DB", "#BA55D3", "#DA70D6", "#EE82EE"],
];

// ─── Audio synthesis ────────────────────────────────────────────
function createAudioContext(): AudioContext | null {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}

// Classic (original) sounds — simple oscillator + noise
function playClassicLaunch(ctx: AudioContext) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(200 + Math.random() * 100, now);
  osc.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, now + 0.8);
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.start(now);
  osc.stop(now + 0.8);
}

function playClassicExplosion(ctx: AudioContext, intensity: number = 1) {
  const now = ctx.currentTime;
  // Boom
  const boom = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boom.type = "sine";
  boom.connect(boomGain);
  boomGain.connect(ctx.destination);
  boom.frequency.setValueAtTime(200 + Math.random() * 100, now);
  boom.frequency.exponentialRampToValueAtTime(40, now + 0.3);
  boomGain.gain.setValueAtTime(0.2 * intensity, now);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  boom.start(now);
  boom.stop(now + 0.4);
  // Crackle
  const noiseDuration = 0.8 * intensity;
  const bufferSize = Math.floor(ctx.sampleRate * noiseDuration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.06));
  }
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2500 + Math.random() * 2000;
  filter.Q.value = 0.4;
  noise.buffer = buffer;
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseGain.gain.setValueAtTime(0.15 * intensity, now + 0.05);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);
  noise.start(now + 0.05);
  // Sparkles
  for (let i = 0; i < 8; i++) {
    const delay = 0.1 + Math.random() * 0.6;
    const sparkOsc = ctx.createOscillator();
    const sparkGain = ctx.createGain();
    sparkOsc.type = "sine";
    sparkOsc.connect(sparkGain);
    sparkGain.connect(ctx.destination);
    const freq = 2000 + Math.random() * 5000;
    sparkOsc.frequency.setValueAtTime(freq, now + delay);
    sparkOsc.frequency.exponentialRampToValueAtTime(freq * 0.2, now + delay + 0.1);
    sparkGain.gain.setValueAtTime(0.04 * intensity, now + delay);
    sparkGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
    sparkOsc.start(now + delay);
    sparkOsc.stop(now + delay + 0.1);
  }
}

function playLaunchSound(ctx: AudioContext) {
  const now = ctx.currentTime;
  const duration = 0.9 + Math.random() * 0.4;

  // Whoosh: filtered noise sweeping upward (like a rocket whistle)
  const whooshLen = Math.floor(ctx.sampleRate * duration);
  const whooshBuf = ctx.createBuffer(1, whooshLen, ctx.sampleRate);
  const whooshData = whooshBuf.getChannelData(0);
  for (let i = 0; i < whooshLen; i++) {
    const t = i / whooshLen;
    // Noise with rising amplitude envelope then quick fade
    whooshData[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.8;
  }
  const whoosh = ctx.createBufferSource();
  whoosh.buffer = whooshBuf;
  const whooshFilter = ctx.createBiquadFilter();
  whooshFilter.type = "bandpass";
  whooshFilter.frequency.setValueAtTime(600, now);
  whooshFilter.frequency.exponentialRampToValueAtTime(3000 + Math.random() * 1500, now + duration);
  whooshFilter.Q.value = 2 + Math.random() * 3;
  const whooshGain = ctx.createGain();
  whooshGain.gain.setValueAtTime(0.08, now);
  whooshGain.gain.linearRampToValueAtTime(0.12, now + duration * 0.6);
  whooshGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  whoosh.connect(whooshFilter);
  whooshFilter.connect(whooshGain);
  whooshGain.connect(ctx.destination);
  whoosh.start(now);

  // Thin rising whistle tone
  const whistle = ctx.createOscillator();
  const whistleGain = ctx.createGain();
  whistle.type = "sine";
  whistle.frequency.setValueAtTime(400 + Math.random() * 200, now);
  whistle.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 800, now + duration * 0.9);
  whistleGain.gain.setValueAtTime(0.015, now);
  whistleGain.gain.linearRampToValueAtTime(0.04, now + duration * 0.5);
  whistleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  whistle.connect(whistleGain);
  whistleGain.connect(ctx.destination);
  whistle.start(now);
  whistle.stop(now + duration);
}

function playExplosionSound(ctx: AudioContext, intensity: number = 1) {
  const now = ctx.currentTime;

  // Layer 1: Deep boom with reverb-like tail
  const boomDuration = 0.6;
  const boomLen = Math.floor(ctx.sampleRate * boomDuration);
  const boomBuf = ctx.createBuffer(1, boomLen, ctx.sampleRate);
  const boomData = boomBuf.getChannelData(0);
  for (let i = 0; i < boomLen; i++) {
    const t = i / ctx.sampleRate;
    // Low-frequency thump with exponential decay
    boomData[i] = Math.sin(2 * Math.PI * (60 + 80 * Math.exp(-t * 8)) * t)
      * Math.exp(-t * 5) * 0.9
      + (Math.random() * 2 - 1) * Math.exp(-t * 10) * 0.3;
  }
  const boom = ctx.createBufferSource();
  boom.buffer = boomBuf;
  const boomGain = ctx.createGain();
  boomGain.gain.value = 0.25 * intensity;
  const boomLowpass = ctx.createBiquadFilter();
  boomLowpass.type = "lowpass";
  boomLowpass.frequency.value = 300;
  boom.connect(boomLowpass);
  boomLowpass.connect(boomGain);
  boomGain.connect(ctx.destination);
  boom.start(now);

  // Layer 2: Mid-frequency burst (the "crack")
  const crackDuration = 0.3;
  const crackLen = Math.floor(ctx.sampleRate * crackDuration);
  const crackBuf = ctx.createBuffer(1, crackLen, ctx.sampleRate);
  const crackData = crackBuf.getChannelData(0);
  for (let i = 0; i < crackLen; i++) {
    crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (crackLen * 0.03));
  }
  const crack = ctx.createBufferSource();
  crack.buffer = crackBuf;
  const crackFilter = ctx.createBiquadFilter();
  crackFilter.type = "bandpass";
  crackFilter.frequency.value = 800 + Math.random() * 600;
  crackFilter.Q.value = 0.8;
  const crackGain = ctx.createGain();
  crackGain.gain.value = 0.18 * intensity;
  crack.connect(crackFilter);
  crackFilter.connect(crackGain);
  crackGain.connect(ctx.destination);
  crack.start(now + 0.01);

  // Layer 3: Extended crackle / sizzle tail (like embers falling)
  const sizzleDuration = 1.5 + Math.random() * 0.8;
  const sizzleLen = Math.floor(ctx.sampleRate * sizzleDuration);
  const sizzleBuf = ctx.createBuffer(1, sizzleLen, ctx.sampleRate);
  const sizzleData = sizzleBuf.getChannelData(0);
  for (let i = 0; i < sizzleLen; i++) {
    const t = i / sizzleLen;
    // Irregular crackle: bursts of noise with random gaps
    const burst = Math.random() < 0.15 ? 1 : 0.05;
    sizzleData[i] = (Math.random() * 2 - 1) * burst * Math.exp(-t * 2.5);
  }
  const sizzle = ctx.createBufferSource();
  sizzle.buffer = sizzleBuf;
  const sizzleFilter = ctx.createBiquadFilter();
  sizzleFilter.type = "highpass";
  sizzleFilter.frequency.value = 2000 + Math.random() * 2000;
  const sizzleGain = ctx.createGain();
  sizzleGain.gain.setValueAtTime(0.1 * intensity, now + 0.08);
  sizzleGain.gain.exponentialRampToValueAtTime(0.001, now + sizzleDuration);
  sizzle.connect(sizzleFilter);
  sizzleFilter.connect(sizzleGain);
  sizzleGain.connect(ctx.destination);
  sizzle.start(now + 0.08);

  // Layer 4: Distant echo / reverb tail
  const echoDuration = 1.2;
  const echoLen = Math.floor(ctx.sampleRate * echoDuration);
  const echoBuf = ctx.createBuffer(1, echoLen, ctx.sampleRate);
  const echoData = echoBuf.getChannelData(0);
  for (let i = 0; i < echoLen; i++) {
    const t = i / ctx.sampleRate;
    echoData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 3) * 0.4;
  }
  const echo = ctx.createBufferSource();
  echo.buffer = echoBuf;
  const echoFilter = ctx.createBiquadFilter();
  echoFilter.type = "lowpass";
  echoFilter.frequency.value = 600;
  const echoGain = ctx.createGain();
  echoGain.gain.value = 0.06 * intensity;
  echo.connect(echoFilter);
  echoFilter.connect(echoGain);
  echoGain.connect(ctx.destination);
  echo.start(now + 0.15);

  // Layer 5: Random pop/snap sparkles
  const popCount = Math.floor(4 + Math.random() * 8);
  for (let i = 0; i < popCount; i++) {
    const delay = 0.2 + Math.random() * 1.2;
    const popLen = Math.floor(ctx.sampleRate * 0.03);
    const popBuf = ctx.createBuffer(1, popLen, ctx.sampleRate);
    const popData = popBuf.getChannelData(0);
    for (let j = 0; j < popLen; j++) {
      popData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (popLen * 0.1));
    }
    const pop = ctx.createBufferSource();
    pop.buffer = popBuf;
    const popFilter = ctx.createBiquadFilter();
    popFilter.type = "bandpass";
    popFilter.frequency.value = 3000 + Math.random() * 4000;
    popFilter.Q.value = 3 + Math.random() * 5;
    const popGain = ctx.createGain();
    popGain.gain.value = (0.03 + Math.random() * 0.05) * intensity;
    pop.connect(popFilter);
    popFilter.connect(popGain);
    popGain.connect(ctx.destination);
    pop.start(now + delay);
  }
}

// ─── Car drawing ────────────────────────────────────────────────
function drawCar(ctx: CanvasRenderingContext2D, car: Car, scale: number) {
  const { x, y, direction, color } = car;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction, 1);

  const s = scale;

  // Shadow under car
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 4 * s, 38 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Car body (lower)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-36 * s, -18 * s, 72 * s, 18 * s, [4 * s, 4 * s, 3 * s, 3 * s]);
  ctx.fill();

  // Car body (cabin/roof)
  ctx.beginPath();
  ctx.moveTo(-18 * s, -18 * s);
  ctx.lineTo(-12 * s, -32 * s);
  ctx.lineTo(16 * s, -32 * s);
  ctx.lineTo(24 * s, -18 * s);
  ctx.closePath();
  ctx.fill();

  // Windows
  ctx.fillStyle = "rgba(150, 200, 255, 0.6)";
  // Front window
  ctx.beginPath();
  ctx.moveTo(4 * s, -19 * s);
  ctx.lineTo(8 * s, -30 * s);
  ctx.lineTo(15 * s, -30 * s);
  ctx.lineTo(22 * s, -19 * s);
  ctx.closePath();
  ctx.fill();
  // Rear window
  ctx.beginPath();
  ctx.moveTo(-16 * s, -19 * s);
  ctx.lineTo(-11 * s, -30 * s);
  ctx.lineTo(2 * s, -30 * s);
  ctx.lineTo(2 * s, -19 * s);
  ctx.closePath();
  ctx.fill();

  // Bumpers
  ctx.fillStyle = "#888";
  ctx.fillRect(-38 * s, -8 * s, 4 * s, 8 * s);
  ctx.fillRect(34 * s, -8 * s, 4 * s, 8 * s);

  // Headlights
  ctx.fillStyle = car.honking > 0 ? "#ffffff" : "#ffee88";
  ctx.beginPath();
  ctx.arc(36 * s, -12 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  // Headlight glow
  if (car.honking > 0 || true) {
    ctx.fillStyle = `rgba(255, 238, 136, ${0.08 + (car.honking > 0 ? 0.1 : 0)})`;
    ctx.beginPath();
    ctx.moveTo(36 * s, -16 * s);
    ctx.lineTo(36 * s + 80 * s, -30 * s);
    ctx.lineTo(36 * s + 80 * s, 5 * s);
    ctx.lineTo(36 * s, -6 * s);
    ctx.closePath();
    ctx.fill();
  }

  // Tail lights
  ctx.fillStyle = "#ff3333";
  ctx.beginPath();
  ctx.arc(-36 * s, -12 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(-20 * s, 2 * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20 * s, 2 * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();
  // Hubcaps
  ctx.fillStyle = "#666";
  ctx.beginPath();
  ctx.arc(-20 * s, 2 * s, 3.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20 * s, 2 * s, 3.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Honk effect (sound waves)
  if (car.honking > 0) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${car.honking / 30 * 0.5})`;
    ctx.lineWidth = 1.5 * s;
    for (let i = 1; i <= 3; i++) {
      const r = 10 * s + i * 8 * s * (1 - car.honking / 30);
      ctx.globalAlpha = car.honking / 30 * (1 - i * 0.25);
      ctx.beginPath();
      ctx.arc(38 * s, -15 * s, r, -0.6, 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function playHonkSound(ctx: AudioContext) {
  const now = ctx.currentTime;
  // Two-tone honk (like a cute car horn)
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = i === 0 ? 440 : 554;
    gain.gain.setValueAtTime(0.08, now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.12);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.12);
  }
}

// ─── Drawing helpers ────────────────────────────────────────────
function drawSilhouettes(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number, glowIntensity: number) {
  const personScale = Math.min(w, h) / 800;

  // Ground hill
  ctx.fillStyle = `rgba(${10 + glowIntensity * 60}, ${10 + glowIntensity * 45}, ${15 + glowIntensity * 30}, 1)`;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.quadraticCurveTo(w * 0.25, groundY - 20 * personScale, w * 0.5, groundY - 5 * personScale);
  ctx.quadraticCurveTo(w * 0.75, groundY + 10 * personScale, w, groundY - 8 * personScale);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Grass tufts
  ctx.strokeStyle = `rgba(${20 + glowIntensity * 80}, ${30 + glowIntensity * 60}, ${15 + glowIntensity * 30}, 0.6)`;
  ctx.lineWidth = 1.5 * personScale;
  for (let i = 0; i < 30; i++) {
    const gx = Math.random() * w;
    const gy = groundY + Math.random() * 5 * personScale;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx + (Math.random() - 0.5) * 8 * personScale, gy - 12 * personScale, gx + (Math.random() - 0.5) * 4 * personScale, gy - 18 * personScale);
    ctx.stroke();
  }

  // Family silhouettes (center of screen)
  const cx = w * 0.5;
  const fillColor = `rgba(${5 + glowIntensity * 50}, ${5 + glowIntensity * 40}, ${8 + glowIntensity * 25}, 1)`;
  ctx.fillStyle = fillColor;

  // Adult 1 (left) - pointing up
  drawPerson(ctx, cx - 60 * personScale, groundY, 55 * personScale, true);
  // Adult 2 (right)
  drawPerson(ctx, cx + 50 * personScale, groundY, 52 * personScale, false);
  // Child (middle, smaller)
  drawChild(ctx, cx - 5 * personScale, groundY, 32 * personScale);
  // Small child on shoulders
  drawChildOnShoulders(ctx, cx + 50 * personScale, groundY, 52 * personScale, 22 * personScale);
}

function drawPerson(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, pointing: boolean) {
  const headR = height * 0.12;
  const bodyH = height * 0.4;
  const legH = height * 0.35;

  // Head
  ctx.beginPath();
  ctx.arc(x, y - height + headR, headR, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.moveTo(x - height * 0.12, y - height + headR * 2.2);
  ctx.lineTo(x + height * 0.12, y - height + headR * 2.2);
  ctx.lineTo(x + height * 0.1, y - height + headR * 2.2 + bodyH);
  ctx.lineTo(x - height * 0.1, y - height + headR * 2.2 + bodyH);
  ctx.closePath();
  ctx.fill();

  // Legs
  const legTop = y - height + headR * 2.2 + bodyH;
  ctx.beginPath();
  ctx.moveTo(x - height * 0.08, legTop);
  ctx.lineTo(x - height * 0.12, legTop + legH);
  ctx.lineTo(x - height * 0.04, legTop + legH);
  ctx.lineTo(x - height * 0.02, legTop);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + height * 0.02, legTop);
  ctx.lineTo(x + height * 0.04, legTop + legH);
  ctx.lineTo(x + height * 0.12, legTop + legH);
  ctx.lineTo(x + height * 0.08, legTop);
  ctx.closePath();
  ctx.fill();

  // Arm (pointing up if applicable)
  if (pointing) {
    ctx.lineWidth = height * 0.05;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.moveTo(x + height * 0.1, y - height + headR * 2.5);
    ctx.lineTo(x + height * 0.25, y - height - headR * 1.5);
    ctx.stroke();
  }
}

function drawChild(ctx: CanvasRenderingContext2D, x: number, y: number, height: number) {
  const headR = height * 0.15;

  // Head
  ctx.beginPath();
  ctx.arc(x, y - height + headR, headR, 0, Math.PI * 2);
  ctx.fill();

  // Body (rounder for child)
  ctx.beginPath();
  ctx.ellipse(x, y - height + headR * 2.5 + height * 0.2, height * 0.12, height * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  const legTop = y - height + headR * 2.5 + height * 0.4;
  ctx.beginPath();
  ctx.moveTo(x - height * 0.06, legTop);
  ctx.lineTo(x - height * 0.1, y);
  ctx.lineTo(x - height * 0.02, y);
  ctx.lineTo(x, legTop);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, legTop);
  ctx.lineTo(x + height * 0.02, y);
  ctx.lineTo(x + height * 0.1, y);
  ctx.lineTo(x + height * 0.06, legTop);
  ctx.closePath();
  ctx.fill();

  // Raised arms (excited!)
  ctx.lineWidth = height * 0.06;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.moveTo(x - height * 0.1, y - height + headR * 3);
  ctx.lineTo(x - height * 0.22, y - height - headR * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + height * 0.1, y - height + headR * 3);
  ctx.lineTo(x + height * 0.22, y - height - headR * 0.5);
  ctx.stroke();
}

function drawChildOnShoulders(ctx: CanvasRenderingContext2D, parentX: number, groundY: number, parentH: number, childH: number) {
  const x = parentX;
  const y = groundY - parentH - childH * 0.3;
  const headR = childH * 0.16;

  // Head
  ctx.beginPath();
  ctx.arc(x, y - childH + headR, headR, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.ellipse(x, y - childH + headR * 2.5 + childH * 0.15, childH * 0.1, childH * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (dangling)
  ctx.lineWidth = childH * 0.07;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.moveTo(x - childH * 0.08, y - childH * 0.2);
  ctx.lineTo(x - childH * 0.12, y + childH * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + childH * 0.08, y - childH * 0.2);
  ctx.lineTo(x + childH * 0.12, y + childH * 0.15);
  ctx.stroke();
}

// ─── Real audio file playback ───────────────────────────────────
const BOOM_FILES = ["/sounds/boom1.mp3", "/sounds/boom2.mp3", "/sounds/boom3.mp3"];

function playRealLaunch(srcs: string[]) {
  if (!srcs[0]) return;
  const a = new Audio(srcs[0]);
  a.volume = 0.25 + Math.random() * 0.15;
  a.playbackRate = 0.9 + Math.random() * 0.3;
  a.play().catch(() => {});
}

function playRealBoom(srcs: string[]) {
  const idx = Math.floor(Math.random() * srcs.length);
  if (!srcs[idx]) return;
  const a = new Audio(srcs[idx]);
  a.volume = 0.35 + Math.random() * 0.25;
  a.playbackRate = 0.85 + Math.random() * 0.3;
  a.play().catch(() => {});
}

type SoundMode = "realistic" | "cartoon" | "classic";

// ─── Main component ────────────────────────────────────────────
export default function ChengPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const carsRef = useRef<Car[]>([]);
  const glowRef = useRef(0);
  const frameRef = useRef(0);
  const lastAutoLaunchRef = useRef(0);
  const moonPosRef = useRef({ x: 0, y: 0, r: 0 });
  const [started, setStarted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [soundMode, setSoundMode] = useState<SoundMode>("realistic");
  const soundModeRef = useRef<SoundMode>("realistic");
  const launchSrcsRef = useRef<string[]>([]);
  const boomSrcsRef = useRef<string[]>([]);

  const launchFirework = useCallback((x?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const groundY = h * 0.85;

    const launchX = x ?? w * 0.2 + Math.random() * w * 0.6;
    const targetY = h * 0.1 + Math.random() * h * 0.35;
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

    const fw: Firework = {
      x: launchX,
      y: groundY,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(6 + Math.random() * 4),
      targetY,
      color: palette[Math.floor(Math.random() * palette.length)],
      trail: [],
      launched: false,
    };

    fireworksRef.current.push(fw);

    const mode = soundModeRef.current;
    if (mode === "realistic") {
      playRealLaunch(launchSrcsRef.current);
    } else if (audioCtxRef.current) {
      if (mode === "classic") playClassicLaunch(audioCtxRef.current);
      else playLaunchSound(audioCtxRef.current);
    }
  }, []);

  const explode = useCallback((x: number, y: number, color: string) => {
    const palette = PALETTES.find((p) => p.includes(color)) ?? PALETTES[0];
    const count = 80 + Math.floor(Math.random() * 80);
    const type = Math.random();

    for (let i = 0; i < count; i++) {
      let angle: number, speed: number;
      let particleType: Particle["type"] = "spark";

      if (type < 0.3) {
        // Chrysanthemum: even spread
        angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        speed = 3 + Math.random() * 4;
      } else if (type < 0.6) {
        // Peony: clustered with outer ring
        angle = Math.random() * Math.PI * 2;
        speed = i < count * 0.6 ? 2 + Math.random() * 3 : 4 + Math.random() * 3;
      } else if (type < 0.8) {
        // Willow: droopy trails
        angle = Math.random() * Math.PI * 2;
        speed = 2 + Math.random() * 3;
        particleType = "willow";
      } else {
        // Ring
        angle = (i / count) * Math.PI * 2;
        speed = 4 + Math.random() * 0.5;
        particleType = "glitter";
      }

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: particleType === "willow" ? 120 + Math.random() * 60 : 60 + Math.random() * 40,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: particleType === "glitter" ? 2.5 + Math.random() * 1.5 : 1.5 + Math.random() * 1.5,
        trail: [],
        type: particleType,
      });
    }

    // Glow flash
    glowRef.current = Math.min(glowRef.current + 0.8, 1);

    const mode = soundModeRef.current;
    if (mode === "realistic") {
      playRealBoom(boomSrcsRef.current);
    } else if (audioCtxRef.current) {
      const intensity = 0.6 + Math.random() * 0.4;
      if (mode === "classic") playClassicExplosion(audioCtxRef.current, intensity);
      else playExplosionSound(audioCtxRef.current, intensity);
    }
  }, []);

  const handleStart = useCallback(() => {
    audioCtxRef.current = createAudioContext();
    // Store audio file paths for realistic mode
    launchSrcsRef.current = ["/sounds/launch.mp3"];
    boomSrcsRef.current = BOOM_FILES;
    setStarted(true);
  }, []);

  const toggleSoundMode = useCallback(() => {
    setSoundMode((prev) => {
      const order: SoundMode[] = ["realistic", "cartoon", "classic"];
      const next = order[(order.indexOf(prev) + 1) % order.length];
      soundModeRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Generate stars
      starsRef.current = [];
      for (let i = 0; i < 150; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.8,
          size: 0.5 + Math.random() * 2,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      // Initialize cars
      const groundY = canvas.height * 0.85;
      carsRef.current = [
        {
          x: canvas.width * 0.15,
          y: groundY + 2,
          speed: 0.8 + Math.random() * 0.5,
          direction: 1,
          color: CAR_COLORS[0],
          honking: 0,
          launchCooldown: 0,
        },
        {
          x: canvas.width * 0.75,
          y: groundY + 2,
          speed: 0.5 + Math.random() * 0.4,
          direction: -1,
          color: CAR_COLORS[1],
          honking: 0,
          launchCooldown: 0,
        },
      ];
    };
    resize();
    window.addEventListener("resize", resize);

    // Click/tap to launch (or honk car)
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? rect.width / 2 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? rect.height / 2 : e.clientY;

      // Check if clicking on the moon (toggle sound mode)
      const moon = moonPosRef.current;
      if (Math.hypot(clientX - moon.x, clientY - moon.y) < moon.r * 4) {
        toggleSoundMode();
        return;
      }

      // Check if clicking on a car
      const carScale = Math.min(canvas.width, canvas.height) / 800;
      let clickedCar = false;
      for (const car of carsRef.current) {
        if (Math.abs(clientX - car.x) < 40 * carScale && Math.abs(clientY - car.y + 15 * carScale) < 25 * carScale) {
          // Honk the car!
          car.honking = 30;
          if (audioCtxRef.current) {
            playHonkSound(audioCtxRef.current);
          }
          // Launch firework from car roof!
          launchFirework(car.x);
          clickedCar = true;
          break;
        }
      }
      if (!clickedCar) {
        launchFirework(clientX);
      }
    };
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleClick, { passive: true });

    let running = true;
    const animate = () => {
      if (!running) return;
      frameRef.current++;
      const frame = frameRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const groundY = h * 0.85;

      // Auto-launch (every ~2.5–5 seconds)
      if (frame - lastAutoLaunchRef.current > 150 + Math.random() * 150) {
        lastAutoLaunchRef.current = frame;
        launchFirework();
        // Occasionally launch a second one
        if (Math.random() < 0.2) {
          setTimeout(() => launchFirework(), 500 + Math.random() * 800);
        }
      }

      // Clear with slight trail effect
      ctx.fillStyle = `rgba(2, 2, 12, 0.25)`;
      ctx.fillRect(0, 0, w, h);

      // Night sky gradient (redraw periodically to clean up)
      if (frame % 120 === 0) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#020210");
        grad.addColorStop(0.6, "#0a0a24");
        grad.addColorStop(0.85, "#101030");
        grad.addColorStop(1, "#0a0a1a");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Stars
      for (const star of starsRef.current) {
        const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame * 0.03 * star.twinkleSpeed + star.twinkleOffset));
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Moon (clickable — toggles sound mode, phase shows current mode)
      const moonX = w * 0.85;
      const moonY = h * 0.12;
      const moonR = Math.min(w, h) * 0.03;
      moonPosRef.current = { x: moonX, y: moonY, r: moonR };
      // Full bright disc
      ctx.fillStyle = "rgba(255, 255, 230, 0.9)";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      // Shadow overlay for moon phase (realistic=full, cartoon=half, classic=crescent)
      const mode = soundModeRef.current;
      if (mode !== "realistic") {
        ctx.fillStyle = "#020210";
        ctx.beginPath();
        if (mode === "cartoon") {
          // Half moon: shadow covers left half
          ctx.arc(moonX, moonY, moonR * 1.02, Math.PI * 0.5, Math.PI * 1.5);
          ctx.fill();
        } else {
          // Crescent: large overlapping dark circle offset to the left
          ctx.arc(moonX - moonR * 0.6, moonY, moonR * 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update & draw fireworks (ascending rockets)
      const fws = fireworksRef.current;
      for (let i = fws.length - 1; i >= 0; i--) {
        const fw = fws[i];
        fw.trail.push({ x: fw.x, y: fw.y, alpha: 1 });
        if (fw.trail.length > 12) fw.trail.shift();

        fw.x += fw.vx;
        fw.y += fw.vy;
        fw.vy += 0.05; // slight gravity on rocket

        // Draw trail
        for (let j = 0; j < fw.trail.length; j++) {
          const t = fw.trail[j];
          t.alpha *= 0.85;
          ctx.globalAlpha = t.alpha * 0.6;
          ctx.fillStyle = fw.color;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Rocket head
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Sparks from rocket
        if (Math.random() < 0.4) {
          particlesRef.current.push({
            x: fw.x + (Math.random() - 0.5) * 4,
            y: fw.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 2 + 1,
            life: 1,
            maxLife: 15 + Math.random() * 10,
            color: "#FFD700",
            size: 1 + Math.random(),
            trail: [],
            type: "spark",
          });
        }

        // Explode when reaching target
        if (fw.y <= fw.targetY || fw.vy >= 0) {
          explode(fw.x, fw.y, fw.color);
          fws.splice(i, 1);
        }
      }

      // Update & draw particles
      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.trail.push({ x: p.x, y: p.y, alpha: p.life });
        const maxTrail = p.type === "willow" ? 15 : p.type === "glitter" ? 5 : 8;
        if (p.trail.length > maxTrail) p.trail.shift();

        const gravity = p.type === "willow" ? 0.04 : 0.03;
        const drag = p.type === "willow" ? 0.985 : 0.99;

        p.vx *= drag;
        p.vy *= drag;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }

        // Trail
        for (let j = 0; j < p.trail.length; j++) {
          const t = p.trail[j];
          const a = (j / p.trail.length) * p.life * 0.4;
          ctx.globalAlpha = a;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(t.x, t.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Particle head
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();

        // Bright center for glitter
        if (p.type === "glitter" && p.life > 0.5) {
          ctx.globalAlpha = p.life * 0.8;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      // Ambient glow from explosions
      if (glowRef.current > 0) {
        const glowGrad = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, h * 0.8);
        glowGrad.addColorStop(0, `rgba(255, 200, 150, ${glowRef.current * 0.12})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);
        glowRef.current *= 0.95;
        if (glowRef.current < 0.01) glowRef.current = 0;
      }

      // Ground & silhouettes
      drawSilhouettes(ctx, w, h, groundY, glowRef.current);

      // Update & draw cars
      const carScale = Math.min(w, h) / 800;
      for (const car of carsRef.current) {
        car.x += car.speed * car.direction;
        if (car.honking > 0) car.honking--;
        if (car.launchCooldown > 0) car.launchCooldown--;

        // Bounce at edges
        if (car.x > w + 50 * carScale) {
          car.direction = -1;
          car.speed = 0.5 + Math.random() * 0.6;
          car.color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
        }
        if (car.x < -50 * carScale) {
          car.direction = 1;
          car.speed = 0.5 + Math.random() * 0.6;
          car.color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
        }

        // Occasional car-launched firework
        if (car.launchCooldown <= 0 && Math.random() < 0.001) {
          car.launchCooldown = 300;
          launchFirework(car.x);
          car.honking = 20;
          if (audioCtxRef.current) playHonkSound(audioCtxRef.current);
        }

        drawCar(ctx, car, carScale);
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
    };
  }, [started, launchFirework, explode]);

  if (!started) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg, #020210 0%, #0a0a24 60%, #101030 100%)" }}
      >
        {/* Decorative stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 70}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
        <div className="text-center space-y-6 relative z-10">
          <div className="text-6xl">🎆</div>
          <h1 className="text-3xl font-bold text-white/90 tracking-wide">
            烟花秀
          </h1>
          <p className="text-white/50 text-sm">
            点击屏幕任意位置发射烟花
          </p>
          <button
            onClick={handleStart}
            className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all active:scale-95"
          >
            开始烟花秀 ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] cursor-crosshair"
      style={{ background: "#020210" }}
    />
  );
}
