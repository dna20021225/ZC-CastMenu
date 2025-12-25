"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Save, Users, Wine, Banknote, Bell, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ casts: 0, drinks: 0, categories: 0 });
  const [notice, setNotice] = useState("");
  const [noticeEnabled, setNoticeEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetchStats();
    fetchNotice();
  }, []);

  const fetchStats = async () => {
    try {
      const [castsRes, drinksRes] = await Promise.all([
        fetch('/api/casts'),
        fetch('/api/drinks')
      ]);

      if (castsRes.ok) {
        const data = await castsRes.json();
        setStats(prev => ({ ...prev, casts: data.data?.total || data.data?.casts?.length || 0 }));
      }

      if (drinksRes.ok) {
        const data = await drinksRes.json();
        // APIはカテゴリ配列を返し、各カテゴリにitemsがある
        const categories = Array.isArray(data.data) ? data.data : [];
        const totalDrinks = categories.reduce((sum: number, cat: { items?: unknown[] }) => sum + (cat.items?.length || 0), 0);
        setStats(prev => ({
          ...prev,
          drinks: totalDrinks,
          categories: categories.length
        }));
      }
    } catch (error) {
      console.error("統計情報の取得エラー:", error);
    }
  };

  const fetchNotice = async () => {
    try {
      const res = await fetch('/api/settings?key=notice');
      if (res.ok) {
        const data = await res.json();
        if (data.data?.value) {
          const parsed = JSON.parse(data.data.value);
          setNotice(parsed.text || "");
          setNoticeEnabled(parsed.enabled !== false);
        }
      }
    } catch (error) {
      console.error("お知らせ取得エラー:", error);
    }
  };

  const saveNotice = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'notice',
          value: JSON.stringify({ text: notice, enabled: noticeEnabled })
        })
      });

      if (res.ok) {
        setSaveMessage("保存しました");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("保存に失敗しました");
      }
    } catch (error) {
      console.error("お知らせ保存エラー:", error);
      setSaveMessage("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>ダッシュボード</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </div>

      {/* 統計カード */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* キャスト数 */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <dt className="text-sm font-medium text-secondary">登録キャスト数</dt>
                <dd className="text-3xl font-semibold text-primary">{stats.casts}</dd>
              </div>
            </div>
          </div>
          <div className="bg-surface-variant px-5 py-3 border-t border-border">
            <Link href="/admin/casts" className="text-sm text-primary hover:text-primary/80 transition-colors">
              キャスト管理へ
            </Link>
          </div>
        </div>

        {/* ドリンク数 */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <Wine className="h-8 w-8 text-primary" />
              <div>
                <dt className="text-sm font-medium text-secondary">ドリンクメニュー</dt>
                <dd className="text-3xl font-semibold text-primary">{stats.drinks}<span className="text-sm text-secondary ml-1">品</span></dd>
              </div>
            </div>
          </div>
          <div className="bg-surface-variant px-5 py-3 border-t border-border">
            <Link href="/admin/drinks" className="text-sm text-primary hover:text-primary/80 transition-colors">
              ドリンク管理へ
            </Link>
          </div>
        </div>

        {/* 料金表 */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <Banknote className="h-8 w-8 text-primary" />
              <div>
                <dt className="text-sm font-medium text-secondary">料金表</dt>
                <dd className="text-lg font-semibold text-secondary">未実装</dd>
              </div>
            </div>
          </div>
          <div className="bg-surface-variant px-5 py-3 border-t border-border">
            <Link href="/admin/pricing" className="text-sm text-primary hover:text-primary/80 transition-colors">
              料金表管理へ
            </Link>
          </div>
        </div>
      </div>

      {/* お知らせ編集 */}
      <div id="notice" className="mt-8 scroll-mt-24">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>お知らせ編集</h2>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={noticeEnabled}
                onChange={(e) => setNoticeEnabled(e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-secondary">お知らせを表示する</span>
            </label>
          </div>
          <div>
            <input
              type="text"
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder="例: 12/25: 年末年始の営業時間について"
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'var(--surface-variant)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
            />
            <p className="text-xs text-muted mt-1">ホーム画面上部に表示されます</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveNotice}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "保存中..." : "保存"}
            </button>
            {saveMessage && (
              <span className={`text-sm ${saveMessage.includes("失敗") ? "text-red-500" : "text-green-500"}`}>
                {saveMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>クイックアクション</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/casts/new"
            className="btn-primary text-center"
          >
            新規キャスト登録
          </Link>
          <Link
            href="/"
            target="_blank"
            className="btn-secondary text-center"
          >
            サイトを確認
          </Link>
        </div>
      </div>
    </div>
  );
}
