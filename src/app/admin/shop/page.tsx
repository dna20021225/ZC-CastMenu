'use client';

import { useState, useEffect } from 'react';
import { Save, Store } from 'lucide-react';
import { AdminHeader } from '@/components/AdminHeader';
import { DEFAULT_SHOP, sanitizeShop, type ShopConfig } from '@/lib/shop';

export default function ShopPage() {
  const [shop, setShop] = useState<ShopConfig>(DEFAULT_SHOP);
  // 初回 fetch が終わるまで UI を編集不可にして、編集中に fetch が値を上書きする罠を避ける。
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 初回マウント時のみ fetch。依存配列は空に固定する（GuideEditor の上書きバグ回避）。
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/settings?key=shopName');
        if (!res.ok) throw new Error('取得失敗');
        const data = await res.json();
        if (cancelled) return;
        if (data.data?.value) {
          setShop(sanitizeShop(JSON.parse(data.data.value)));
        }
      } catch {
        // 失敗してもデフォルトのまま表示続行
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    // 保存直前に空白除去＆空文字チェック。空ならデフォルトに戻る。
    const cleaned = sanitizeShop(shop);
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'shopName', value: JSON.stringify(cleaned) }),
      });
      if (!res.ok) throw new Error('保存失敗');
      setMessage({ type: 'success', text: '保存しました。自動的に再読み込みします…' });
      // テーマと同じく PWA を考慮して強制リロード。
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
        }
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        }
      } catch {
        // キャッシュクリア失敗でもリロード自体は続行
      }
      setTimeout(() => {
        window.location.href = `/admin/shop?t=${Date.now()}`;
      }, 600);
    } catch {
      setMessage({ type: 'error', text: '保存に失敗しました。' });
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('店舗情報を初期値に戻します。よろしいですか？')) return;
    setShop(DEFAULT_SHOP);
  };

  return (
    <div>
      <AdminHeader title="店舗情報" backHref="/admin" />

      <div className="max-w-2xl space-y-6">
        <section className="cast-card p-5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Store className="w-5 h-5" />
            店名・サブタイトル
          </h2>
          <p className="text-sm text-secondary mb-4">
            ホーム画面のヘッダーとブラウザのタブ名に表示される文字を変更できます。
            合同店舗での運用変更などに利用してください。
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">店名（大きい文字）</label>
              <input
                type="text"
                value={shop.name}
                onChange={(e) => setShop((s) => ({ ...s, name: e.target.value }))}
                disabled={!loaded}
                placeholder={DEFAULT_SHOP.name}
                maxLength={40}
                className="w-full px-3 py-2 rounded-md disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--surface-variant)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              <p className="text-xs text-muted mt-1">ホーム上部とタブ名に表示されます（最大40文字）</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">サブタイトル（小さい文字）</label>
              <input
                type="text"
                value={shop.subtitle}
                onChange={(e) => setShop((s) => ({ ...s, subtitle: e.target.value }))}
                disabled={!loaded}
                placeholder={DEFAULT_SHOP.subtitle}
                maxLength={60}
                className="w-full px-3 py-2 rounded-md disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--surface-variant)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              <p className="text-xs text-muted mt-1">店名の下に小さく表示されます（最大60文字）</p>
            </div>
          </div>
        </section>

        {/* プレビュー */}
        <section className="cast-card p-5">
          <h2 className="text-sm font-bold mb-3 text-secondary">プレビュー</h2>
          <div
            className="rounded-lg border p-6 text-center space-y-1"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>
              {shop.name || DEFAULT_SHOP.name}
            </div>
            <div className="text-sm text-secondary">
              {shop.subtitle || DEFAULT_SHOP.subtitle}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!loaded || saving}
            className="btn-primary disabled:opacity-50 flex items-center gap-2"
            type="button"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={handleReset}
            disabled={!loaded || saving}
            className="btn-secondary disabled:opacity-50"
            type="button"
          >
            初期値に戻す
          </button>
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
