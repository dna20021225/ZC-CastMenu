/** @type {import('next').NextConfig} */
const nextConfig = {
  // パフォーマンス最適化設定
  reactStrictMode: true,
  swcMinify: true,
  
  // TypeScriptエラーを一時的に無視
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLintエラーを一時的に無視
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 画像最適化設定
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },

  // バンドルサイズ最適化
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // PWA対応準備
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // 圧縮設定
  compress: true,

  // 最適化設定
  poweredByHeader: false,
  generateEtags: true,
};

module.exports = nextConfig;