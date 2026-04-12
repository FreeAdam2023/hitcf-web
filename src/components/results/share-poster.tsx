"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { getEstimatedTcfLevel, getTcfPoints, TCF_MAX_SCORE } from "@/lib/tcf-levels";
import { formatTime } from "@/lib/utils";
import type { ReviewAnswer } from "@/lib/api/types";

export interface SharePosterProps {
  testSetName: string;
  testSetType: string;
  score: number;
  total: number;
  tcfPoints?: number;
  timeTakenSeconds?: number | null;
  completedDate: string;
  answers?: ReviewAnswer[];
}

interface PosterTier {
  emoji: string;
  messageKey: string;
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
        messageKey: "tierExcellent",
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
        messageKey: "tierGreat",
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
        messageKey: "tierGood",
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
        messageKey: "tierProgress",
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
      messageKey: "tierKeepGoing",
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
      emoji: "\u{1F3C6}", messageKey: "tierExcellentShort",
      bgGradient: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 30%, #ddd6fe 60%, #c4b5fd 100%)",
      ringColor: "#7c3aed", ringTrackColor: "#e9d5ff", badgeBg: "#f3e8ff", badgeText: "#6d28d9", accentColor: "#7c3aed",
    };
  }
  if (pct >= 0.78) {
    return {
      emoji: "\u{1F389}", messageKey: "tierGreatShort",
      bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #bfdbfe 60%, #93c5fd 100%)",
      ringColor: "#2563eb", ringTrackColor: "#dbeafe", badgeBg: "#eff6ff", badgeText: "#1d4ed8", accentColor: "#2563eb",
    };
  }
  if (pct >= 0.65) {
    return {
      emoji: "\u{1F4AA}", messageKey: "tierGoodShort",
      bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 60%, #86efac 100%)",
      ringColor: "#16a34a", ringTrackColor: "#dcfce7", badgeBg: "#f0fdf4", badgeText: "#15803d", accentColor: "#16a34a",
    };
  }
  if (pct >= 0.5) {
    return {
      emoji: "\u{1F4C8}", messageKey: "tierProgressShort",
      bgGradient: "linear-gradient(135deg, #fefce8 0%, #fef9c3 30%, #fef08a 60%, #fde047 100%)",
      ringColor: "#ca8a04", ringTrackColor: "#fef9c3", badgeBg: "#fefce8", badgeText: "#a16207", accentColor: "#ca8a04",
    };
  }
  return {
    emoji: "\u{1F44A}", messageKey: "tierKeepGoingShort",
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

const TYPE_LABEL_KEYS: Record<string, string> = {
  listening: "typeListening",
  reading: "typeReading",
  speaking: "typeSpeaking",
  writing: "typeWriting",
};

export const SharePoster = forwardRef<HTMLDivElement, SharePosterProps>(
  function SharePoster(
    { testSetName, testSetType, score, total, tcfPoints, timeTakenSeconds, completedDate, answers },
    ref,
  ) {
    const t = useTranslations("sharePoster");
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
    const size = 280;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - Math.min(1, pct / 100) * circumference;

    const timeStr = timeTakenSeconds != null && timeTakenSeconds > 0
      ? formatTime(timeTakenSeconds)
      : null;

    const typeLabel = TYPE_LABEL_KEYS[testSetType]
      ? t(TYPE_LABEL_KEYS[testSetType])
      : testSetType;

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
              {t("subtitle")}
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
            gap: 24,
          }}
        >
          {/* Circular progress ring */}
          <div style={{ position: "relative", width: size, height: size }}>
            <svg
              width={size}
              height={size}
              style={{ transform: "rotate(-90deg)" }}
            >
              {/* Wrong/remaining arc — full ring as base */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#fca5a5"
                strokeWidth={strokeWidth}
              />
              {/* Correct arc — overlays the score portion */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={tier.ringColor}
                strokeWidth={strokeWidth}
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
              <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, color: "#1a1a1a" }}>
                {displayScore}
                <span style={{ fontSize: 28, fontWeight: 500, color: "#9ca3af" }}>
                  /{displayMax}
                </span>
              </div>
              <div style={{ fontSize: 24, color: "#6b7280", marginTop: 6 }}>
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
                padding: "18px 44px",
                border: `2px solid ${tier.accentColor}33`,
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 700, color: tier.badgeText }}>
                {tcfLevel.level}
              </span>
              <span style={{ fontSize: 26, color: "#9ca3af" }}>·</span>
              <span style={{ fontSize: 32, fontWeight: 700, color: tier.badgeText }}>
                {t("levelLabel")} {nclcLevel}
              </span>
            </div>
          )}

          {/* Encouragement */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 36,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            <span style={{ fontSize: 48 }}>{tier.emoji}</span>
            <span>{t(tier.messageKey)}</span>
          </div>
        </div>

        {/* Score grid (listening/reading only) */}
        {isPointBased && answers && answers.length > 0 && (() => {
          const answerMap = new Map(answers.map((a) => [a.original_question_number ?? a.question_number, a]));
          const rows = [[1,10],[11,20],[21,30],[31,39]];
          return (
            <div style={{ padding: "0 48px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {rows.map(([start, end]) => (
                  <div key={start} style={{ display: "flex", gap: 5 }}>
                    {Array.from({ length: end - start + 1 }, (_, i) => {
                      const n = start + i;
                      const a = answerMap.get(n);
                      const pts = getTcfPoints(n);
                      const isCorrect = a?.is_correct === true;
                      const isWrong = a?.is_correct === false && !!a?.selected;
                      const bgColor = isCorrect
                        ? (pts <= 9 ? "#bbf7d0" : pts <= 21 ? "#4ade80" : "#16a34a")
                        : isWrong
                          ? (pts <= 9 ? "#fecaca" : pts <= 21 ? "#f87171" : "#b91c1c")
                          : "#e5e7eb";
                      const textColor = (isCorrect && pts > 9) || (isWrong && pts > 9) ? "#fff" : "#374151";
                      return (
                        <div
                          key={n}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 6,
                            padding: "4px 2px",
                            background: bgColor,
                            color: textColor,
                            fontSize: 16,
                            fontWeight: 600,
                            lineHeight: 1.2,
                          }}
                        >
                          <span>Q{n}</span>
                          <span style={{ fontSize: 13, opacity: 0.8 }}>{pts}分</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Test info bar */}
        <div
          style={{
            padding: "36px 60px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 600, color: "#1a1a1a", marginBottom: 12 }}>
            {typeLabel} · {testSetName}
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 24, color: "#6b7280" }}>
            <span>{t("correct", { score, total })}</span>
            {timeStr && <span> · {t("timeTaken", { time: timeStr })}</span>}
          </div>
          <div style={{ fontSize: 22, color: "#9ca3af", marginTop: 10 }}>
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
            {t("tagline")}
          </span>
        </div>
      </div>
    );
  },
);
