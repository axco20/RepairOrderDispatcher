import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // your other Next.js config options…

  // 1) skip TypeScript errors at build time
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2) skip ESLint errors at build time
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

