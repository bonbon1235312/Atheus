import { ImageResponse } from "next/og";

export const alt = "atheus — replace half your Discord bots with one.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#13141C",
          backgroundImage:
            "radial-gradient(900px 500px at 50% -10%, rgba(88,101,242,0.35), transparent 60%)",
          color: "#F2F3F8",
          padding: 80,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 100 100">
            <path
              fill="#F2F3F8"
              fillRule="evenodd"
              d="M50 9 L93 91 L69 91 L61 71 L39 71 L31 91 L7 91 Z M50 37 L59 59 L41 59 Z"
            />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>atheus</span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              maxWidth: 1000,
            }}
          >
            Replace half your Discord bots with one.
          </div>
          <div style={{ display: "flex", height: 4, width: 110, background: "#5865F2", marginTop: 32 }} />
          <div style={{ marginTop: 26, fontSize: 34, fontWeight: 400, color: "rgba(242,243,248,0.7)" }}>
            Roles, tickets, forms, giveaways, events and analytics in one bot.
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            fontWeight: 600,
            color: "rgba(242,243,248,0.55)",
          }}
        >
          <span>atheus.dev</span>
          <span style={{ color: "#818CF8" }}>Discord Community OS</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
