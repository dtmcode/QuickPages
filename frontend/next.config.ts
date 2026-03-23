// 📂 PFAD: frontend/next.config.ts UND frontend-public/next.config.ts
// Gleiche Config für beide Projekte

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Standalone Output für Docker
  output: 'standalone',

  // ✅ Bilder von externen Quellen erlauben
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

  // ✅ Powered-by Header entfernen
  poweredByHeader: false,
};

export default nextConfig;