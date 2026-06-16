'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Save, Store, AlertTriangle, Smartphone, RotateCcw } from 'lucide-react';
import { AdminHeader } from '@/components/AdminHeader';
import ImageUploader from '@/components/ImageUploader';
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
      <AdminHeader title="システム管理" backHref="/admin" />

      {/* β版ラベル＆注意書き */}
      <div className="mb-6 max-w-2xl">
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <div className="font-bold text-amber-700 dark:text-amber-400">
              β版機能
            </div>
            <p className="text-secondary leading-relaxed">
              店名・ロゴ・PWAアイコンの変更機能はβ版です。合同店舗の切替などを想定した試験提供のため、
              想定外の表示崩れが起こる可能性があります。
              <br />
              特に <b>PWA（ホーム画面に追加したアプリ）のアイコン名・画像は OS 側でキャッシュされる</b>ため、
              変更後は <b>一度アプリを削除して再インストール</b>する必要があります。
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* 店名・サブタイトル */}
        <section className="cast-card p-5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Store className="w-5 h-5" />
            店名・サブタイトル
          </h2>
          <p className="text-sm text-secondary mb-4">
            ホーム画面のヘッダーとブラウザのタブ名に表示される文字を変更できます。
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

        {/* ヘッダーロゴ */}
        <section className="cast-card p-5">
          <h2 className="text-lg font-bold mb-3">ヘッダーロゴ画像</h2>
          <p className="text-sm text-secondary mb-4">
            ホーム画面ヘッダーの店名の代わりに表示される画像です。設定すると店名テキストの代わりに画像が出ます。
            横長の透過 PNG（推奨: 約 520×128px）を想定しています。
          </p>
          <ImageUploader
            value={shop.logoUrl || undefined}
            onChange={(url) => setShop((s) => ({ ...s, logoUrl: url }))}
            onRemove={() => setShop((s) => ({ ...s, logoUrl: '' }))}
            disabled={!loaded}
            label=""
          />
          {shop.logoUrl && (
            <button
              type="button"
              onClick={() => setShop((s) => ({ ...s, logoUrl: '' }))}
              className="mt-2 text-xs text-muted hover:text-foreground inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              ロゴを使わず店名テキストに戻す
            </button>
          )}
        </section>

        {/* PWAアイコン */}
        <section className="cast-card p-5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            PWAアプリアイコン
          </h2>
          <p className="text-sm text-secondary mb-4">
            ホーム画面に追加したときに表示されるアプリアイコンです。<b>正方形の PNG（推奨: 512×512px 以上）</b>を
            アップロードしてください。未設定の場合は ZEROCLOUD ロゴが使われます。
          </p>
          <ImageUploader
            value={shop.iconUrl || undefined}
            onChange={(url) => setShop((s) => ({ ...s, iconUrl: url }))}
            onRemove={() => setShop((s) => ({ ...s, iconUrl: '' }))}
            disabled={!loaded}
            label=""
          />
          {shop.iconUrl && (
            <button
              type="button"
              onClick={() => setShop((s) => ({ ...s, iconUrl: '' }))}
              className="mt-2 text-xs text-muted hover:text-foreground inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              アイコンをデフォルトに戻す
            </button>
          )}
        </section>

        {/* プレビュー */}
        <section className="cast-card p-5">
          <h2 className="text-sm font-bold mb-3 text-secondary">プレビュー（ホーム画面ヘッダー）</h2>
          <div
            className="rounded-lg border p-6 text-center space-y-2"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {shop.logoUrl ? (
              <div className="flex justify-center">
                <Image
                  src={shop.logoUrl}
                  alt={shop.name || DEFAULT_SHOP.name}
                  width={520}
                  height={128}
                  className="h-16 w-auto object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>
                {shop.name || DEFAULT_SHOP.name}
              </div>
            )}
            <div className="text-sm text-secondary">
              {shop.subtitle || DEFAULT_SHOP.subtitle}
            </div>
          </div>
        </section>

        {/* PWA再インストール手順 */}
        <section className="cast-card p-5 border-amber-500/30">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-600" />
            PWAアプリの再インストール手順
          </h2>
          <p className="text-sm text-secondary mb-3">
            すでにホーム画面に追加したタブレットでアイコン名や画像を反映するには、以下の手順が必要です。
          </p>
          <div className="text-sm space-y-3 text-foreground">
            <div className="space-y-1">
              <div className="font-semibold">iPad / iPhone (Safari)</div>
              <ol className="list-decimal ml-5 space-y-1 text-secondary">
                <li>ホーム画面の既存アプリアイコンを長押し → 「Appを削除」</li>
                <li>Safari で本サイトを開き、共有ボタン → 「ホーム画面に追加」</li>
              </ol>
            </div>
            <div className="space-y-1">
              <div className="font-semibold">Android (Chrome)</div>
              <ol className="list-decimal ml-5 space-y-1 text-secondary">
                <li>ホーム画面の既存アプリアイコンを長押し → 「アンインストール」</li>
                <li>Chrome で本サイトを開き、右上メニュー → 「ホーム画面に追加」</li>
              </ol>
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
