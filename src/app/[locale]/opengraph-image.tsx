import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "HiTCF — TCF Canada Online Practice";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  let iconData: ArrayBuffer | null = null;
  try {
    iconData = await fetch(
      new URL("../../../public/icon.png", import.meta.url),
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
            gap: 28,
          }}
        >
          {iconData ? (
            <img
              // @ts-expect-error Satori accepts ArrayBuffer as img src
              src={iconData}
              width={140}
              height={140}
              style={{ borderRadius: 28 }}
            />
          ) : null}
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            HiTCF
          </div>
        </div>

        {/* Tagline — language-neutral */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            marginTop: 32,
          }}
        >
          TCF Canada Practice Platform
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 56,
            marginTop: 40,
          }}
        >
          {[
            { num: "8,500+", label: "Questions" },
            { num: "1,200+", label: "Test Sets" },
            { num: "4", label: "Sections" },
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
                  fontSize: 15,
                  color: "rgba(255,255,255,0.55)",
                  marginTop: 4,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
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
