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
  bloom: number;
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

interface Whale {
  x: number;
  y: number;
  speed: number;
  phase: "swimming" | "surfacing" | "spouting" | "diving";
  timer: number;
  spoutParticles: SpoutDrop[];
  surfaceY: number;
  direction: number; // 1 = right, -1 = left
}

interface SpoutDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface Seagull {
  x: number;
  y: number;
  speed: number;
  wingPhase: number;
  size: number;
}

// ─── Color palettes ─────────────────────────────────────────────
const LILY_COLORS = [
  "#ffffff", "#fff5f5", "#ffe8ec", "#ffd6e0",
  "#f0fff0", "#e8ffe8", "#d4f5d4",
];

const OCEAN_BLUES = [
  "rgba(20, 80, 160, 0.5)",
  "rgba(30, 100, 180, 0.4)",
  "rgba(40, 120, 200, 0.35)",
  "rgba(50, 140, 210, 0.3)",
  "rgba(60, 160, 220, 0.2)",
];

const FISH_COLORS = ["#ff9966", "#ffcc66", "#66cccc", "#99cc99", "#cc99cc"];

// ─── Main Component ─────────────────────────────────────────────
export default function ShanPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const initLilies = useCallback((w: number, h: number): Lily[] => {
    const lilies: Lily[] = [];
    const waterTop = h * 0.5;
    const count = Math.floor(w / 150);
    for (let i = 0; i < count; i++) {
      lilies.push({
        x: (w / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 80,
        y: waterTop + 10 + Math.random() * 25,
        size: 18 + Math.random() * 14,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.003,
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 0.01 + Math.random() * 0.008,
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

    // Initialize waves
    const waves: Wave[] = OCEAN_BLUES.map((color, i) => ({
      offset: 0,
      amplitude: 6 + i * 2.5,
      frequency: 0.006 + i * 0.002,
      speed: 0.012 + i * 0.004,
      color,
    }));

    // Initialize lilies
    let lilies = initLilies(w, h);

    // Initialize bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 15; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: h * 0.55 + Math.random() * h * 0.45,
        size: 2 + Math.random() * 5,
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.2,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    // Initialize fish
    const fishes: Fish[] = [];
    for (let i = 0; i < 6; i++) {
      fishes.push({
        x: Math.random() * w,
        y: h * 0.6 + Math.random() * h * 0.3,
        speed: 0.4 + Math.random() * 1.2,
        size: 8 + Math.random() * 14,
        color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)],
        tailPhase: Math.random() * Math.PI * 2,
        depth: 0.3 + Math.random() * 0.7,
      });
    }

    // Initialize whale
    const whale: Whale = {
      x: -100,
      y: h * 0.52,
      speed: 0.4,
      phase: "swimming",
      timer: 0,
      spoutParticles: [],
      surfaceY: h * 0.48,
      direction: 1,
    };

    // Initialize seagulls
    const seagulls: Seagull[] = [];
    for (let i = 0; i < 3; i++) {
      seagulls.push({
        x: Math.random() * w,
        y: h * 0.08 + Math.random() * h * 0.15,
        speed: 0.8 + Math.random() * 0.6,
        wingPhase: Math.random() * Math.PI * 2,
        size: 6 + Math.random() * 4,
      });
    }

    let frame = 0;

    function drawSky() {
      // Sky gradient — warm beach sky
      const gradient = ctx.createLinearGradient(0, 0, 0, h * 0.5);
      gradient.addColorStop(0, "#1a3a6e");
      gradient.addColorStop(0.3, "#2e5f9e");
      gradient.addColorStop(0.6, "#5a9fd4");
      gradient.addColorStop(0.85, "#87ceeb");
      gradient.addColorStop(1, "#b5e4f7");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h * 0.52);

      // Clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      const drawCloud = (cx: number, cy: number, s: number) => {
        ctx.beginPath();
        ctx.arc(cx, cy, s * 1.2, 0, Math.PI * 2);
        ctx.arc(cx - s, cy + s * 0.3, s * 0.8, 0, Math.PI * 2);
        ctx.arc(cx + s, cy + s * 0.2, s * 0.9, 0, Math.PI * 2);
        ctx.arc(cx - s * 0.5, cy - s * 0.3, s * 0.7, 0, Math.PI * 2);
        ctx.arc(cx + s * 0.6, cy - s * 0.4, s * 0.6, 0, Math.PI * 2);
        ctx.fill();
      };
      const cloudX1 = ((frame * 0.15) % (w + 200)) - 100;
      const cloudX2 = ((frame * 0.1 + 500) % (w + 200)) - 100;
      drawCloud(cloudX1, h * 0.12, 25);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      drawCloud(cloudX2, h * 0.2, 18);

      // Sun
      const sunX = w * 0.15;
      const sunY = h * 0.1;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 100);
      sunGlow.addColorStop(0, "rgba(255, 240, 180, 0.8)");
      sunGlow.addColorStop(0.3, "rgba(255, 220, 150, 0.3)");
      sunGlow.addColorStop(1, "rgba(255, 200, 100, 0)");
      ctx.fillStyle = sunGlow;
      ctx.fillRect(sunX - 100, sunY - 100, 200, 200);
      ctx.fillStyle = "#fff8dc";
      ctx.beginPath();
      ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawBeach() {
      // Sandy beach at bottom-right (bay shape)
      const beachStart = w * 0.6;
      const waterLine = h * 0.5;

      // Beach sand gradient
      const sandGrad = ctx.createLinearGradient(0, waterLine, 0, h);
      sandGrad.addColorStop(0, "#f5deb3");
      sandGrad.addColorStop(0.3, "#e8cc8c");
      sandGrad.addColorStop(1, "#d4a960");

      ctx.beginPath();
      ctx.moveTo(w, waterLine - 15);
      // Curved beach shoreline
      for (let x = w; x >= beachStart - 50; x -= 3) {
        const t = (w - x) / (w - beachStart + 50);
        const beachY = waterLine - 15 + t * t * 60 + Math.sin(x * 0.02 + frame * 0.01) * 3;
        ctx.lineTo(x, beachY);
      }
      ctx.lineTo(beachStart - 50, h);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = sandGrad;
      ctx.fill();

      // Wet sand (darker strip near water)
      ctx.beginPath();
      ctx.moveTo(w, waterLine - 10);
      for (let x = w; x >= beachStart; x -= 3) {
        const t = (w - x) / (w - beachStart);
        const wetY = waterLine - 10 + t * t * 40 + Math.sin(x * 0.025 + frame * 0.015) * 2;
        ctx.lineTo(x, wetY);
      }
      for (let x = beachStart; x <= w; x += 3) {
        const t = (w - x) / (w - beachStart);
        const wetY = waterLine - 5 + t * t * 50 + Math.sin(x * 0.025 + frame * 0.015) * 2;
        ctx.lineTo(x, wetY);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(180, 155, 110, 0.5)";
      ctx.fill();

      // Foam at water's edge
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = beachStart; x <= w; x += 3) {
        const t = (w - x) / (w - beachStart);
        const foamY = waterLine - 8 + t * t * 45 + Math.sin(x * 0.03 + frame * 0.03) * 4;
        if (x === beachStart) ctx.moveTo(x, foamY);
        else ctx.lineTo(x, foamY);
      }
      ctx.stroke();
    }

    function drawOcean() {
      // Ocean base
      const waterTop = h * 0.5;
      const oceanGrad = ctx.createLinearGradient(0, waterTop, 0, h);
      oceanGrad.addColorStop(0, "rgba(20, 90, 160, 0.85)");
      oceanGrad.addColorStop(0.3, "rgba(15, 70, 140, 0.9)");
      oceanGrad.addColorStop(0.7, "rgba(10, 50, 110, 0.92)");
      oceanGrad.addColorStop(1, "rgba(5, 30, 70, 0.95)");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, waterTop, w, h * 0.5);

      // Waves
      for (const wave of waves) {
        wave.offset += wave.speed;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 3) {
          const y = waterTop + Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      }

      // Horizon shimmer
      ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + Math.sin(frame * 0.02) * 0.03})`;
      ctx.fillRect(0, waterTop - 2, w * 0.6, 4);
    }

    function drawWhale() {
      whale.timer++;

      // State machine
      if (whale.phase === "swimming") {
        whale.x += whale.speed * whale.direction;
        whale.y = whale.surfaceY + 30 + Math.sin(frame * 0.01) * 8;
        // Surface every ~600 frames
        if (whale.timer > 400 + Math.random() * 300) {
          whale.phase = "surfacing";
          whale.timer = 0;
        }
        if (whale.x > w + 150) { whale.direction = -1; }
        if (whale.x < -150) { whale.direction = 1; }
      } else if (whale.phase === "surfacing") {
        whale.y -= 0.5;
        if (whale.y <= whale.surfaceY - 10) {
          whale.phase = "spouting";
          whale.timer = 0;
        }
      } else if (whale.phase === "spouting") {
        // Create spout particles
        if (whale.timer < 30 && whale.timer % 3 === 0) {
          for (let i = 0; i < 4; i++) {
            whale.spoutParticles.push({
              x: whale.x + 25 * whale.direction,
              y: whale.y - 20,
              vx: (Math.random() - 0.5) * 2,
              vy: -(3 + Math.random() * 4),
              life: 50 + Math.random() * 30,
              maxLife: 80,
              size: 2 + Math.random() * 3,
            });
          }
        }
        if (whale.timer > 80) {
          whale.phase = "diving";
          whale.timer = 0;
        }
      } else if (whale.phase === "diving") {
        whale.y += 0.6;
        whale.x += whale.speed * 0.3 * whale.direction;
        if (whale.y > whale.surfaceY + 40) {
          whale.phase = "swimming";
          whale.timer = 0;
        }
      }

      // Update spout particles
      whale.spoutParticles = whale.spoutParticles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.life--;
        return p.life > 0;
      });

      // Draw spout particles
      for (const p of whale.spoutParticles) {
        const alpha = (p.life / p.maxLife) * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
        ctx.fill();
      }

      // Draw whale body
      const wDir = whale.direction;
      ctx.save();
      ctx.translate(whale.x, whale.y);
      if (wDir < 0) ctx.scale(-1, 1);

      // Only draw if partially visible
      const bodyAlpha = whale.phase === "diving" ? Math.max(0, 1 - whale.timer / 60) : whale.phase === "swimming" ? 0.4 : 0.8;
      ctx.globalAlpha = bodyAlpha;

      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 45, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#2c4a6e";
      ctx.fill();

      // Belly (lighter)
      ctx.beginPath();
      ctx.ellipse(5, 5, 35, 10, 0, 0, Math.PI);
      ctx.fillStyle = "#5a8ab5";
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.ellipse(35, -2, 18, 14, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = "#34567a";
      ctx.fill();

      // Eye
      ctx.beginPath();
      ctx.arc(40, -4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(40.5, -4.5, 1, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      // Tail
      const tailWag = Math.sin(frame * 0.06) * 8;
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.quadraticCurveTo(-55, -5 + tailWag, -65, -15 + tailWag);
      ctx.quadraticCurveTo(-55, 0 + tailWag, -65, 15 + tailWag);
      ctx.quadraticCurveTo(-55, 5 + tailWag, -40, 0);
      ctx.fillStyle = "#2c4a6e";
      ctx.fill();

      // Dorsal fin
      ctx.beginPath();
      ctx.moveTo(-5, -17);
      ctx.quadraticCurveTo(5, -30, 12, -17);
      ctx.fillStyle = "#2c4a6e";
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function drawSeagulls() {
      for (const gull of seagulls) {
        gull.x += gull.speed;
        gull.wingPhase += 0.06;
        if (gull.x > w + 20) {
          gull.x = -20;
          gull.y = h * 0.06 + Math.random() * h * 0.18;
        }

        const wingUp = Math.sin(gull.wingPhase) * gull.size * 0.8;
        ctx.save();
        ctx.translate(gull.x, gull.y);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-gull.size, wingUp);
        ctx.quadraticCurveTo(-gull.size * 0.3, wingUp * 0.3, 0, 0);
        ctx.quadraticCurveTo(gull.size * 0.3, wingUp * 0.3, gull.size, wingUp);
        ctx.stroke();
        ctx.restore();
      }
    }

    function drawLily(lily: Lily) {
      const bob = Math.sin(frame * lily.bobSpeed + lily.bobOffset) * 4;
      const lx = lily.x + Math.sin(frame * 0.005 + lily.bobOffset) * 3;
      const ly = lily.y + bob;

      if (lily.bloom < 1) lily.bloom = Math.min(1, lily.bloom + 0.005);
      const bloomScale = lily.bloom;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(lily.rotation + Math.sin(frame * 0.008) * 0.05);

      // Lily pad
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
        ctx.strokeStyle = "rgba(200, 220, 255, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      }

      // Center
      ctx.beginPath();
      ctx.arc(0, 0, petalSize * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffaa";
      ctx.fill();

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, petalSize * 0.3);
      glow.addColorStop(0, "rgba(255, 255, 200, 0.4)");
      glow.addColorStop(1, "rgba(255, 255, 200, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(-petalSize, -petalSize, petalSize * 2, petalSize * 2);

      ctx.restore();
      lily.rotation += lily.rotationSpeed;
    }

    function drawBubbles() {
      for (const b of bubbles) {
        b.y -= b.speed;
        b.wobble += 0.03;
        b.x += Math.sin(b.wobble) * 0.5;
        if (b.y < h * 0.5) {
          b.y = h;
          b.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 210, 255, ${b.opacity})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(180, 230, 255, ${b.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    function drawFish() {
      for (const fish of fishes) {
        fish.x += fish.speed;
        fish.tailPhase += 0.1;
        if (fish.x > w + 30) {
          fish.x = -30;
          fish.y = h * 0.6 + Math.random() * h * 0.3;
        }
        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.globalAlpha = fish.depth * 0.5;

        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size, fish.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = fish.color;
        ctx.fill();

        const tailWag = Math.sin(fish.tailPhase) * 4;
        ctx.beginPath();
        ctx.moveTo(-fish.size, 0);
        ctx.lineTo(-fish.size * 1.6, -fish.size * 0.4 + tailWag);
        ctx.lineTo(-fish.size * 1.6, fish.size * 0.4 + tailWag);
        ctx.closePath();
        ctx.fillStyle = fish.color;
        ctx.fill();

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

      drawSky();
      drawOcean();
      drawBeach();
      drawFish();
      drawBubbles();
      drawWhale();
      drawSeagulls();

      for (const lily of lilies) {
        drawLily(lily);
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      lilies = initLilies(w, h);
      whale.surfaceY = h * 0.48;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [initLilies]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1a3a6e]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
