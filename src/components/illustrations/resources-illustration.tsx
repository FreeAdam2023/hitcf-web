"use client";

/**
 * Decorative SVG illustration for the resources page hero.
 * Shows a stylised "guide book" with floating icons: globe, graduation cap,
 * map pin, and a score table snippet.
 * Uses CSS custom properties for light / dark adaptation.
 */
export function ResourcesIllustration({ className }: { className?: string }) {
  const p = "hsl(var(--primary))";
  const p10 = "hsl(var(--primary) / 0.10)";
  const p20 = "hsl(var(--primary) / 0.20)";
  const card = "hsl(var(--card))";
  const border = "hsl(var(--border))";
  const muted = "hsl(var(--muted))";
  const mutedFg15 = "hsl(var(--muted-foreground) / 0.15)";
  const mutedFg10 = "hsl(var(--muted-foreground) / 0.10)";
  const green = "hsl(142 76% 36%)";
  const green10 = "hsl(142 76% 36% / 0.10)";
  const amber = "hsl(38 92% 50%)";
  const amber10 = "hsl(38 92% 50% / 0.10)";
  const purple = "hsl(270 60% 55%)";
  const blue = "hsl(217 91% 60%)";
  const blue10 = "hsl(217 91% 60% / 0.10)";

  return (
    <svg
      viewBox="0 0 480 380"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* ── shadow ── */}
      <ellipse cx="240" cy="368" rx="160" ry="8" fill={p10} />

      {/* ── open book / guide card ── */}
      <rect
        x="60" y="40" width="360" height="280" rx="16"
        fill={card} stroke={border} strokeWidth="1.5"
      />

      {/* book spine line */}
      <line x1="240" y1="40" x2="240" y2="320" stroke={border} strokeWidth="1" strokeDasharray="4 3" />

      {/* ── left page: exam info ── */}
      {/* section title */}
      <rect x="84" y="68" width="80" height="8" rx="4" fill={p} fillOpacity={0.7} />
      <rect x="84" y="84" width="120" height="5" rx="2.5" fill={mutedFg15} />
      <rect x="84" y="94" width="100" height="5" rx="2.5" fill={mutedFg10} />

      {/* mini subject cards */}
      {[
        { y: 116, color: blue, label: "CO" },
        { y: 146, color: green, label: "CE" },
        { y: 176, color: purple, label: "EE" },
        { y: 206, color: amber, label: "EO" },
      ].map((item) => (
        <g key={item.label}>
          <rect
            x="84" y={item.y} width="132" height="24" rx="6"
            fill={muted} fillOpacity={0.25} stroke={border} strokeWidth="0.8"
          />
          <rect
            x="90" y={item.y + 6} width="24" height="12" rx="4"
            fill={item.color} fillOpacity={0.15}
          />
          <text
            x="102" y={item.y + 16}
            textAnchor="middle" fontSize="8" fontWeight="700"
            fill={item.color}
          >
            {item.label}
          </text>
          <rect x="120" y={item.y + 8} width="50" height="4" rx="2" fill={mutedFg10} />
          <rect x="176" y={item.y + 8} width="30" height="4" rx="2" fill={mutedFg15} />
        </g>
      ))}

      {/* validity badge */}
      <rect x="84" y="248" width="60" height="18" rx="9" fill={green10} />
      <text x="114" y="260" textAnchor="middle" fontSize="8" fontWeight="600" fill={green}>
        2 年有效
      </text>

      {/* ── right page: NCLC score table ── */}
      <rect x="260" y="68" width="60" height="8" rx="4" fill={p} fillOpacity={0.7} />
      <rect x="260" y="84" width="136" height="5" rx="2.5" fill={mutedFg15} />

      {/* mini table header */}
      <rect x="260" y="102" width="136" height="16" rx="4" fill={muted} fillOpacity={0.35} />
      <text x="280" y="113" fontSize="7" fontWeight="600" fill={p} fillOpacity={0.6}>NCLC</text>
      <text x="316" y="113" fontSize="7" fontWeight="600" fill={p} fillOpacity={0.6}>CO</text>
      <text x="346" y="113" fontSize="7" fontWeight="600" fill={p} fillOpacity={0.6}>CE</text>
      <text x="376" y="113" fontSize="7" fontWeight="600" fill={p} fillOpacity={0.6}>EE</text>

      {/* table rows */}
      {[
        { y: 122, level: "6", vals: ["398", "406", "7"] },
        { y: 140, level: "7", vals: ["458", "453", "10"], highlight: true },
        { y: 158, level: "8", vals: ["503", "499", "12"] },
        { y: 176, level: "9", vals: ["523", "524", "14"] },
      ].map((row) => (
        <g key={row.level}>
          {row.highlight && (
            <rect x="260" y={row.y} width="136" height="16" rx="3" fill={p10} stroke={p20} strokeWidth="0.8" />
          )}
          <text x="280" y={row.y + 11} textAnchor="middle" fontSize="8" fontWeight={row.highlight ? "800" : "500"} fill={row.highlight ? p : mutedFg15}>
            {row.level}
          </text>
          {row.vals.map((v, i) => (
            <text key={i} x={316 + i * 30} y={row.y + 11} textAnchor="middle" fontSize="7" fontWeight={row.highlight ? "700" : "400"} fill={row.highlight ? p : mutedFg15}>
              {v}
            </text>
          ))}
        </g>
      ))}

      {/* resource link cards */}
      {[
        { y: 208, w: 100, color: blue },
        { y: 228, w: 80, color: green },
        { y: 248, w: 110, color: purple },
      ].map((item, i) => (
        <g key={i}>
          <rect
            x="260" y={item.y} width="136" height="16" rx="4"
            fill={muted} fillOpacity={0.2} stroke={border} strokeWidth="0.6"
          />
          <circle cx="272" cy={item.y + 8} r="4" fill={item.color} fillOpacity={0.2} />
          <rect x="280" y={item.y + 5} width={item.w * 0.6} height="4" rx="2" fill={mutedFg10} />
          {/* external link arrow */}
          <path
            d={`M${384} ${item.y + 5} l4 0 l0 4 M${388} ${item.y + 5} l-5 5`}
            stroke={item.color} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.5}
          />
        </g>
      ))}

      {/* ── floating: graduation cap (top-left) ── */}
      <g transform="translate(-4, 16)" opacity="0.9">
        <circle cx="22" cy="22" r="22" fill={p10} />
        {/* cap base */}
        <polygon points="22,12 6,20 22,28 38,20" fill={p} fillOpacity={0.6} />
        {/* cap top */}
        <polygon points="22,12 14,16 22,20 30,16" fill={p} fillOpacity={0.9} />
        {/* tassel */}
        <line x1="34" y1="20" x2="34" y2="30" stroke={p} strokeWidth="1.5" />
        <circle cx="34" cy="31" r="2" fill={p} />
      </g>

      {/* ── floating: globe (top-right) ── */}
      <g transform="translate(446, 10)" opacity="0.9">
        <circle cx="18" cy="18" r="20" fill={blue10} />
        <circle cx="18" cy="18" r="12" fill="none" stroke={blue} strokeWidth="1.5" />
        <ellipse cx="18" cy="18" rx="5" ry="12" fill="none" stroke={blue} strokeWidth="1" />
        <line x1="6" y1="18" x2="30" y2="18" stroke={blue} strokeWidth="0.8" />
        <line x1="18" y1="6" x2="18" y2="30" stroke={blue} strokeWidth="0.8" />
      </g>

      {/* ── floating: map pin (bottom-right) ── */}
      <g transform="translate(452, 260)" opacity="0.85">
        <circle cx="16" cy="14" r="18" fill="hsl(0 72% 51% / 0.08)" />
        <path
          d="M16 4c-4.4 0-8 3.6-8 8 0 6 8 14 8 14s8-8 8-14c0-4.4-3.6-8-8-8z"
          fill="hsl(0 72% 51% / 0.7)" stroke="hsl(0 72% 51%)" strokeWidth="1"
        />
        <circle cx="16" cy="12" r="3" fill="white" fillOpacity="0.8" />
      </g>

      {/* ── floating: star / bookmark (bottom-left) ── */}
      <g transform="translate(6, 284)" opacity="0.85">
        <circle cx="14" cy="14" r="18" fill={amber10} />
        <path
          d="M14 6l2.5 6 6.5 0.5-5 4.2 1.5 6.3-5.5-3.5-5.5 3.5 1.5-6.3-5-4.2 6.5-0.5z"
          fill={amber} fillOpacity={0.6} stroke={amber} strokeWidth="0.8"
        />
      </g>
    </svg>
  );
}
