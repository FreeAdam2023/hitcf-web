"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Tab = "front" | "back";

export function AnkiCardPreview() {
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>("front");

  return (
    <div className="rounded-lg border overflow-hidden my-2">
      {/* Tab bar */}
      <div className="flex border-b bg-muted/30">
        <button
          onClick={() => setTab("front")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === "front"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("vocabulary.export.previewFront")}
        </button>
        <button
          onClick={() => setTab("back")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === "back"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("vocabulary.export.previewBack")}
        </button>
      </div>

      {/* Card preview — inline styles to match Anki rendering */}
      <div
        style={{
          fontFamily: "'Segoe UI', Arial, sans-serif",
          fontSize: "20px",
          textAlign: "center",
          color: "#333",
          background: "#fafafa",
          padding: "16px 20px",
        }}
      >
        {tab === "front" ? (
          <>
            <div style={{ fontSize: "18px", color: "#888" }}>la</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>
              bienvenue
            </div>
            <div style={{ fontSize: "20px", opacity: 0.5 }}>🔊</div>
            <div style={{ fontSize: "14px", color: "#888", fontFamily: "monospace", marginTop: "4px" }}>
              [bjɛ̃vny]
            </div>
            <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
              A1 · Leçon 1
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "22px", margin: "8px 0 4px" }}>欢迎</div>
            <div style={{ fontSize: "15px", color: "#666" }}>welcome</div>
            <div style={{ margin: "8px 0" }}>
              <span
                style={{
                  display: "inline-block",
                  background: "#e8e8e8",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  margin: "2px",
                }}
              >
                n.f.
              </span>
              <span
                style={{
                  display: "inline-block",
                  background: "#f0e4f7",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  margin: "2px",
                }}
              >
                fém.
              </span>
              <span
                style={{
                  display: "inline-block",
                  background: "#d4e8ff",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  margin: "2px",
                }}
              >
                A1
              </span>
            </div>
            <div style={{ fontSize: "14px", color: "#555", marginTop: "8px" }}>
              <span style={{ fontStyle: "italic" }}>Bienvenue en France !</span>
            </div>
            <div style={{ fontSize: "13px", color: "#777" }}>欢迎来到法国！</div>
            <div
              style={{
                marginTop: "16px",
                paddingTop: "8px",
                borderTop: "1px solid #eee",
                fontSize: "10px",
                color: "#bbb",
              }}
            >
              HiTCF.com
            </div>
          </>
        )}
      </div>
    </div>
  );
}
