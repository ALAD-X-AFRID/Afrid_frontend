import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "linear-gradient(135deg, #03040d 0%, #183322 50%, #03040d 100%)",
          color: "#F5E6D3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #39e0ff, #b27bff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "#03040d",
            }}
          >
            A
          </div>
          <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: 4 }}>AFRID</span>
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, textAlign: "center", maxWidth: 900, lineHeight: 1.2 }}>
          The Foundation of Sovereign Intelligence
        </div>
        <div style={{ fontSize: 24, color: "#9DBAAE", marginTop: 16, textAlign: "center", maxWidth: 800 }}>
          Turn your voice, your language, your everyday actions into high-value infrastructure.
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 32,
          }}
        >
          {["2,000+ Voices", "60+ Languages", "23% Coverage"].map((stat) => (
            <div
              key={stat}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                background: "rgba(57, 224, 255,0.12)",
                border: "1px solid rgba(57, 224, 255,0.3)",
                fontSize: 18,
                color: "#39e0ff",
                fontWeight: 600,
              }}
            >
              {stat}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
