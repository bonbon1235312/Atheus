import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#f4efe6",
          fontSize: 140,
          fontWeight: 900,
          letterSpacing: "-0.06em",
          position: "relative",
        }}
      >
        <span style={{ position: "relative", top: -4 }}>A</span>
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 40,
            height: 40,
            background: "#d7ff35",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
