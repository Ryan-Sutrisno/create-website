import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow production build to succeed even if there are ESLint or TypeScript errors.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows builds with lint errors. Use cautiously.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
