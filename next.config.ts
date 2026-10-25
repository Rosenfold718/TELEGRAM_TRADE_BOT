import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel сам управляет output, не используем standalone
  // (локально можно собрать с standalone через `bun run build:standalone`)
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Для Prisma + Turso на Vercel serverless
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
