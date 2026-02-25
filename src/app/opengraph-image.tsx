import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "HiTCF — TCF Canada 在线练习平台";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #3b82f6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            HiTCF
          </div>
        </div>

        {/* Slogan */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 16,
            letterSpacing: "1px",
          }}
        >
          CLB 7，练出来的
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 4,
            background: "rgba(255,255,255,0.5)",
            borderRadius: 2,
            marginBottom: 24,
          }}
        />

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 400,
          }}
        >
          8,500+ 道 TCF Canada 真题 · 在线练习平台
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 40,
          }}
        >
          {[
            { num: "8,500+", label: "真题" },
            { num: "1,200+", label: "题套" },
            { num: "4", label: "科目" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {item.num}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 4,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
