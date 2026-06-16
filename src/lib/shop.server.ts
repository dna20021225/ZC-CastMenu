// SSR専用: DB からの店舗情報読み込み。
// better-sqlite3 が import されるためクライアント側からは絶対に import しないこと。
// （lib/shop.ts は純粋関数のみで構成されている。クライアントは lib/shop.ts を使う）
import { query } from '@/lib/db';
import { DEFAULT_SHOP, sanitizeShop, type ShopConfig } from '@/lib/shop';

export async function loadShop(): Promise<ShopConfig> {
  try {
    const result = await query("SELECT value FROM settings WHERE key = ?", ['shopName']);
    const row = result.rows[0];
    if (!row?.value) return DEFAULT_SHOP;
    const parsed = JSON.parse(String(row.value));
    return sanitizeShop(parsed);
  } catch {
    return DEFAULT_SHOP;
  }
}
