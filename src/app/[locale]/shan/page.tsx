"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────
interface Wave {
  offset: number;
  amplitude: number;
  frequency: number;
  speed: number;
  color: string;
}

interface Lily {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  bobOffset: number;
  bobSpeed: number;
  petalCount: number;
  color: string;
  stemColor: string;
  bloom: number; // 0-1 bloom animation
}

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  wobble: number;
}

interface Fish {
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  tailPhase: number;
  depth: number;
}

// ─── Color palettes ─────────────────────────────────────────────
const LILY_COLORS = [
  "#ffffff", "#fff5f5", "#ffe8ec", "#ffd6e0",
  "#f0fff0", "#e8ffe8", "#d4f5d4",
];

const OCEAN_GREENS = [
  "rgba(16, 85, 81, 0.6)",
  "rgba(20, 100, 90, 0.5)",
  "rgba(25, 120, 100, 0.4)",
  "rgba(30, 140, 110, 0.3)",
  "rgba(40, 160, 120, 0.2)",
];

const FISH_COLORS = ["#ff9966", "#ffcc66", "#66cccc", "#99cc99", "#cc99cc"];

// ─── Main Component ─────────────────────────────────────────────
export default function ShanPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const initLilies = useCallback((w: number, h: number): Lily[] => {
    const lilies: Lily[] = [];
    const count = Math.floor(w / 120);
    for (let i = 0; i < count; i++) {
      lilies.push({
        x: (w / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 60,
        y: h * 0.45 + (Math.random() - 0.5) * 30,
        size: 20 + Math.random() * 15,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.003,
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 0.01 + Math.random() * 0.01,
        petalCount: 6 + Math.floor(Math.random() * 3),
        color: LILY_COLORS[Math.floor(Math.random() * LILY_COLORS.length)],
        stemColor: `hsl(${130 + Math.random() * 20}, ${60 + Math.random() * 20}%, ${35 + Math.random() * 15}%)`,
        bloom: 0,
      });
    }
    return lilies;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const msgInterval: ReturnType<typeof setInterval> | null = null;

    // Initialize waves
    const waves: Wave[] = OCEAN_GREENS.map((color, i) => ({
      offset: 0,
      amplitude: 8 + i * 3,
      frequency: 0.008 + i * 0.002,
      speed: 0.015 + i * 0.005,
      color,
    }));

    // Initialize lilies
    let lilies = initLilies(w, h);

    // Initialize bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 20; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: h * 0.5 + Math.random() * h * 0.5,
        size: 2 + Math.random() * 6,
        speed: 0.3 + Math.random() * 0.7,
        opacity: 0.1 + Math.random() * 0.3,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    // Initialize fish
    const fishes: Fish[] = [];
    for (let i = 0; i < 5; i++) {
      fishes.push({
        x: Math.random() * w,
        y: h * 0.55 + Math.random() * h * 0.35,
        speed: 0.5 + Math.random() * 1.5,
        size: 8 + Math.random() * 12,
        color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)],
        tailPhase: Math.random() * Math.PI * 2,
        depth: 0.3 + Math.random() * 0.7,
      });
    }

    let frame = 0;

    function drawSky(ctx: CanvasRenderingContext2D) {
      const gradient = ctx.createLinearGradient(0, 0, 0, h * 0.5);
      gradient.addColorStop(0, "#0a2e1a");
      gradient.addColorStop(0.3, "#134e2a");
      gradient.addColorStop(0.6, "#1a6b3a");
      gradient.addColorStop(1, "#2d8f5e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h * 0.5);

      // Stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137.5) % w);
        const sy = ((i * 97.3) % (h * 0.4));
        const twinkle = Math.sin(frame * 0.02 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + twinkle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Moon
      const moonX = w * 0.8;
      const moonY = h * 0.12;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 80);
      moonGlow.addColorStop(0, "rgba(200, 255, 200, 0.3)");
      moonGlow.addColorStop(1, "rgba(200, 255, 200, 0)");
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moonX - 80, moonY - 80, 160, 160);

      ctx.fillStyle = "#e8ffe8";
      ctx.beginPath();
      ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawOcean(ctx: CanvasRenderingContext2D) {
      // Ocean base
      const oceanGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
      oceanGrad.addColorStop(0, "rgba(15, 80, 70, 0.85)");
      oceanGrad.addColorStop(0.5, "rgba(10, 60, 55, 0.9)");
      oceanGrad.addColorStop(1, "rgba(5, 30, 25, 0.95)");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // Waves
      for (const wave of waves) {
        wave.offset += wave.speed;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 3) {
          const y = h * 0.45 + Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      }
    }

    function drawLily(ctx: CanvasRenderingContext2D, lily: Lily) {
      const bob = Math.sin(frame * lily.bobSpeed + lily.bobOffset) * 5;
      const lx = lily.x + Math.sin(frame * 0.005 + lily.bobOffset) * 3;
      const ly = lily.y + bob;

      // Bloom animation
      if (lily.bloom < 1) lily.bloom = Math.min(1, lily.bloom + 0.005);
      const bloomScale = lily.bloom;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(lily.rotation + Math.sin(frame * 0.008) * 0.05);

      // Lily pad (leaf)
      ctx.beginPath();
      ctx.ellipse(0, 0, lily.size * 1.5, lily.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = lily.stemColor;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Petals
      const petalSize = lily.size * bloomScale;
      for (let p = 0; p < lily.petalCount; p++) {
        const angle = (p / lily.petalCount) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(petalSize * 0.5, 0, petalSize * 0.6, petalSize * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = lily.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(200, 255, 200, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      }

      // Center
      ctx.beginPath();
      ctx.arc(0, 0, petalSize * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffaa";
      ctx.fill();

      // Inner glow
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, petalSize * 0.3);
      glow.addColorStop(0, "rgba(255, 255, 200, 0.4)");
      glow.addColorStop(1, "rgba(255, 255, 200, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(-petalSize, -petalSize, petalSize * 2, petalSize * 2);

      ctx.restore();

      lily.rotation += lily.rotationSpeed;
    }

    function drawBubbles(ctx: CanvasRenderingContext2D) {
      for (const b of bubbles) {
        b.y -= b.speed;
        b.wobble += 0.03;
        b.x += Math.sin(b.wobble) * 0.5;

        if (b.y < h * 0.45) {
          b.y = h;
          b.x = Math.random() * w;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 255, 220, ${b.opacity})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(200, 255, 230, ${b.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    function drawFish(ctx: CanvasRenderingContext2D) {
      for (const fish of fishes) {
        fish.x += fish.speed;
        fish.tailPhase += 0.1;

        if (fish.x > w + 30) {
          fish.x = -30;
          fish.y = h * 0.55 + Math.random() * h * 0.35;
        }

        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.globalAlpha = fish.depth * 0.6;

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size, fish.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = fish.color;
        ctx.fill();

        // Tail
        const tailWag = Math.sin(fish.tailPhase) * 4;
        ctx.beginPath();
        ctx.moveTo(-fish.size, 0);
        ctx.lineTo(-fish.size * 1.6, -fish.size * 0.4 + tailWag);
        ctx.lineTo(-fish.size * 1.6, fish.size * 0.4 + tailWag);
        ctx.closePath();
        ctx.fillStyle = fish.color;
        ctx.fill();

        // Eye
        ctx.beginPath();
        ctx.arc(fish.size * 0.5, -fish.size * 0.1, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    function animate() {
      frame++;
      ctx.clearRect(0, 0, w, h);

      drawSky(ctx);
      drawOcean(ctx);
      drawFish(ctx);
      drawBubbles(ctx);

      for (const lily of lilies) {
        drawLily(ctx, lily);
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      lilies = initLilies(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (msgInterval) clearInterval(msgInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, [initLilies]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a2e1a]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
