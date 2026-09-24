import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "54px 64px 50px",
        background: "#f2f0e9",
        color: "#22221f",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 22,
          borderBottom: "2px solid #22221f",
          fontSize: 23,
          fontWeight: 700,
        }}
      >
        <span>Atheus</span>
        <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: 3 }}>DESIGN & DEVELOPMENT / UK</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 25, fontWeight: 700, letterSpacing: 4, color: "#c34322" }}>
          INDEPENDENT DIGITAL STUDIO
        </span>
        <span style={{ fontSize: 112, fontWeight: 700, letterSpacing: -8, lineHeight: 1.08, marginTop: 22 }}>
          Websites with
        </span>
        <span style={{ fontSize: 112, fontWeight: 700, letterSpacing: -8, lineHeight: 1.08 }}>
          presence<span style={{ color: "#e2512d" }}>.</span>
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 18,
          borderTop: "2px solid #22221f",
          fontSize: 20,
        }}
      >
        <span>Expressive websites. Useful digital products.</span>
        <span>atheus.dev ↗</span>
      </div>
    </div>,
    size,
  );
}
