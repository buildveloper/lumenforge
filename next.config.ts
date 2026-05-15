import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev",
  "img-src 'self' data: blob: https://img.clerk.com https://*.clerk.accounts.dev",
  "font-src 'self' https://*.clerk.accounts.dev",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.ingest.sentry.io",
  "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.clerk.accounts.dev",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
