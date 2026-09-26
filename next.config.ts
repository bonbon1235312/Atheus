import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/products", destination: "/services", permanent: true },
      { source: "/products/:path*", destination: "/services", permanent: true },
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/demos", destination: "/work", permanent: true },
      { source: "/about", destination: "/studio", permanent: true },
      { source: "/upgrade", destination: "/services", permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Source-map upload only runs when these are present (CI / deploy). Locally
  // and without an auth token the build still succeeds — uploads are skipped.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
});
