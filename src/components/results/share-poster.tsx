"use client";

import { forwardRef } from "react";
import { getEstimatedTcfLevel, TCF_MAX_SCORE } from "@/lib/tcf-levels";
import { formatTime } from "@/lib/utils";

export interface SharePosterProps {
  testSetName: string;
  testSetType: string;
  score: number;
  total: number;
  tcfPoints?: number;
  timeTakenSeconds?: number | null;
  completedDate: string;
}

interface PosterTier {
  emoji: string;
  message: string;
  bgGradient: string;
  ringColor: string;
  ringTrackColor: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}

function getPosterTier(tcfPoints: number | undefined, score: number, total: number): PosterTier {
  if (tcfPoints != null) {
    if (tcfPoints >= 549) {
      return {
        emoji: "\u{1F3C6}",
        message: "卓越表现！NCLC 10+ 水平！",
        bgGradient: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 30%, #ddd6fe 60%, #c4b5fd 100%)",
        ringColor: "#7c3aed",
        ringTrackColor: "#e9d5ff",
        badgeBg: "#f3e8ff",
        badgeText: "#6d28d9",
        accentColor: "#7c3aed",
      };
    }
    if (tcfPoints >= 458) {
      return {
        emoji: "\u{1F389}",
        message: "非常棒！已达 NCLC 7！",
        bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #bfdbfe 60%, #93c5fd 100%)",
        ringColor: "#2563eb",
        ringTrackColor: "#dbeafe",
        badgeBg: "#eff6ff",
        badgeText: "#1d4ed8",
        accentColor: "#2563eb",
      };
    }
    if (tcfPoints >= 398) {
      return {
        emoji: "\u{1F4AA}",
        message: "不错！再加把劲突破 NCLC 7！",
        bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 60%, #86efac 100%)",
        ringColor: "#16a34a",
        ringTrackColor: "#dcfce7",
        badgeBg: "#f0fdf4",
        badgeText: "#15803d",
        accentColor: "#16a34a",
      };
    }
    if (tcfPoints >= 331) {
      return {
        emoji: "\u{1F4C8}",
        message: "有进步！坚持练习！",
        bgGradient: "linear-gradient(135deg, #fefce8 0%, #fef9c3 30%, #fef08a 60%, #fde047 100%)",
        ringColor: "#ca8a04",
        ringTrackColor: "#fef9c3",
        badgeBg: "#fefce8",
        badgeText: "#a16207",
        accentColor: "#ca8a04",
      };
    }
    return {
      emoji: "\u{1F44A}",
      message: "加油！每一次练习都是进步！",
      bgGradient: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 30%, #e7e5e4 60%, #d6d3d1 100%)",
      ringColor: "#78716c",
      ringTrackColor: "#e7e5e4",
      badgeBg: "#f5f5f4",
      badgeText: "#57534e",
      accentColor: "#78716c",
    };
  }

  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.9) {
    return {
      emoji: "\u{1F3C6}", message: "卓越表现！",
      bgGradient: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 30%, #ddd6fe 60%, #c4b5fd 100%)",
      ringColor: "#7c3aed", ringTrackColor: "#e9d5ff", badgeBg: "#f3e8ff", badgeText: "#6d28d9", accentColor: "#7c3aed",
    };
  }
  if (pct >= 0.78) {
    return {
      emoji: "\u{1F389}", message: "非常棒！",
      bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #bfdbfe 60%, #93c5fd 100%)",
      ringColor: "#2563eb", ringTrackColor: "#dbeafe", badgeBg: "#eff6ff", badgeText: "#1d4ed8", accentColor: "#2563eb",
    };
  }
  if (pct >= 0.65) {
    return {
      emoji: "\u{1F4AA}", message: "不错！再接再厉！",
      bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 60%, #86efac 100%)",
      ringColor: "#16a34a", ringTrackColor: "#dcfce7", badgeBg: "#f0fdf4", badgeText: "#15803d", accentColor: "#16a34a",
    };
  }
  if (pct >= 0.5) {
    return {
      emoji: "\u{1F4C8}", message: "有进步！坚持练习！",
      bgGradient: "linear-gradient(135deg, #fefce8 0%, #fef9c3 30%, #fef08a 60%, #fde047 100%)",
      ringColor: "#ca8a04", ringTrackColor: "#fef9c3", badgeBg: "#fefce8", badgeText: "#a16207", accentColor: "#ca8a04",
    };
  }
  return {
    emoji: "\u{1F44A}", message: "加油！每一次练习都是进步！",
    bgGradient: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 30%, #e7e5e4 60%, #d6d3d1 100%)",
    ringColor: "#78716c", ringTrackColor: "#e7e5e4", badgeBg: "#f5f5f4", badgeText: "#57534e", accentColor: "#78716c",
  };
}

