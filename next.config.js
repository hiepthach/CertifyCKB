/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ckb-ccc/core', '@ckb-ccc/connector-react', '@spore-sdk/core'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;
