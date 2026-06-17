import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn:
    process.env.SENTRY_DSN ??
    "https://9e12db95580607b782cef0aa06e7f4cb@o4511581887135744.ingest.de.sentry.io/4511581889757264",
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
});
