import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content Security Policy, sent as a static header from this config.
//
// Relaxations, each on purpose and recorded in docs/AI-LOG.md:
// - script-src 'unsafe-inline': Next.js hydrates the App Router through inline scripts.
//   A static header cannot carry a per-request nonce, so those scripts need this.
// - script-src 'unsafe-eval' in development only: React Fast Refresh evaluates code.
// - style-src 'unsafe-inline': inline style attributes, which the countdown ring sets
//   for its stroke offset, and the style tags Next.js injects during development.
// - connect-src ws: in development only: the Fast Refresh websocket.
// - upgrade-insecure-requests outside development only: see the note on the directive.
// next/font needs nothing extra. Fonts are downloaded at build time and served from
// this origin, so font-src 'self' covers them.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Production only. WebKit upgrades localhost subresources too, and a plain-http dev
  // server cannot answer https, so with this on Safari refused every stylesheet in dev.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
