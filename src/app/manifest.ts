// PWA の manifest を DB から動的生成する。
// 既に PWA インストール済みの端末では OS 側にアイコンとアプリ名がキャッシュされる仕様のため、
// 名前・アイコンの変更を反映するには「一度アンインストール → 再インストール」が必要。
// （/admin/shop にユーザー向けの案内文を出している）
import type { MetadataRoute } from 'next';
import { loadShop } from '@/lib/shop.server';

// テーマ変更後など、設定変更を即時に PWA に反映させたいため動的レンダリングに固定する。
export const dynamic = 'force-dynamic';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const shop = await loadShop();

  // ロゴ/アイコン未設定時は同梱の静的ファイルにフォールバック。
  // iconUrl が設定されている場合は、ブラウザに応じたサイズを Vercel Blob 等のURLから読ませる。
  const icons: MetadataRoute.Manifest['icons'] = shop.iconUrl
    ? [
        {
          src: shop.iconUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: shop.iconUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ]
    : [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ];

  return {
    name: shop.name,
    short_name: shop.name,
    description: `${shop.name} ${shop.subtitle}`,
    start_url: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons,
    categories: ['entertainment', 'lifestyle'],
    lang: 'ja-JP',
    dir: 'ltr',
    prefer_related_applications: false,
    related_applications: [],
  };
}
