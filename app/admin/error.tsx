"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const isAuthError =
    error.message?.toLowerCase().includes("secret") ||
    error.message?.toLowerCase().includes("auth");

  return (
    <main className="access-page">
      <section className="access-panel">
        <Link className="wordmark access-wordmark-inline" href="/" aria-label="Atheus home">
          <span className="wordmark-mark">A</span>
          <span>ATHEUS</span>
        </Link>

        <div className="access-panel-body">
          <div className="access-copy">
            <p className="eyebrow">League administration</p>
            <h1>Unable to load.</h1>
            <p>
              {isAuthError
                ? "The authentication service is not configured correctly. This is a server configuration issue — contact the Atheus administrator."
                : "An error occurred loading the admin area. Try refreshing the page."}
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "monospace" }}>
                Error: {error.digest}
              </p>
            )}
          </div>
          <div className="access-auth">
            <button className="button button-primary" onClick={reset}>
              Try again
            </button>
            <a
              className="access-support-link"
              href="https://discord.gg/dPrMMc82bf"
              rel="noreferrer"
              target="_blank"
            >
              Need help? Join the support Discord
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
