// 店舗情報（タイトル・サブタイトル）の型と純粋関数のみ。
// DBアクセスはクライアントバンドルに better-sqlite3 を混入させないよう lib/shop.server.ts に分離している。

export interface ShopConfig {
  name: string;       // 大きい文字 / <title>
  subtitle: string;   // ヘッダーの小さい文字
}

export const DEFAULT_SHOP: ShopConfig = {
  name: 'ZC-CastMenu',
  subtitle: 'タブレット専用男メニュー',
};

// 任意 unknown を安全に ShopConfig に寄せる。
// 空文字や型違反はデフォルトにフォールバックして「タイトル空白」事故を避ける。
export function sanitizeShop(input: unknown): ShopConfig {
  if (!input || typeof input !== 'object') return DEFAULT_SHOP;
  const obj = input as Record<string, unknown>;
  const pick = (k: keyof ShopConfig): string => {
    const v = obj[k];
    if (typeof v !== 'string') return DEFAULT_SHOP[k];
    const trimmed = v.trim();
    return trimmed.length === 0 ? DEFAULT_SHOP[k] : trimmed;
  };
  return {
    name: pick('name'),
    subtitle: pick('subtitle'),
  };
}
