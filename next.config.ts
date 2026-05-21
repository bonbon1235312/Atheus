import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Each /demos/<slug> URL is served by the standalone HTML
  // sitting in public/demos/<slug>/index.html. This keeps the
  // four polished sub-site sources editable as plain HTML
  // (no JSX conversion) while keeping clean URLs on atheus.dev.
  async rewrites() {
    return [
      { source: "/demos/:slug", destination: "/demos/:slug/index.html" },
    ];
  },
};

export default nextConfig;
