"use client";

import { useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────
interface WaveRipple {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  size: number;
}

interface Seagull {
  x: number;
  y: number;
  speed: number;
  wingPhase: number;
  size: number;
}

interface WhaleState {
  x: number;
  baseY: number;
  phase: "hidden" | "rising" | "spouting" | "diving";
  timer: number;
  cooldown: number;
  spouts: { x: number; y: number; vx: number; vy: number; life: number; size: number }[];
}

// ─── Main Component ─────────────────────────────────────────────
export default function ShanPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Layout constants (30-degree bird's eye)
    const HORIZON = 0.28;
    const OCEAN_END = 0.55;
    const BEACH_START = 0.55;

    const seagulls: Seagull[] = Array.from({ length: 5 }, () => ({
      x: Math.random() * w * 1.2 - w * 0.1,
      y: h * HORIZON * 0.3 + Math.random() * h * HORIZON * 0.5,
      speed: 0.3 + Math.random() * 0.5,
      wingPhase: Math.random() * Math.PI * 2,
      size: 4 + Math.random() * 4,
    }));

    const ripples: WaveRipple[] = [];

    const whale: WhaleState = {
      x: w * 0.35,
      baseY: h * (HORIZON + (OCEAN_END - HORIZON) * 0.4),
      phase: "hidden",
      timer: 0,
      cooldown: 200 + Math.random() * 300,
      spouts: [],
    };

    let frame = 0;

    function drawSky() {
      const grad = ctx.createLinearGradient(0, 0, 0, h * HORIZON);
      grad.addColorStop(0, "#4a90d9");
      grad.addColorStop(0.4, "#6ab0e8");
      grad.addColorStop(0.7, "#89c4f0");
      grad.addColorStop(1, "#a8d8f8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h * HORIZON + 10);

      // Sun
      const sunX = w * 0.75;
      const sunY = h * 0.08;
      const glow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 120);
      glow.addColorStop(0, "rgba(255, 250, 220, 0.9)");
      glow.addColorStop(0.2, "rgba(255, 240, 180, 0.4)");
      glow.addColorStop(1, "rgba(255, 220, 150, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffbe6";
      ctx.beginPath();
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      const drawCloud = (cx: number, cy: number, s: number) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, s * 2, s * 0.6, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - s, cy + 2, s * 1.2, s * 0.5, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + s * 0.8, cy - 1, s * 1.4, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCloud(((frame * 0.12 + 100) % (w + 300)) - 150, h * 0.06, 30);
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      drawCloud(((frame * 0.08 + 600) % (w + 300)) - 150, h * 0.14, 22);
      drawCloud(((frame * 0.1 + 300) % (w + 300)) - 150, h * 0.1, 18);
    }

    function drawMountains() {
      const mY = h * HORIZON;
      ctx.fillStyle = "rgba(140, 170, 210, 0.6)";
      ctx.beginPath();
      ctx.moveTo(0, mY);
      const px = [0, 0.08, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1];
      const py = [0.03, 0.06, 0.09, 0.12, 0.08, 0.11, 0.14, 0.1, 0.07, 0.13, 0.06, 0.04];
      for (let i = 0; i < px.length; i++) ctx.lineTo(w * px[i], mY - h * py[i]);
      ctx.lineTo(w, mY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(110, 150, 195, 0.5)";
      ctx.beginPath();
      ctx.moveTo(0, mY);
      const px2 = [0, 0.1, 0.2, 0.3, 0.42, 0.55, 0.68, 0.8, 0.9, 1];
      const py2 = [0.02, 0.05, 0.03, 0.07, 0.04, 0.06, 0.08, 0.05, 0.03, 0.02];
      for (let i = 0; i < px2.length; i++) ctx.lineTo(w * px2[i], mY - h * py2[i]);
      ctx.lineTo(w, mY);
      ctx.closePath();
      ctx.fill();
    }

    function drawOcean() {
      const oTop = h * HORIZON;
      const oH = h * (OCEAN_END - HORIZON);
      const grad = ctx.createLinearGradient(0, oTop, 0, oTop + oH);
      grad.addColorStop(0, "#5ba3d9");
      grad.addColorStop(0.3, "#3d8ec9");
      grad.addColorStop(0.6, "#2a7ab8");
      grad.addColorStop(1, "#1e6ca8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, oTop, w, oH);

      // Perspective wave lines
      for (let i = 0; i < 12; i++) {
        const t = i / 12;
        const y = oTop + t * t * oH;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + t * 0.12})`;
        ctx.lineWidth = 0.5 + t * 1.5;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const wy = y + Math.sin(x * (0.015 - t * 0.005) + frame * 0.02 + i) * (1 + t * 3);
          if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }

      // Sun reflection
      const sunX = w * 0.75;
      const rg = ctx.createLinearGradient(sunX, oTop, sunX, oTop + oH * 0.6);
      rg.addColorStop(0, "rgba(255, 250, 220, 0.15)");
      rg.addColorStop(1, "rgba(255, 250, 220, 0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(sunX - 40, oTop);
      ctx.lineTo(sunX + 40, oTop);
      ctx.lineTo(sunX + 80, oTop + oH * 0.6);
      ctx.lineTo(sunX - 80, oTop + oH * 0.6);
      ctx.closePath();
      ctx.fill();

      // Sparkles
      for (let i = 0; i < 15; i++) {
        const sx = (i * 97 + frame * 0.5) % w;
        const sy = oTop + ((i * 137) % oH) * 0.8;
        const sp = Math.sin(frame * 0.05 + i * 2) * 0.5 + 0.5;
        if (sp > 0.7) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(sp - 0.7) * 2})`;
          ctx.fillRect(sx, sy, 2, 1);
        }
      }
    }

    function drawBeach() {
      const bTop = h * BEACH_START;
      const grad = ctx.createLinearGradient(0, bTop, 0, h);
      grad.addColorStop(0, "#e8d5a3");
      grad.addColorStop(0.2, "#f0deb0");
      grad.addColorStop(0.5, "#f5e6c0");
      grad.addColorStop(1, "#e8d098");
      ctx.fillStyle = grad;

      // Bay-shaped beach
      ctx.beginPath();
      ctx.moveTo(0, bTop + h * 0.08);
      ctx.quadraticCurveTo(w * 0.15, bTop - h * 0.02, w * 0.35, bTop);
      for (let x = w * 0.35; x <= w * 0.65; x += 3) {
        const t = (x - w * 0.35) / (w * 0.3);
        ctx.lineTo(x, bTop + Math.sin(t * Math.PI) * 5 + Math.sin(x * 0.03 + frame * 0.02) * 2);
      }
      ctx.quadraticCurveTo(w * 0.85, bTop - h * 0.02, w, bTop + h * 0.08);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Wet sand
      ctx.fillStyle = "rgba(190, 170, 130, 0.4)";
      ctx.beginPath();
      ctx.moveTo(0, bTop + h * 0.08);
      ctx.quadraticCurveTo(w * 0.15, bTop, w * 0.35, bTop + 3);
      for (let x = w * 0.35; x <= w * 0.65; x += 3) {
        const t = (x - w * 0.35) / (w * 0.3);
        ctx.lineTo(x, bTop + 3 + Math.sin(t * Math.PI) * 5 + Math.sin(x * 0.03 + frame * 0.02) * 2);
      }
      ctx.quadraticCurveTo(w * 0.85, bTop, w, bTop + h * 0.08);
      ctx.lineTo(w, bTop + h * 0.12);
      ctx.lineTo(0, bTop + h * 0.12);
      ctx.closePath();
      ctx.fill();

      // Foam
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = w * 0.2; x <= w * 0.8; x += 3) {
        const t = (x - w * 0.2) / (w * 0.6);
        const fy = bTop + Math.sin(t * Math.PI) * 4 + Math.sin(x * 0.04 + frame * 0.03) * 3 + 2;
        if (x === w * 0.2) ctx.moveTo(x, fy); else ctx.lineTo(x, fy);
      }
      ctx.stroke();
    }

    function drawFlowerField(side: "left" | "right") {
      const bTop = h * BEACH_START;
      const fieldW = w * 0.22;
      const startX = side === "left" ? 0 : w - fieldW;
      const isLavender = side === "left";

      for (let row = 0; row < 8; row++) {
        const rowT = row / 8;
        const y = bTop + h * 0.06 + rowT * (h * 0.38);
        const flowerSize = 3 + rowT * 6;
        const spacing = 15 + rowT * 20;
        const rowOffset = (row % 2) * spacing * 0.5;

        for (let x = startX + rowOffset; x < startX + fieldW; x += spacing) {
          const jx = x + Math.sin(x * 0.1 + row) * 3;
          const jy = y + Math.cos(x * 0.13 + row * 2) * 2;

          if (isLavender) {
            const sway = Math.sin(frame * 0.015 + jx * 0.05) * 2;
            ctx.strokeStyle = `rgba(80, 120, 60, ${0.4 + rowT * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(jx, jy + flowerSize * 1.5);
            ctx.lineTo(jx + sway, jy);
            ctx.stroke();
            for (let p = 0; p < 4; p++) {
              const ps = flowerSize * 0.3 * (1 - p * 0.15);
              ctx.fillStyle = `rgba(${140 + (x % 30)}, ${80 + (x % 20)}, ${180 + (x % 40)}, ${0.5 + rowT * 0.3})`;
              ctx.beginPath();
              ctx.ellipse(jx + sway * (1 - p * 0.2), jy - p * flowerSize * 0.3, ps, ps * 0.7, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            const sway = Math.sin(frame * 0.012 + jx * 0.04) * 1.5;
            ctx.strokeStyle = `rgba(70, 130, 50, ${0.4 + rowT * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(jx, jy + flowerSize * 1.2);
            ctx.lineTo(jx + sway, jy);
            ctx.stroke();
            for (let p = 0; p < 5; p++) {
              const angle = (p / 5) * Math.PI * 2 + frame * 0.002;
              const ps = flowerSize * 0.4;
              ctx.fillStyle = `rgba(255, ${240 - (row % 3) * 20}, ${240 - (row % 2) * 30}, ${0.5 + rowT * 0.35})`;
              ctx.beginPath();
              ctx.ellipse(jx + sway + Math.cos(angle) * ps * 0.6, jy + Math.sin(angle) * ps * 0.6, ps * 0.5, ps * 0.25, angle, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = `rgba(255, 230, 100, ${0.5 + rowT * 0.3})`;
            ctx.beginPath();
            ctx.arc(jx + sway, jy, flowerSize * 0.12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    function drawWhale() {
      whale.timer++;
      if (whale.phase === "hidden") {
        whale.cooldown--;
        if (whale.cooldown <= 0) {
          whale.phase = "rising";
          whale.timer = 0;
          whale.x = w * 0.2 + Math.random() * w * 0.5;
        }
      } else if (whale.phase === "rising" && whale.timer > 40) {
        whale.phase = "spouting";
        whale.timer = 0;
      } else if (whale.phase === "spouting") {
        if (whale.timer < 25 && whale.timer % 2 === 0) {
          for (let i = 0; i < 3; i++) {
            whale.spouts.push({
              x: whale.x, y: whale.baseY - 15,
              vx: (Math.random() - 0.5) * 2.5, vy: -(2.5 + Math.random() * 3.5),
              life: 40 + Math.random() * 25, size: 2 + Math.random() * 3,
            });
          }
        }
        if (whale.timer > 70) { whale.phase = "diving"; whale.timer = 0; }
      } else if (whale.phase === "diving" && whale.timer > 50) {
        whale.phase = "hidden";
        whale.cooldown = 300 + Math.random() * 400;
        whale.timer = 0;
      }

      whale.spouts = whale.spouts.filter((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
        return p.life > 0;
      });
      for (const p of whale.spouts) {
        ctx.fillStyle = `rgba(200, 230, 255, ${(p.life / 65) * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (whale.phase !== "hidden") {
        let yOff = 0, alpha = 1;
        if (whale.phase === "rising") { yOff = 15 - whale.timer * 0.375; alpha = whale.timer / 40; }
        else if (whale.phase === "diving") { yOff = whale.timer * 0.3; alpha = 1 - whale.timer / 50; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.font = "40px serif";
        ctx.textAlign = "center";
        ctx.fillText("\uD83D\uDC0B", whale.x, whale.baseY + yOff);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    function drawSeagulls() {
      for (const g of seagulls) {
        g.x += g.speed;
        g.wingPhase += 0.07;
        if (g.x > w + 30) { g.x = -30; g.y = h * HORIZON * 0.2 + Math.random() * h * HORIZON * 0.6; }
        const wing = Math.sin(g.wingPhase) * g.size;
        ctx.strokeStyle = "rgba(40, 40, 40, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(g.x - g.size, g.y + wing);
        ctx.quadraticCurveTo(g.x - g.size * 0.3, g.y + wing * 0.2, g.x, g.y);
        ctx.quadraticCurveTo(g.x + g.size * 0.3, g.y + wing * 0.2, g.x + g.size, g.y + wing);
        ctx.stroke();
      }
    }

    function drawRipples() {
      if (frame % 60 === 0) {
        const oTop = h * HORIZON;
        const oH = h * (OCEAN_END - HORIZON);
        ripples.push({ x: Math.random() * w, y: oTop + Math.random() * oH * 0.8, age: 0, maxAge: 80 + Math.random() * 40, size: 5 + Math.random() * 15 });
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.age++;
        if (r.age > r.maxAge) { ripples.splice(i, 1); continue; }
        const p = r.age / r.maxAge;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - p) * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.size * (0.5 + p * 1.5), r.size * (0.5 + p * 1.5) * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function animate() {
      frame++;
      ctx.clearRect(0, 0, w, h);
      drawSky();
      drawMountains();
      drawOcean();
      drawRipples();
      drawWhale();
      drawBeach();
      drawFlowerField("left");
      drawFlowerField("right");
      drawSeagulls();
      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      whale.baseY = h * (HORIZON + (OCEAN_END - HORIZON) * 0.4);
    };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", handleResize); };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#4a90d9]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
