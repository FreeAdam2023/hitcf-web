"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import type { DailyCheckinData } from "@/lib/api/stats";

export interface CheckinPosterProps {
  data: DailyCheckinData;
}

/** Build dynamic activity items — only non-zero */
function buildActivities(
  data: DailyCheckinData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, values?: any) => string,
) {
  const items: { label: string; value: string }[] = [];

  if (data.listening.questions_answered > 0)
    items.push({ label: t("listening"), value: `${data.listening.correct}/${data.listening.questions_answered}` });
  if (data.reading.questions_answered > 0)
    items.push({ label: t("reading"), value: `${data.reading.correct}/${data.reading.questions_answered}` });
  const speakTotal = data.speaking.practice_count + data.speaking.conversation_count;
  if (speakTotal > 0)
    items.push({ label: t("speaking"), value: `${speakTotal} ${t("sessions")}` });
  if (data.writing.tasks_completed > 0)
    items.push({ label: t("writing"), value: `${data.writing.tasks_completed} ${t("tasks")}` });
  if (data.speed_drill.questions_answered > 0)
    items.push({ label: t("speedDrill"), value: `${data.speed_drill.correct}/${data.speed_drill.questions_answered}` });
  if (data.wrong_reviews > 0)
    items.push({ label: t("wrongReview"), value: `${data.wrong_reviews} ${t("items")}` });
  if (data.words_looked_up > 0)
    items.push({ label: t("wordsLearned"), value: `${data.words_looked_up} ${t("wordsUnit")}` });
  if (data.vocabulary_saved > 0)
    items.push({ label: t("vocabSavedLabel"), value: `${data.vocabulary_saved} ${t("wordsUnit")}` });
  return items;
}

export const CheckinPoster = forwardRef<HTMLDivElement, CheckinPosterProps>(
  function CheckinPoster({ data }, ref) {
    const t = useTranslations("checkin");
    const activities = buildActivities(data, t);

    // Hero number: total practice items today
    const heroNumber =
      data.listening.questions_answered +
      data.reading.questions_answered +
      (data.speed_drill?.questions_answered ?? 0) +
      data.writing.tasks_completed +
      data.speaking.practice_count +
      data.speaking.conversation_count +
      (data.wrong_reviews ?? 0);

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1440,
          background: "linear-gradient(160deg, #0d0117 0%, #1a0a2e 25%, #2d1154 50%, #4a1942 75%, #1a0a2e 100%)",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient fire glow — top center */}
        <div
          style={{
            position: "absolute",
            top: 180,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,100,0,0.25) 0%, rgba(255,60,0,0.12) 35%, rgba(200,30,0,0.05) 60%, transparent 80%)",
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />

        {/* Secondary warm glow */}
        <div
          style={{
            position: "absolute",
            top: 300,
            left: "50%",
            transform: "translateX(-50%)",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,180,0,0.15) 0%, rgba(255,120,0,0.06) 50%, transparent 80%)",
            pointerEvents: "none",
            filter: "blur(30px)",
          }}
        />

        {/* Top brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "48px 60px 0",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="HiTCF"
              width={48}
              height={48}
              style={{ borderRadius: 10 }}
            />
            <span style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
              HiTCF
            </span>
          </div>
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
            {data.date}
          </span>
        </div>

        {/* Hero section — fire + giant number */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 60px 20px",
            position: "relative",
          }}
        >
          {/* Giant hero number + unit */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 160,
                fontWeight: 900,
                lineHeight: 1,
                color: "#ffffff",
                textShadow: "0 0 60px rgba(255,100,0,0.5), 0 0 120px rgba(255,60,0,0.25)",
                letterSpacing: "-0.02em",
              }}
            >
              {heroNumber}
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {t("heroUnit")}
            </div>
          </div>

          {/* Hero label */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "rgba(255,255,255,0.5)",
              marginTop: 12,
              letterSpacing: "0.15em",
            }}
          >
            {t("heroLabel")}
          </div>
        </div>

        {/* User name + badges */}
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
              fontSize: 40,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 16,
            }}
          >
            {data.user_name}
          </div>
          {data.learning_days > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(100,140,255,0.15)",
                border: "1px solid rgba(100,140,255,0.25)",
                borderRadius: 50,
                padding: "10px 28px",
                fontSize: 24,
                fontWeight: 600,
                color: "#7cb3ff",
              }}
            >
              {t("learningDays", { days: data.learning_days })}
            </div>
          )}
        </div>

        {/* Activity pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            padding: "0 60px",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {activities.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "16px 24px",
                backdropFilter: "blur(10px)",
              }}
            >
              <span style={{ fontSize: 22, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 26, fontWeight: 800, color: "#ffffff" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom brand bar */}
        <div
          style={{
            padding: "0 60px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            position: "relative",
          }}
        >
          {/* Verification hash — subtle */}
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.15)",
              letterSpacing: "0.2em",
              fontFamily: "monospace",
            }}
          >
            {data.verification_hash}
          </div>
          <div
            style={{
              width: 200,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
            }}
          >
            <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
              hitcf.com
            </span>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
              {t("tagline")}
            </span>
          </div>
        </div>
      </div>
    );
  },
);
