import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          position: "relative",
        }}
      >
        <span style={{ position: "relative", top: -1 }}>A</span>
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 8,
            height: 8,
            background: "#d7ff35",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
