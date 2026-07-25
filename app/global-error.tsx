"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#f2f0ea",
          color: "#0c1118",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "48px 32px",
            maxWidth: "480px",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#616873",
              marginBottom: "0.75rem",
            }}
          >
            Atheus
          </p>
          <h1
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              margin: "0 0 0.75rem",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: "#616873", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
            An unexpected error occurred loading this page. If this keeps
            happening, get in touch.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#616873",
                fontFamily: "monospace",
                marginBottom: "1.5rem",
              }}
            >
              Error: {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link
              href="/"
              style={{
                padding: "0.5rem 1.25rem",
                background: "#156ee8",
                color: "#fff",
                borderRadius: "4px",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Return home
            </Link>
            <a
              href="mailto:hello@atheus.dev"
              style={{
                padding: "0.5rem 1.25rem",
                border: "1px solid rgba(12,17,24,0.18)",
                borderRadius: "4px",
                textDecoration: "none",
                fontSize: "0.875rem",
                color: "#0c1118",
              }}
            >
              Get support
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
