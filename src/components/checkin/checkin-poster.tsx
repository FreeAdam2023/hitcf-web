"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import type { DailyCheckinData } from "@/lib/api/stats";

export interface CheckinPosterProps {
  data: DailyCheckinData;
}

/** Build dynamic activity items — only non-zero activities are included */
function buildActivities(
  data: DailyCheckinData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, values?: any) => string,
) {
  const items: { emoji: string; label: string; value: string; detail?: string }[] = [];

  if (data.listening.questions_answered > 0) {
    items.push({
      emoji: "\uD83C\uDFA7",
      label: t("listening"),
      value: `${data.listening.correct}/${data.listening.questions_answered}`,
      detail: t("attempts", { count: data.listening.attempts }),
    });
  }
  if (data.reading.questions_answered > 0) {
    items.push({
      emoji: "\uD83D\uDCD6",
      label: t("reading"),
      value: `${data.reading.correct}/${data.reading.questions_answered}`,
      detail: t("attempts", { count: data.reading.attempts }),
    });
  }
  const speakTotal = data.speaking.practice_count + data.speaking.conversation_count;
  if (speakTotal > 0) {
    items.push({
      emoji: "\uD83C\uDF99\uFE0F",
      label: t("speaking"),
      value: `${speakTotal} ${t("sessions")}`,
      detail:
        data.speaking.best_score > 0
          ? t("bestScore", { score: Math.round(data.speaking.best_score) })
          : undefined,
    });
  }
  if (data.writing.tasks_completed > 0) {
    items.push({
      emoji: "\u270D\uFE0F",
      label: t("writing"),
      value: `${data.writing.tasks_completed} ${t("tasks")}`,
      detail:
        data.writing.best_score > 0
          ? `${t("bestScore", { score: data.writing.best_score })}/20`
          : undefined,
    });
  }
  if (data.speed_drill.questions_answered > 0) {
    items.push({
      emoji: "\u26A1",
      label: t("speedDrill"),
      value: `${data.speed_drill.correct}/${data.speed_drill.questions_answered}`,
      detail: t("attempts", { count: data.speed_drill.attempts }),
    });
  }
  if (data.wrong_reviews > 0) {
    items.push({
      emoji: "\uD83D\uDD04",
      label: t("wrongReview"),
      value: `${data.wrong_reviews} ${t("items")}`,
    });
  }
  if (data.words_looked_up > 0) {
    items.push({
      emoji: "\uD83D\uDCD6",
      label: t("wordsLearned"),
      value: `${data.words_looked_up} ${t("wordsUnit")}`,
    });
  }
  if (data.vocabulary_saved > 0) {
    items.push({
      emoji: "\u2B50",
      label: t("vocabSavedLabel"),
      value: `${data.vocabulary_saved} ${t("wordsUnit")}`,
    });
  }
  return items;
}

