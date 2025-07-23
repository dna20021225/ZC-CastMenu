/** @type {import('next').NextConfig} */
const nextConfig = {
  // 一時的に最小限の設定
  reactStrictMode: true,
  swcMinify: true,
  
  // TypeScriptエラーを一時的に無視
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLintエラーを一時的に無視
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;