import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Inlines the compiled Tailwind stylesheet into a <style> tag in the
    // initial HTML instead of a render-blocking <link>, eliminating the
    // request/parse round-trip that was sitting in front of the homepage
    // hero's LCP paint. Production builds only — no effect in `next dev`.
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
