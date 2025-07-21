/** @type {import('next').NextConfig} */
const nextConfig = {
  // 実験的機能の有効化
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'recharts'
    ],
  },

  // 画像最適化の設定
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1週間
    dangerouslyAllowSVG: false,
  },

  // パフォーマンス最適化
  compress: true,
  poweredByHeader: false,
  
  // セキュリティヘッダー
  async headers() {
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      }
    ];
  },

  // PWA対応のための設定
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/api/sw'
      }
    ];
  },

  // バンドル分析（BUILD_ANALYZE=trueで実行時）
  webpack: (config, { dev, isServer }) => {
    // バンドル分析
    if (process.env.BUILD_ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer ? 'server-bundle-report.html' : 'client-bundle-report.html'
        })
      );
    }

    // 開発環境での最適化を無効化（ビルド速度向上）
    if (dev) {
      config.optimization.minimize = false;
    }

    // Tree shaking の最適化
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    return config;
  },

  // ログ設定
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development'
    }
  },

  // 型チェックの設定
  typescript: {
    // 本番ビルド時に型エラーを無視しない
    ignoreBuildErrors: false,
  },

  // ESLintの設定
  eslint: {
    // 本番ビルド時にESLintエラーを無視しない
    ignoreDuringBuilds: false,
  }
};

module.exports = nextConfig;