function getNclcLevel(tcfPoints: number): string {
  if (tcfPoints >= 549) return "10+";
  if (tcfPoints >= 523) return "9";
  if (tcfPoints >= 503) return "8";
  if (tcfPoints >= 458) return "7";
  if (tcfPoints >= 398) return "6";
  if (tcfPoints >= 369) return "5";
  if (tcfPoints >= 331) return "4";
  return "<4";
}

const TYPE_LABELS: Record<string, string> = {
  listening: "听力理解",
  reading: "阅读理解",
  speaking: "口语表达",
  writing: "写作表达",
};

export const SharePoster = forwardRef<HTMLDivElement, SharePosterProps>(
  function SharePoster(
    { testSetName, testSetType, score, total, tcfPoints, timeTakenSeconds, completedDate },
    ref,
  ) {
    const isPointBased = tcfPoints != null;
    const tier = getPosterTier(tcfPoints, score, total);
    const tcfLevel = isPointBased ? getEstimatedTcfLevel(tcfPoints) : null;
    const nclcLevel = isPointBased ? getNclcLevel(tcfPoints) : null;
    const pct = isPointBased
      ? Math.round((tcfPoints / TCF_MAX_SCORE) * 100)
      : total > 0
        ? Math.round((score / total) * 100)
        : 0;

    const displayScore = isPointBased ? tcfPoints : score;
    const displayMax = isPointBased ? TCF_MAX_SCORE : total;

    // SVG circular progress
    const size = 220;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;

    const timeStr = timeTakenSeconds != null && timeTakenSeconds > 0
      ? formatTime(timeTakenSeconds)
      : null;

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1440,
          background: tier.bgGradient,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
          color: "#1a1a1a",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "48px 60px 32px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="HiTCF"
            width={56}
            height={56}
            style={{ borderRadius: 12 }}
          />
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a" }}>
              HiTCF
            </div>
            <div style={{ fontSize: 18, color: "#6b7280", marginTop: 2 }}>
              TCF Canada 在线练习
            </div>
          </div>
        </div>

        {/* Main score area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            gap: 36,
          }}
        >
          {/* Circular progress ring */}
          <div style={{ position: "relative", width: size, height: size }}>
            <svg
              width={size}
              height={size}
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={tier.ringTrackColor}
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={tier.ringColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, color: "#1a1a1a" }}>
                {displayScore}
                <span style={{ fontSize: 24, fontWeight: 500, color: "#9ca3af" }}>
                  /{displayMax}
                </span>
              </div>
              <div style={{ fontSize: 22, color: "#6b7280", marginTop: 6 }}>
                {pct}%
              </div>
            </div>
          </div>

          {/* Level badge */}
          {isPointBased && tcfLevel && nclcLevel && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(4px)",
                borderRadius: 50,
                padding: "14px 36px",
                border: `2px solid ${tier.accentColor}33`,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 700, color: tier.badgeText }}>
                {tcfLevel.level}
              </span>
              <span style={{ fontSize: 20, color: "#9ca3af" }}>·</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: tier.badgeText }}>
                NCLC {nclcLevel}
              </span>
            </div>
          )}

          {/* Encouragement */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 28,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            <span style={{ fontSize: 40 }}>{tier.emoji}</span>
            <span>{tier.message}</span>
          </div>
        </div>

        {/* Test info bar */}
        <div
          style={{
            padding: "36px 60px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>
            {TYPE_LABELS[testSetType] || testSetType} · {testSetName}
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 20, color: "#6b7280" }}>
            <span>答对 {score}/{total}</span>
            {timeStr && <span>· 用时 {timeStr}</span>}
          </div>
          <div style={{ fontSize: 18, color: "#9ca3af", marginTop: 8 }}>
            {completedDate}
          </div>
        </div>

        {/* Bottom brand bar */}
        <div
          style={{
            padding: "28px 60px",
            background: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 600, color: "#6b7280" }}>
            hitcf.com
          </span>
          <span style={{ fontSize: 20, color: "#d1d5db" }}>·</span>
          <span style={{ fontSize: 20, color: "#9ca3af" }}>
            TCF Canada 备考神器
          </span>
        </div>
      </div>
    );
  },
);
