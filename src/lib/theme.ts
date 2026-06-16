// テーマ設定の型定義と派生ロジック
// 保存形式: settings テーブルの key='theme' に JSON で保存

export interface ThemeConfig {
  primary: string;       // ボタン・リンク・強調色（例: #3b82f6）
  background: string;    // ページ全体の背景（例: #ffffff）
  surface: string;       // カード・パネルの背景（例: #ffffff）
  foreground: string;    // 主要テキスト色（例: #18181b）
  accent: string;        // ハイライト色（例: #f59e0b）
}

export const DEFAULT_THEME: ThemeConfig = {
  primary: '#3b82f6',
  background: '#ffffff',
  surface: '#ffffff',
  foreground: '#18181b',
  accent: '#f59e0b',
};

// HEX 文字列のバリデーション（# + 6桁の16進数）
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
export function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value);
}

// 不正な保存値を安全に DEFAULT に寄せる
export function sanitizeTheme(input: unknown): ThemeConfig {
  if (!input || typeof input !== 'object') return DEFAULT_THEME;
  const obj = input as Record<string, unknown>;
  const pick = (k: keyof ThemeConfig): string => {
    const v = obj[k];
    return typeof v === 'string' && isValidHex(v) ? v : DEFAULT_THEME[k];
  };
  return {
    primary: pick('primary'),
    background: pick('background'),
    surface: pick('surface'),
    foreground: pick('foreground'),
    accent: pick('accent'),
  };
}

// HEX → RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

// WCAG 相対輝度（0〜1）
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const linearize = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

// 2色のコントラスト比（1:1 〜 21:1）。WCAG AA: 通常テキスト 4.5、大きいテキスト 3
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// 背景色に対して可読性の高い前景（白 or 黒）を返す
export function readableForeground(background: string): '#ffffff' | '#000000' {
  const whiteRatio = contrastRatio(background, '#ffffff');
  const blackRatio = contrastRatio(background, '#000000');
  return whiteRatio >= blackRatio ? '#ffffff' : '#000000';
}

// HEX を 色相シフトせずに amount だけ暗く/明るくする
// amount > 0 で明るく、< 0 で暗く
function adjustLightness(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (c: number) => {
    const next = c + Math.round(255 * amount);
    return Math.max(0, Math.min(255, next));
  };
  const to2 = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to2(adjust(r))}${to2(adjust(g))}${to2(adjust(b))}`;
}

// プライマリ色から 50〜900 のスケールを派生
// 元の HEX を 500 として、明度を上下にずらす
export function deriveScale(primary: string): Record<string, string> {
  return {
    '50':  adjustLightness(primary, 0.45),
    '100': adjustLightness(primary, 0.38),
    '200': adjustLightness(primary, 0.30),
    '300': adjustLightness(primary, 0.20),
    '400': adjustLightness(primary, 0.10),
    '500': primary,
    '600': adjustLightness(primary, -0.06),
    '700': adjustLightness(primary, -0.12),
    '800': adjustLightness(primary, -0.18),
    '900': adjustLightness(primary, -0.24),
    '950': adjustLightness(primary, -0.30),
  };
}

// テーマから派生する補助色
export function deriveAuxColors(theme: ThemeConfig) {
  const onPrimary = readableForeground(theme.primary);
  // secondary は foreground を 30% 薄める
  const secondary = mix(theme.foreground, theme.background, 0.45);
  const muted = mix(theme.foreground, theme.background, 0.65);
  const border = mix(theme.foreground, theme.background, 0.85);
  // surface-variant は surface を foreground 方向に少しだけ寄せる
  const surfaceVariant = mix(theme.surface, theme.foreground, 0.05);
  return { onPrimary, secondary, muted, border, surfaceVariant };
}

// 色を ratio で混ぜる（0=a, 1=b）
function mix(a: string, b: string, ratio: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const blend = (x: number, y: number) => Math.round(x + (y - x) * ratio);
  const to2 = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to2(blend(ca.r, cb.r))}${to2(blend(ca.g, cb.g))}${to2(blend(ca.b, cb.b))}`;
}

// テーマ設定から CSS 変数の文字列を生成。
// layout.tsx で <style>{generated}</style> としてSSR時に注入する想定。
export function themeToCssVars(theme: ThemeConfig): string {
  const scale = deriveScale(theme.primary);
  const aux = deriveAuxColors(theme);
  const lines = [
    `--primary-50: ${scale['50']};`,
    `--primary-100: ${scale['100']};`,
    `--primary-200: ${scale['200']};`,
    `--primary-300: ${scale['300']};`,
    `--primary-400: ${scale['400']};`,
    `--primary-500: ${scale['500']};`,
    `--primary-600: ${scale['600']};`,
    `--primary-700: ${scale['700']};`,
    `--primary-800: ${scale['800']};`,
    `--primary-900: ${scale['900']};`,
    `--primary-950: ${scale['950']};`,
    `--background: ${theme.background};`,
    `--foreground: ${theme.foreground};`,
    `--surface: ${theme.surface};`,
    `--surface-variant: ${aux.surfaceVariant};`,
    `--border: ${aux.border};`,
    `--secondary: ${aux.secondary};`,
    `--muted: ${aux.muted};`,
    `--foreground-on-primary: ${aux.onPrimary};`,
    `--accent: ${theme.accent};`,
    `--warning: ${theme.accent};`,
  ];
  return `:root{${lines.join('')}}`;
}
