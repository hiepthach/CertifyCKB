/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ckb-ccc/core', '@ckb-ccc/connector-react', '@spore-sdk/core'],
}

module.exports = nextConfig
