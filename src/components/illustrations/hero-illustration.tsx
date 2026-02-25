/**
 * Decorative SVG illustration for the landing page hero section.
 * Shows a stylised practice-interface mockup with floating skill icons.
 * Uses CSS custom properties so it adapts to light / dark mode.
 */
export function HeroIllustration({ className }: { className?: string }) {
  /* short-hand colour helpers (shadcn CSS vars) */
  const p = "hsl(var(--primary))";
  const p10 = "hsl(var(--primary) / 0.10)";
  const p20 = "hsl(var(--primary) / 0.20)";
  const card = "hsl(var(--card))";
  const border = "hsl(var(--border))";
  const muted = "hsl(var(--muted))";
  const mutedFg15 = "hsl(var(--muted-foreground) / 0.15)";
  const mutedFg10 = "hsl(var(--muted-foreground) / 0.10)";
  const green = "hsl(142 76% 36%)";

  /* pseudo-random waveform bar heights */
  const bars = [6, 10, 8, 14, 10, 12, 16, 10, 14, 8, 12, 10, 6, 8, 10, 6, 4, 6, 4, 4];

  return (
    <svg
      viewBox="0 0 480 380"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {/* ── shadow ── */}
      <ellipse cx="240" cy="368" rx="170" ry="8" fill={p10} />

      {/* ── device frame ── */}
      <rect
        x="30" y="20" width="420" height="300" rx="16"
        fill={card} stroke={border} strokeWidth="1.5"
      />

      {/* title-bar background (two rects to fill rounded top) */}
      <rect x="30" y="20" width="420" height="40" rx="16" fill={muted} fillOpacity={0.45} />
      <rect x="30" y="44" width="420" height="16" fill={muted} fillOpacity={0.45} />

      {/* traffic-light dots */}
      <circle cx="54" cy="40" r="4.5" fill="#FF5F57" />
      <circle cx="70" cy="40" r="4.5" fill="#FEBC2E" />
      <circle cx="86" cy="40" r="4.5" fill="#28C840" />

      {/* ── question badge ── */}
      <rect x="54" y="78" width="52" height="20" rx="10" fill={p10} />
      <text x="80" y="92" textAnchor="middle" fontSize="10" fontWeight="600" fill={p}>
        Q.15
      </text>

      {/* ── audio waveform bar ── */}
      <rect
        x="54" y="112" width="360" height="32" rx="8"
        fill={muted} fillOpacity={0.25} stroke={border} strokeWidth="1"
      />
      {/* play button */}
      <circle cx="76" cy="128" r="10" fill={p} />
      <polygon points="73,123 73,133 82,128" fill="white" />
      {/* bars */}
      {bars.map((h, i) => (
        <rect
          key={i}
          x={96 + i * 16}
          y={128 - h / 2}
          width="4"
          height={h}
          rx="2"
          fill={i < 12 ? p : mutedFg15}
        />
      ))}

      {/* ── question text placeholder ── */}
      <rect x="54" y="160" width="310" height="7" rx="3.5" fill={mutedFg15} />
      <rect x="54" y="174" width="220" height="7" rx="3.5" fill={mutedFg10} />

      {/* ── answer options ── */}
      {["A", "B", "C", "D"].map((letter, i) => {
        const y = 198 + i * 26;
        const selected = i === 1;
        return (
          <g key={letter}>
            <rect
              x="54" y={y} width="360" height="22" rx="6"
              fill={selected ? "hsl(var(--primary) / 0.06)" : muted}
              fillOpacity={selected ? 1 : 0.2}
              stroke={selected ? p20 : border}
              strokeWidth="1"
            />
            {/* radio circle */}
            <circle
              cx="72" cy={y + 11} r="5.5"
              fill={selected ? p : "transparent"}
              stroke={selected ? p : mutedFg15}
              strokeWidth="1.5"
            />
            {selected && <circle cx="72" cy={y + 11} r="2" fill="white" />}
            {/* text placeholder */}
            <rect
              x="86" y={y + 7} width={100 + i * 24} height="6" rx="3"
              fill={mutedFg10}
            />
          </g>
        );
      })}

      {/* ── floating: headphones (top-left) ── */}
      <g transform="translate(-2, 28)" opacity="0.9">
        <circle cx="20" cy="20" r="20" fill={p10} />
        <path
          d="M12 22v-2a8 8 0 1 1 16 0v2"
          stroke={p} strokeWidth="2" strokeLinecap="round" fill="none"
        />
        <rect x="9" y="21" width="4.5" height="6" rx="2" fill={p} />
        <rect x="26.5" y="21" width="4.5" height="6" rx="2" fill={p} />
      </g>

      {/* ── floating: book (right) ── */}
      <g transform="translate(452, 90)" opacity="0.9">
        <circle cx="16" cy="16" r="20" fill="hsl(142 76% 36% / 0.10)" />
        <rect x="7" y="8" width="9" height="16" rx="1.5" fill="hsl(142 76% 36% / 0.35)" />
        <rect x="16" y="8" width="9" height="16" rx="1.5" fill="hsl(142 76% 36% / 0.22)" />
        <line x1="16" y1="8" x2="16" y2="24" stroke={green} strokeWidth="1.5" />
      </g>

      {/* ── floating: checkmark badge (top-right) ── */}
      <g transform="translate(418, -2)">
        <circle cx="18" cy="18" r="18" fill="hsl(142 76% 36% / 0.10)" />
        <circle cx="18" cy="18" r="11" fill={green} />
        <path
          d="M13 18l3.5 3.5L23 15"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
      </g>

      {/* ── floating: speech bubble (bottom-left) ── */}
      <g transform="translate(4, 280)" opacity="0.85">
        <circle cx="16" cy="16" r="18" fill="hsl(38 92% 50% / 0.10)" />
        <rect x="7" y="8" width="18" height="13" rx="4" fill="hsl(38 92% 50% / 0.5)" />
        <polygon points="12,21 16,26 16,21" fill="hsl(38 92% 50% / 0.5)" />
        <rect x="10" y="12" width="12" height="2" rx="1" fill="white" fillOpacity="0.6" />
        <rect x="10" y="16" width="8" height="2" rx="1" fill="white" fillOpacity="0.4" />
      </g>

      {/* ── floating: pen (bottom-right) ── */}
      <g transform="translate(456, 250)" opacity="0.85">
        <circle cx="14" cy="14" r="18" fill="hsl(270 60% 55% / 0.10)" />
        <path
          d="M20 8l-10 10-2 5 5-2 10-10z"
          stroke="hsl(270 60% 55%)" strokeWidth="1.8" fill="hsl(270 60% 55% / 0.2)"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
