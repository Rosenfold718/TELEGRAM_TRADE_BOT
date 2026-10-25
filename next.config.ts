import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel сам управляет output, не нужно standalone
  // (но оставляем для локальной сборки через `bun run build`)
  output: process.env.VERCEL ? undefined : "standalone",
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
