/**
 * Forwards captured errors to the atheus dev bot, which posts them into the
 * staff-only #dev-alerts channel. This runs alongside Sentry: Sentry keeps the
 * full history and stack traces, while this gives staff an instant Discord ping.
 *
 * Both ATHEUS_ALERT_URL and ATHEUS_ALERT_SECRET must be set for forwarding to
 * happen; otherwise it is a no-op. Failures here are swallowed so monitoring can
 * never take the app down.
 */

type DevBotAlert = {
  service?: string;
  environment?: string;
  level?: string;
  message: string;
  context?: string;
  fingerprint?: string;
  stack?: string;
  sentryUrl?: string;
  timestamp?: string;
};

export function describeError(error: unknown): {
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

export async function forwardToDevBot(alert: DevBotAlert): Promise<void> {
  const url = process.env.ATHEUS_ALERT_URL;
  const secret = process.env.ATHEUS_ALERT_SECRET;
  if (!url || !secret) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-atheus-alert-secret": secret,
      },
      body: JSON.stringify({
        service: "website",
        environment: process.env.NODE_ENV ?? "production",
        level: "error",
        timestamp: new Date().toISOString(),
        ...alert,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Monitoring must never break the request path.
  }
}

/**
 * Capture an error to Sentry and forward it to the dev bot in one call. Use this
 * in server-side catch blocks (server actions, route handlers) where you handle
 * the error yourself and Next's onRequestError hook won't see it.
 */
export async function reportError(
  error: unknown,
  context?: string,
): Promise<void> {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureException(error, context ? { extra: { context } } : undefined);
  const { message, stack } = describeError(error);
  await forwardToDevBot({ message, stack, context });
}