export const CheckinPoster = forwardRef<HTMLDivElement, CheckinPosterProps>(
  function CheckinPoster({ data }, ref) {
    const t = useTranslations("checkin");
    const activities = buildActivities(data, t);

    // Generate barcode-like pattern from verification hash
    const hashDigits = (data.verification_hash || "").replace(/[^0-9a-f]/gi, "");
    const barcodeWidths = Array.from({ length: 40 }, (_, i) => {
      const ch = hashDigits[i % hashDigits.length] || "5";
      return parseInt(ch, 16) % 4 + 1;
    });

    // Summary items (only non-zero)
    const summaryParts: string[] = [];
    if (data.total_practice_minutes > 0) {
      summaryParts.push(t("minutes", { count: data.total_practice_minutes }));
    }
    const totalQ =
      data.listening.questions_answered +
      data.reading.questions_answered +
      data.speed_drill.questions_answered;
    if (totalQ > 0) summaryParts.push(t("totalItems", { count: totalQ }));
    const totalVocab = data.vocabulary_saved + data.words_looked_up;
    if (totalVocab > 0) summaryParts.push(t("vocabSaved", { count: totalVocab }));

    // Use 2-col grid if 4+ items, otherwise list
    const useGrid = activities.length >= 4;

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
        }}
      >
        {/* Certificate-style ornamental border */}
        <div
          style={{
            position: "absolute",
            inset: 12,
            border: "3px solid rgba(120,60,0,0.25)",
            borderRadius: 8,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(120,60,0,0.12)",
            borderRadius: 4,
            pointerEvents: "none",
          }}
        />

        {/* Diagonal security microtext watermark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -200,
              left: -200,
              right: -200,
              bottom: -200,
              transform: "rotate(-30deg)",
              fontSize: 11,
              lineHeight: "28px",
              color: "rgba(120,60,0,0.04)",
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.5em",
              wordBreak: "break-all",
              whiteSpace: "pre-wrap",
            }}
          >
            {Array.from({ length: 100 })
              .map(() => "HITCF CERTIFIED  ")
              .join("")}
          </div>
        </div>

        {/* Top brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "48px 60px 24px",
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
            <div style={{ fontSize: 32, fontWeight: 700 }}>HiTCF</div>
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
            padding: "12px 60px 24px",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 12 }}>
            {data.user_name}
          </div>
          {data.streak_days > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.6)",
                borderRadius: 50,
                padding: "10px 28px",
                fontSize: 26,
                fontWeight: 600,
                color: "#92400e",
              }}
            >
              {t("streakDays", { days: data.streak_days })}
            </div>
          )}
        </div>

        {/* Dynamic activity cards */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            padding: "0 60px",
            position: "relative",
          }}
        >
          {activities.map((item, i) => (
            <div
              key={i}
              style={{
                flex: useGrid ? "1 1 calc(50% - 9px)" : "1 1 100%",
                background: "rgba(255,255,255,0.65)",
                borderRadius: 20,
                padding: useGrid ? "24px 20px" : "20px 32px",
                display: "flex",
                flexDirection: useGrid ? "column" : "row",
                alignItems: "center",
                gap: useGrid ? 6 : 20,
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: useGrid ? 34 : 30 }}>{item.emoji}</div>
              {useGrid ? (
                <>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#374151" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>
                    {item.value}
                  </div>
                  {item.detail && (
                    <div style={{ fontSize: 15, color: "#6b7280" }}>{item.detail}</div>
                  )}
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "#374151", minWidth: 80 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 800 }}>
                    {item.value}
                  </div>
                  {item.detail && (
                    <div style={{ fontSize: 16, color: "#6b7280" }}>{item.detail}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary bar */}
        {summaryParts.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "24px 60px 16px",
              fontSize: 22,
              fontWeight: 600,
              color: "#374151",
              position: "relative",
            }}
          >
            {summaryParts.map((part, i) => (
              <span key={i}>
                {i > 0 && <span style={{ color: "#d1d5db", marginRight: 16 }}>/</span>}
                {part}
              </span>
            ))}
          </div>
        )}

        {/* ══════════ VERIFICATION ZONE ══════════ */}
        <div
          style={{
            flex: 1,
            margin: "8px 44px 0",
            borderRadius: 12,
            border: "1.5px solid rgba(120,60,0,0.15)",
            background: "rgba(255,251,235,0.7)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 40px",
            minHeight: 180,
          }}
        >
          {/* Fine guilloché-style horizontal lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(120,60,0,0.025) 5px, rgba(120,60,0,0.025) 6px)",
            }}
          />

          {/* Official red seal / stamp */}
          <div
            style={{
              position: "absolute",
              right: 55,
              top: "50%",
              transform: "translateY(-50%) rotate(-15deg)",
              width: 130,
              height: 130,
              borderRadius: "50%",
              border: "4px solid rgba(200,30,30,0.55)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: "50%",
                border: "1.5px solid rgba(200,30,30,0.35)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <div style={{ fontSize: 20, color: "rgba(200,30,30,0.6)", lineHeight: 1 }}>
                ★
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "rgba(200,30,30,0.55)",
                  letterSpacing: "0.12em",
                  lineHeight: 1.2,
                  textAlign: "center",
                }}
              >
                HiTCF
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "rgba(200,30,30,0.45)",
                  letterSpacing: "0.15em",
                  lineHeight: 1,
                }}
              >
                {t("sealText")}
              </div>
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#92400e",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              marginBottom: 10,
              position: "relative",
            }}
          >
            {t("verifyTitle")}
          </div>

          <div
            style={{
              width: 320,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(120,60,0,0.2), transparent)",
              marginBottom: 12,
            }}
          />

          {/* Bureaucratic text */}
          <div
            style={{
              fontSize: 11,
              color: "#78716c",
              textAlign: "center",
              lineHeight: 1.8,
              maxWidth: 480,
              position: "relative",
              marginBottom: 14,
            }}
          >
            {t("verifyBody", { name: data.user_name, date: data.date })}
          </div>

          {/* Barcode */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 1.5,
              height: 28,
              marginBottom: 6,
            }}
          >
            {barcodeWidths.map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: 12 + (parseInt(hashDigits[i % hashDigits.length] || "8", 16) % 16),
                  background: `rgba(60,30,0,${0.25 + (i % 3) * 0.1})`,
                  borderRadius: 0.5,
                }}
              />
            ))}
          </div>

          {/* Certificate number */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "relative",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#92400e",
                letterSpacing: "0.15em",
              }}
            >
              {t("certNo")}
            </span>
            <span
              style={{
                fontSize: 13,
                color: "#78716c",
                letterSpacing: "0.2em",
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              {data.verification_hash}
            </span>
          </div>

          {/* Footnote */}
          <div
            style={{
              fontSize: 8,
              color: "#a8a29e",
              marginTop: 8,
              letterSpacing: "0.1em",
              position: "relative",
            }}
          >
            {t("verifyFootnote")}
          </div>
        </div>

        {/* Bottom brand bar */}
        <div
          style={{
            padding: "20px 60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            position: "relative",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 600, color: "#92400e" }}>
            hitcf.com
          </span>
          <span style={{ fontSize: 20, color: "#d1d5db" }}>|</span>
          <span style={{ fontSize: 20, color: "#78716c" }}>
            {t("tagline")}
          </span>
        </div>
      </div>
    );
  },
);
