import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Menonaktifkan ESLint checking saat proses build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Menonaktifkan TypeScript checking saat proses build
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    return config;
  },
};

export default nextConfig;
