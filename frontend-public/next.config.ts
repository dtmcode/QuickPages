// 📂 PFAD: frontend-public/next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Erlaubt alle externen Bilder (Tenant-Bilder kommen von verschiedenen Quellen)
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;