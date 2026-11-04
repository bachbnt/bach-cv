import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // A static site: Firebase Hosting serves `out/`. Content is read in the browser, so no server is needed.
  output: 'export',
  // parallel dev servers and builds can each use their own folder: NEXT_DIST_DIR=.next-name
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: { unoptimized: true },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
