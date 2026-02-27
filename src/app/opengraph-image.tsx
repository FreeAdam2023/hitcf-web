import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "HiTCF — TCF Canada 在线练习平台";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  let iconData: ArrayBuffer | null = null;
  try {
    iconData = await fetch(
      new URL("../../public/icon.png", import.meta.url),
    ).then((r) => r.arrayBuffer());
  } catch {
    // fallback: text-only if icon unavailable
  }

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
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #1e40af 30%, #2563eb 60%, #3b82f6 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 100,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />

        {/* Logo + Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 28,
          }}
        >
          {iconData ? (
            <img
              // @ts-expect-error Satori accepts ArrayBuffer as img src
              src={iconData}
              width={110}
              height={110}
              style={{ borderRadius: 24 }}
            />
          ) : null}
          <div
            style={{
              fontSize: 80,
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
            fontSize: 44,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 16,
          }}
        >
          打开就练，刷到 CLB 7
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 4,
            background: "rgba(255,255,255,0.4)",
            borderRadius: 2,
            marginBottom: 20,
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
          每月一杯咖啡钱，8,500+ 道真题随时练
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 36,
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
                  fontSize: 34,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {item.num}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 4,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 36,
            fontSize: 18,
            color: "rgba(255,255,255,0.45)",
            fontWeight: 500,
          }}
        >
          hitcf.com
        </div>
      </div>
    ),
    { ...size },
  );
}
