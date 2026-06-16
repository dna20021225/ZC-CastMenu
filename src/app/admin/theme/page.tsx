'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, RotateCcw, Palette, AlertTriangle } from 'lucide-react';
import { AdminHeader } from '@/components/AdminHeader';
import {
  ThemeConfig,
  DEFAULT_THEME,
  sanitizeTheme,
  contrastRatio,
  themeToCssVars,
} from '@/lib/theme';

const FIELDS: Array<{ key: keyof ThemeConfig; label: string; desc: string }> = [
  { key: 'primary', label: 'プライマリ色', desc: 'ボタン・リンク・強調色' },
  { key: 'background', label: '背景色', desc: 'ページ全体の背景' },
  { key: 'surface', label: 'サーフェイス色', desc: 'カード・パネルの背景' },
  { key: 'foreground', label: '文字色', desc: '通常テキストの色' },
  { key: 'accent', label: 'アクセント色', desc: 'お知らせアイコンや警告の色' },
];

// プリセット
const PRESETS: Array<{ name: string; theme: ThemeConfig }> = [
  {
    name: '青基調（標準）',
    theme: { primary: '#3b82f6', background: '#ffffff', surface: '#ffffff', foreground: '#18181b', accent: '#f59e0b' },
  },
  {
    name: 'ピンク基調',
    theme: { primary: '#ec4899', background: '#fff7fb', surface: '#ffffff', foreground: '#18181b', accent: '#f59e0b' },
  },
  {
    name: '黒＋金',
    theme: { primary: '#d4af37', background: '#0a0a0a', surface: '#1a1a1a', foreground: '#f5f5f0', accent: '#d4af37' },
  },
];

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  // 初回 fetch が終わったかフラグ。終わるまでは UI を編集不可にする（編集中上書きの罠回避）
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // プレビューだけテーマを当てるためのコンテナ参照
  const previewRef = useRef<HTMLDivElement>(null);

  // 初回のみ fetch。依存配列を空にしてマウント時1回限定。
  // GuideEditor で起きた "fetch が編集中テキストを上書きする" 罠を回避。
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/settings?key=theme');
        if (!res.ok) throw new Error('取得失敗');
        const data = await res.json();
        if (cancelled) return;
        if (data.data?.value) {
          const parsed = JSON.parse(data.data.value);
          setTheme(sanitizeTheme(parsed));
        }
      } catch {
        // 失敗してもデフォルトテーマで継続
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // プレビューに CSS 変数を当てる
  // 注意: style.cssText で全上書きすると JSX 側の inline style（background/color等）が消える。
  // setProperty で個別に当てて、JSX 側の inline style と共存させる。
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const css = themeToCssVars(theme);
    const inner = css.replace(/^:root\{|\}$/g, '');
    inner.split(';').forEach((decl) => {
      const idx = decl.indexOf(':');
      if (idx < 0) return;
      const name = decl.slice(0, idx).trim();
      const value = decl.slice(idx + 1).trim();
      if (name.startsWith('--')) el.style.setProperty(name, value);
    });
  }, [theme]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'theme', value: JSON.stringify(theme) }),
      });
      if (!res.ok) throw new Error('保存失敗');
      setMessage({ type: 'success', text: '保存しました。ページを再読み込みすると全画面に反映されます。' });
    } catch {
      setMessage({ type: 'error', text: '保存に失敗しました。' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('青基調の初期テーマに戻します。よろしいですか？')) return;
    setTheme(DEFAULT_THEME);
  };

  const applyPreset = (preset: ThemeConfig) => {
    setTheme(preset);
  };

  // コントラスト警告
  const warnings: string[] = [];
  if (contrastRatio(theme.background, theme.foreground) < 4.5) {
    warnings.push('背景色と文字色のコントラストが不足しています（推奨: 4.5以上）。文字が読みづらくなる可能性があります。');
  }
  if (contrastRatio(theme.surface, theme.foreground) < 4.5) {
    warnings.push('サーフェイス色と文字色のコントラストが不足しています。カード内の文字が読みづらくなる可能性があります。');
  }

  return (
    <div>
      <AdminHeader title="デザイン調整" backHref="/admin" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左: 編集パネル */}
        <div className="space-y-6">
          {/* プリセット */}
          <section className="cast-card p-5">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              プリセット
            </h2>
            <p className="text-sm text-secondary mb-4">
              よく使う配色から選んで、そのまま使うか好みで微調整できます。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.theme)}
                  disabled={!loaded}
                  className="btn-secondary text-sm disabled:opacity-50"
                  type="button"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </section>

          {/* 個別調整 */}
          <section className="cast-card p-5">
            <h2 className="text-lg font-bold mb-4">配色を調整</h2>
            <div className="space-y-4">
              {FIELDS.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-4">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))}
                    disabled={!loaded}
                    className="w-14 h-14 rounded cursor-pointer border border-border disabled:opacity-50"
                    aria-label={label}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-muted">{desc}</div>
                  </div>
                  <code className="text-xs text-secondary bg-surface-variant px-2 py-1 rounded">
                    {theme[key].toUpperCase()}
                  </code>
                </div>
              ))}
            </div>
          </section>

          {/* 警告 */}
          {warnings.length > 0 && (
            <section className="cast-card p-4" style={{ borderColor: 'var(--warning)' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: 'var(--warning)' }} />
                <div className="space-y-1 text-sm">
                  <div className="font-bold" style={{ color: 'var(--warning)' }}>可読性の警告</div>
                  {warnings.map((w, i) => (
                    <div key={i} className="text-secondary">{w}</div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* アクションボタン */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!loaded || saving}
              className="btn-primary disabled:opacity-50"
              type="button"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={handleReset}
              disabled={!loaded}
              className="btn-secondary disabled:opacity-50"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
              初期テーマに戻す
            </button>
            {message && (
              <span
                className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
              >
                {message.text}
              </span>
            )}
          </div>
        </div>

        {/* 右: プレビュー */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">プレビュー</h2>
          <p className="text-sm text-secondary">
            ここの見え方が、保存後の全画面に反映されます。
          </p>
          <div
            ref={previewRef}
            className="rounded-xl border p-6 space-y-4"
            style={{
              background: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)',
            }}
          >
            {/* タイトル */}
            <h3 className="text-2xl font-bold" style={{ color: 'var(--primary-500)' }}>
              サンプル画面
            </h3>
            <p style={{ color: 'var(--secondary)' }} className="text-sm">
              この文章は補助テキストの見え方サンプルです。
            </p>

            {/* カード */}
            <div
              className="rounded-lg p-4 space-y-2"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="font-bold">カード内タイトル</div>
              <div className="text-sm" style={{ color: 'var(--secondary)' }}>
                カードの中の本文サンプル。サーフェイス色の上に乗ります。
              </div>
              <div
                className="rounded p-2 text-sm"
                style={{ background: 'var(--surface-variant)' }}
              >
                行アイテム（hover背景）
              </div>
            </div>

            {/* ボタン */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md font-semibold"
                style={{
                  background: 'var(--primary-600)',
                  color: 'var(--foreground-on-primary)',
                }}
              >
                プライマリボタン
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md font-semibold"
                style={{
                  background: 'transparent',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                セカンダリ
              </button>
            </div>

            {/* バッジ */}
            <div className="flex gap-2">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: 'var(--primary-600)',
                  color: 'var(--foreground-on-primary)',
                }}
              >
                バッジ
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: 'var(--accent)',
                  color: '#000000',
                }}
              >
                アクセント
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
