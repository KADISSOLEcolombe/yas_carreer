import type { NextConfig } from "next";

// The frontend is now a separate origin, so the API must send CORS headers.
// Set FRONTEND_URL to your frontend's origin (e.g. https://app.yascareer.tg).
// "*" is used as a permissive fallback in dev when FRONTEND_URL is unset.
const allowedOrigin = process.env.FRONTEND_URL || "*";

const nextConfig: NextConfig = {
  // pdf-parse, mammoth & pdfkit are server-only; keep them out of the bundle
  // (pdfkit loads its .afm font files via paths relative to its own
  // node_modules folder — bundling breaks that at runtime).
  serverExternalPackages: ["pdf-parse", "mammoth", "pdfkit"],

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: allowedOrigin },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: allowedOrigin },
        ],
      },
    ];
  },
};

export default nextConfig;
