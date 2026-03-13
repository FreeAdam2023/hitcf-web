"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import type { DailyCheckinData } from "@/lib/api/stats";

export interface CheckinPosterProps {
  data: DailyCheckinData;
}

export const CheckinPoster = forwardRef<HTMLDivElement, CheckinPosterProps>(
  function CheckinPoster({ data }, ref) {
    const t = useTranslations("checkin");

    const totalQuestions =
      data.listening.questions_answered +
      data.reading.questions_answered +
      data.writing.tasks_completed +
      data.speaking.practice_count +
      data.speaking.conversation_count;

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1440,
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #f59e0b 70%, #d97706 100%)",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
          color: "#1a1a1a",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxShadow: "inset 0 0 0 4px rgba(255,215,0,0.15), inset 0 0 0 8px rgba(255,215,0,0.08)",
        }}
      >
        {/* Micro-text watermark background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            fontSize: 8,
            lineHeight: "10px",
            color: "rgba(0,0,0,0.04)",
            fontFamily: "monospace",
            wordBreak: "break-all",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 200 })
            .map(() => "HITCF ")
            .join("")}
        </div>

        {/* Top brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "48px 60px 32px",
            position: "relative",
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
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a" }}>
              HiTCF
            </div>
            <div style={{ fontSize: 18, color: "#92400e", marginTop: 2 }}>
              {data.date}
            </div>
          </div>
        </div>

        {/* User name + streak */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 60px 36px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: 12,
            }}
          >
            {data.user_name}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.6)",
              borderRadius: 50,
              padding: "12px 32px",
              fontSize: 28,
              fontWeight: 600,
              color: "#92400e",
            }}
          >
            {t("streakDays", { days: data.streak_days })} 🔥
          </div>
        </div>

        {/* 2x2 activity grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            padding: "0 60px",
            position: "relative",
          }}
        >
          {/* Listening */}
          <div
            style={{
              flex: "1 1 calc(50% - 12px)",
              background: "rgba(255,255,255,0.65)",
              borderRadius: 24,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 40 }}>🎧</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#374151" }}>
              {t("listening")}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#1a1a1a" }}>
              {data.listening.correct}/{data.listening.questions_answered}
            </div>
            <div style={{ fontSize: 18, color: "#6b7280" }}>
              {t("attempts", { count: data.listening.attempts })}
            </div>
          </div>

          {/* Reading */}
          <div
            style={{
              flex: "1 1 calc(50% - 12px)",
              background: "rgba(255,255,255,0.65)",
              borderRadius: 24,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 40 }}>📖</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#374151" }}>
              {t("reading")}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#1a1a1a" }}>
              {data.reading.correct}/{data.reading.questions_answered}
            </div>
            <div style={{ fontSize: 18, color: "#6b7280" }}>
              {t("attempts", { count: data.reading.attempts })}
            </div>
          </div>

          {/* Speaking */}
          <div
            style={{
              flex: "1 1 calc(50% - 12px)",
              background: "rgba(255,255,255,0.65)",
              borderRadius: 24,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 40 }}>🎤</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#374151" }}>
              {t("speaking")}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#1a1a1a" }}>
              {data.speaking.practice_count + data.speaking.conversation_count}{" "}
              <span style={{ fontSize: 22, fontWeight: 500 }}>{t("sessions")}</span>
            </div>
            {data.speaking.best_score > 0 && (
              <div style={{ fontSize: 18, color: "#6b7280" }}>
                {t("bestScore", { score: Math.round(data.speaking.best_score) })}
              </div>
            )}
          </div>

          {/* Writing */}
          <div
            style={{
              flex: "1 1 calc(50% - 12px)",
              background: "rgba(255,255,255,0.65)",
              borderRadius: 24,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 40 }}>✍️</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#374151" }}>
              {t("writing")}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#1a1a1a" }}>
              {data.writing.tasks_completed}{" "}
              <span style={{ fontSize: 22, fontWeight: 500 }}>{t("tasks")}</span>
            </div>
            {data.writing.best_score > 0 && (
              <div style={{ fontSize: 18, color: "#6b7280" }}>
                {t("bestScore", { score: data.writing.best_score })}/20
              </div>
            )}
          </div>
        </div>

        {/* Summary bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: "36px 60px",
            fontSize: 24,
            fontWeight: 600,
            color: "#374151",
            position: "relative",
          }}
        >
          <span>
            {t("minutes", { count: data.total_practice_minutes })}
          </span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <span>
            {t("vocabSaved", { count: data.vocabulary_saved })}
          </span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <span>
            {t("totalItems", { count: totalQuestions })}
          </span>
        </div>

        {/* Verification area with holographic overlay */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            position: "relative",
          }}
        >
          {/* Holographic gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(45deg, rgba(255,0,0,0.03), rgba(255,165,0,0.03), rgba(255,255,0,0.03), rgba(0,128,0,0.03), rgba(0,0,255,0.03), rgba(75,0,130,0.03), rgba(238,130,238,0.03))",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontSize: 16,
              color: "#92400e",
              letterSpacing: "0.2em",
              fontFamily: "monospace",
              position: "relative",
            }}
          >
            {data.verification_hash}
          </div>
        </div>

        {/* Bottom brand bar */}
        <div
          style={{
            padding: "28px 60px",
            background: "rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            position: "relative",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 600, color: "#92400e" }}>
            hitcf.com
          </span>
          <span style={{ fontSize: 20, color: "#d1d5db" }}>·</span>
          <span style={{ fontSize: 20, color: "#78716c" }}>
            {t("tagline")}
          </span>
        </div>
      </div>
    );
  },
);
