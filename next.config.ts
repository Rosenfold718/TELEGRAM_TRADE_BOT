import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone для Docker/VPS деплоя (Vercel игнорирует это)
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Для Prisma + Turso
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
