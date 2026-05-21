import { ImageResponse } from "next/og";

export const alt = "ATHEUS — Websites with identity, built to feel intentional.";
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
          background: "#050505",
          color: "#f4efe6",
          padding: 72,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundImage:
            "linear-gradient(rgba(241,238,229,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(241,238,229,0.05) 1px, transparent 1px)",
          backgroundSize: "86px 86px",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(241,238,229,0.18)",
            borderBottom: "1px solid rgba(241,238,229,0.18)",
            paddingBlock: 16,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#d7ff35",
            }}
          >
            Studio
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(241,238,229,0.6)",
            }}
          >
            atheus.dev
          </span>
        </div>

        {/* Wordmark + tagline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 240,
              fontWeight: 900,
              lineHeight: 0.84,
              letterSpacing: "-0.06em",
              color: "#f4efe6",
            }}
          >
            ATHEUS
          </div>
          <div
            style={{
              height: 2,
              background: "#d7ff35",
              width: 96,
              marginTop: 36,
            }}
          />
          <div
            style={{
              marginTop: 28,
              fontSize: 42,
              lineHeight: 1.18,
              maxWidth: 920,
              fontWeight: 500,
              color: "rgba(244,239,230,0.92)",
            }}
          >
            Websites with identity, built to feel intentional.
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 18,
            borderTop: "1px solid rgba(241,238,229,0.18)",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(241,238,229,0.55)",
          }}
        >
          <span>Hawthorne · Saplings · Forge House · Cinder &amp; Clover</span>
          <span style={{ color: "#d7ff35" }}>Independent businesses</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
