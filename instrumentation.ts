import * as Sentry from "@sentry/nextjs";

import { describeError, forwardToDevBot } from "@/lib/monitoring";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture server-side request errors in Sentry and forward them to the dev bot
// so they appear instantly in the support server's #dev-alerts channel.
export const onRequestError = async (
  ...args: Parameters<typeof Sentry.captureRequestError>
) => {
  const [error, request, context] = args;
  Sentry.captureRequestError(error, request, context);

  const { message, stack } = describeError(error);
  await forwardToDevBot({
    message,
    stack,
    context: `${context.routerKind} ${context.routePath} · ${request.method} ${request.path}`,
  });
};
