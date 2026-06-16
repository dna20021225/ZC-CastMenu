// 店舗情報（タイトル・サブタイトル・ロゴ・PWAアイコン）の型と純粋関数のみ。
// DBアクセスはクライアントバンドルに better-sqlite3 を混入させないよう lib/shop.server.ts に分離している。

export interface ShopConfig {
  name: string;       // 大きい文字 / <title> / PWA name
  subtitle: string;   // ヘッダーの小さい文字
  logoUrl: string;    // ホーム画面ヘッダーに表示するロゴ画像URL（空文字なら文字のみ）
  iconUrl: string;    // PWAアイコン用画像URL（空文字なら静的な /icon-192.png /icon-512.png にフォールバック）
}

export const DEFAULT_SHOP: ShopConfig = {
  name: 'ZC-CastMenu',
  subtitle: 'タブレット専用男メニュー',
  logoUrl: '',
  iconUrl: '',
};

// 任意 unknown を安全に ShopConfig に寄せる。
// 空文字や型違反はデフォルトにフォールバックして「タイトル空白」事故を避ける。
// URL系（logoUrl/iconUrl）は空文字を許容し、未指定はデフォルトの空文字とする。
export function sanitizeShop(input: unknown): ShopConfig {
  if (!input || typeof input !== 'object') return DEFAULT_SHOP;
  const obj = input as Record<string, unknown>;

  const pickText = (k: 'name' | 'subtitle'): string => {
    const v = obj[k];
    if (typeof v !== 'string') return DEFAULT_SHOP[k];
    const trimmed = v.trim();
    return trimmed.length === 0 ? DEFAULT_SHOP[k] : trimmed;
  };

  // URLは空文字を許容（未設定状態の表現）。文字列以外は空文字に倒す。
  const pickUrl = (k: 'logoUrl' | 'iconUrl'): string => {
    const v = obj[k];
    if (typeof v !== 'string') return '';
    return v.trim();
  };

  return {
    name: pickText('name'),
    subtitle: pickText('subtitle'),
    logoUrl: pickUrl('logoUrl'),
    iconUrl: pickUrl('iconUrl'),
  };
}
