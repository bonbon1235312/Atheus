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
      {
        source: "/services",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/projects",
        destination: "/products",
        permanent: true,
      },
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
