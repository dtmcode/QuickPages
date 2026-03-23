// 📂 PFAD: frontend/next.config.ts UND frontend-public/next.config.ts
// Gleiche Config für beide Projekte

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;