import type { NextConfig } from 'next';

// PWA is configured as a progressive enhancement.
// @ducanh2912/next-pwa is loaded conditionally only in production
// to avoid Turbopack conflicts in development (Next.js 16+).
const nextConfig: NextConfig = {
  // Suppress Turbopack webpack-config warning from PWA plugins
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
    ];
  },
};

// Wrap with PWA only in production to avoid dev Turbopack conflicts
let config: NextConfig = nextConfig;

if (process.env.NODE_ENV === 'production') {
  const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    register: true,
    skipWaiting: true,
  });
  config = withPWA(nextConfig);
}

export default config;
