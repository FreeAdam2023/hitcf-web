"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";

import { getVocabularyCard } from "@/lib/api/vocabulary";
import { useFrenchSpeech } from "@/hooks/use-french-speech";

type Tab = "front" | "back";

const DEMO_WORD = "bienvenue";

export function AnkiCardPreview() {
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>("front");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { speak, playing } = useFrenchSpeech();

  // Fetch the real vocabulary card to get Azure TTS audio_url
  useEffect(() => {
    let cancelled = false;
    getVocabularyCard(DEMO_WORD, "zh")
      .then((card) => {
        if (!cancelled && card.audio_url) {
          setAudioUrl(card.audio_url);
        }
      })
      .catch(() => {
        // Silently fail — fallback to Web Speech API
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePlay = () => {
    speak(DEMO_WORD, audioUrl);
  };

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

      {/* Anki-style background */}
      <div
        style={{
          background: "linear-gradient(160deg, #f0f4f8 0%, #e8edf5 50%, #e2e8f0 100%)",
          padding: "16px 12px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Card shell */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "380px",
            overflow: "hidden",
            boxShadow:
              "0 1px 3px rgba(0,0,0,.04), 0 4px 6px rgba(0,0,0,.04), 0 12px 28px rgba(0,0,0,.06)",
          }}
        >
          {/* Gender accent bar — pink for féminin */}
          <div
            style={{
              height: "4px",
              background: "linear-gradient(90deg, #ec4899, #f472b6, #f9a8d4)",
            }}
          />

          {/* Content area */}
          <div
            style={{
              padding: tab === "front" ? "24px 28px 20px" : "16px 28px 8px",
              textAlign: "center",
              fontFamily:
                '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {tab === "front" ? (
              <>
                <div
                  style={{
                    fontSize: "15px",
                    color: "#94a3b8",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    marginBottom: "2px",
                  }}
                >
                  la
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 700,
                    color: "#ec4899",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                    margin: "4px 0 10px",
                  }}
                >
                  bienvenue
                </div>
                {/* Audio button */}
                <button
                  onClick={handlePlay}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    margin: "4px 0",
                    opacity: playing ? 0.7 : 0.4,
                    transition: "opacity 0.2s",
                  }}
                  title={t("vocabulary.export.previewPlay")}
                >
                  <Volume2
                    size={22}
                    style={{ color: playing ? "#ec4899" : "#94a3b8" }}
                  />
                </button>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#94a3b8",
                    fontFamily:
                      '"Cascadia Code", "Fira Code", "SF Mono", Consolas, monospace',
                  }}
                >
                  [bjɛ̃vny]
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#cbd5e1",
                    letterSpacing: "0.3px",
                    marginTop: "10px",
                  }}
                >
                  A1 · Leçon 1
                </div>
              </>
            ) : (
              <>
                {/* Back: smaller word + article */}
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                  }}
                >
                  la
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#ec4899",
                    margin: "2px 0 6px",
                    lineHeight: 1.2,
                  }}
                >
                  bienvenue
                </div>
                {/* Audio button */}
                <button
                  onClick={handlePlay}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    opacity: playing ? 0.7 : 0.4,
                    transition: "opacity 0.2s",
                  }}
                >
                  <Volume2
                    size={18}
                    style={{ color: playing ? "#ec4899" : "#94a3b8" }}
                  />
                </button>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontFamily:
                      '"Cascadia Code", "Fira Code", "SF Mono", Consolas, monospace',
                    marginTop: "2px",
                  }}
                >
                  [bjɛ̃vny]
                </div>

                {/* Dashed divider */}
                <div
                  style={{
                    borderTop: "1.5px dashed #e2e8f0",
                    margin: "14px 0",
                  }}
                />

                {/* Chinese meaning */}
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#1a202c",
                    margin: "8px 0 4px",
                  }}
                >
                  {t("vocabulary.export.previewMeaning")}
                </div>
                {/* English meaning */}
                <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>
                  welcome
                </div>

                {/* Badge row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "6px",
                    margin: "12px 0",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "20px",
                      padding: "3px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                      background: "#f1f5f9",
                      color: "#475569",
                    }}
                  >
                    n.f.
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "20px",
                      padding: "3px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: "#fdf2f8",
                      color: "#ec4899",
                    }}
                  >
                    féminin
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "20px",
                      padding: "3px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                      color: "#1d4ed8",
                    }}
                  >
                    A1
                  </span>
                </div>

                {/* Example with blockquote accent */}
                <div style={{ textAlign: "left", margin: "14px 0 4px" }}>
                  <div
                    style={{
                      borderLeft: "3px solid #818cf8",
                      padding: "6px 0 6px 14px",
                    }}
                  >
                    <span
                      style={{
                        fontStyle: "italic",
                        fontSize: "14px",
                        color: "#334155",
                        fontWeight: 500,
                        display: "block",
                      }}
                    >
                      Bienvenue en France !
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#059669",
                        display: "block",
                        marginTop: "1px",
                      }}
                    >
                      {t("vocabulary.export.previewExample")}
                    </span>
                  </div>
                </div>

                {/* Expandable conjugation button */}
                <div style={{ marginTop: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    style={{
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                      padding: "6px 20px",
                      borderRadius: "8px",
                      border: "none",
                      transition: "all .2s",
                      background: detailsOpen ? "#eff6ff" : "#f8fafc",
                      color: detailsOpen ? "#3b82f6" : "#94a3b8",
                    }}
                  >
                    Conjugaison {detailsOpen ? "▲" : "▼"}
                  </button>
                  {detailsOpen && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "6px",
                        marginTop: "8px",
                        textAlign: "left",
                      }}
                    >
                      {[
                        {
                          label: "现在 Présent",
                          rows: ["je bienviens", "tu bienviens"],
                        },
                        {
                          label: "复合过去 P.Composé",
                          rows: ["p.p.", "avoir + bienvenu"],
                        },
                      ].map((tense) => (
                        <table
                          key={tense.label}
                          style={{
                            borderCollapse: "collapse",
                            fontSize: "11px",
                            width: "100%",
                          }}
                        >
                          <thead>
                            <tr>
                              <th
                                colSpan={2}
                                style={{
                                  background: "#f8fafc",
                                  fontWeight: 600,
                                  color: "#475569",
                                  fontSize: "10px",
                                  letterSpacing: "0.3px",
                                  padding: "3px 8px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {tense.label}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {tense.rows.map((row, i) => (
                              <tr key={i}>
                                <td
                                  style={{
                                    padding: "2px 8px",
                                    border: "1px solid #e2e8f0",
                                    color: "#475569",
                                    fontSize: "10px",
                                  }}
                                >
                                  {row}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Branding footer */}
          <div
            style={{
              padding: "8px 28px",
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
              background: "linear-gradient(180deg, #fafbfc, #f5f7fa)",
            }}
          >
            <span
              style={{
                color: "#94a3b8",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.3px",
              }}
            >
              {t("vocabulary.export.previewFooter")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
