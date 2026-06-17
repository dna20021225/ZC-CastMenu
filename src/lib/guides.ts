/**
 * 顧客向け画面のご案内文（ハードコーディング時代のデフォルト値）。
 * settings テーブルに保存されていない場合のフォールバックに使う。
 * 改行で区切られた箇条書きフォーマット。
 */

export const DRINKS_GUIDE_KEY = 'drinks_guide';
export const PRICING_GUIDE_KEY = 'pricing_guide';

export const DRINKS_GUIDE_DEFAULT = [
  '価格は全て税込み表示です',
  'キープボトルは開栓後3ヶ月間お預かりいたします',
  'シャンパンタワー等の演出もご相談ください',
  'その他ご要望がございましたらスタッフまでお申し付けください',
].join('\n');

export const PRICING_GUIDE_DEFAULT = [
  '価格は全て税込み表示です',
  '詳細はスタッフまでお気軽にお問い合わせください',
].join('\n');

/**
 * 改行区切りのご案内テキストを配列に変換。
 * 空行・前後の空白は除外する。
 */
export function parseGuide(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
