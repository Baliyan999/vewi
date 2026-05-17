import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Memour — все фото свадьбы в одном альбоме";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, oklch(99% 0.005 95) 0%, oklch(85% 0.06 80 / 0.6) 100%)",
          fontFamily: "system-ui, -apple-system",
          color: "#1a1a1a",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#86553c",
            marginBottom: 20,
          }}
        >
          ⌗ Memour
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.05,
            maxWidth: 1000,
          }}
        >
          Все фото свадьбы — от ваших гостей
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#555",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          QR на столе → камера в браузере → готовый альбом
        </div>
      </div>
    ),
    { ...size },
  );
}
