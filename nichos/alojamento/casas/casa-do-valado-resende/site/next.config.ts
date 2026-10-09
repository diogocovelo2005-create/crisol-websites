import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    formats: ['image/webp'],
    qualities: [75, 85, 86, 88, 90, 99],
  },
  experimental: {
    optimizePackageImports: ['motion', '@phosphor-icons/react'],
  },
  allowedDevOrigins: ['192.168.1.72', '127.0.0.1', 'localhost'],
};

export default config;
