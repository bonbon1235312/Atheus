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
          background: "#13141C",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 100 100">
          <path
            fill="#F2F3F8"
            fillRule="evenodd"
            d="M50 9 L93 91 L69 91 L61 71 L39 71 L31 91 L7 91 Z M50 37 L59 59 L41 59 Z"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
