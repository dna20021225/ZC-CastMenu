"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Smartphone, X, Info } from 'lucide-react';

interface Cast {
  id: string;
  name: string;
  age: number;
  height: number;
  avatar_url?: string;
  description?: string;
  badges?: Array<{
    id: string;
    name: string;
    color: string;
    display_order: number;
  }>;
}

export default function Home() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotice, setShowNotice] = useState(true);

  useEffect(() => {
    fetchCasts();
  }, []);

  const fetchCasts = async () => {
    try {
      const response = await fetch('/api/casts');
      if (response.ok) {
        const data = await response.json();
        setCasts(data.data?.casts || []);
      } else {
        throw new Error('キャストデータの取得に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="loading-spinner mx-auto"></div>
          <p className="text-secondary">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 tablet-layout">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary">ZC-CastMenu</h1>
            <div className="error-message">
              <p>{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchCasts}
            className="btn-primary"
          >
            <Smartphone className="h-4 w-4" />
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b border-border backdrop-blur-md bg-surface/80">
        <div className="tablet-layout py-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">ZC-CastMenu</h1>
            <p className="text-secondary text-sm">タブレット専用男メニュー</p>
          </div>
        </div>
      </header>

      {/* システムからのお知らせ */}
      {showNotice && (
        <div className="bg-surface-variant/50 border-b border-border">
          <div className="tablet-layout py-2 px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Info className="h-3 w-3 flex-shrink-0" />
                <span>12/25: 管理画面の不具合を修正しました。ご不便をおかけしました。</span>
              </div>
              <button
                onClick={() => setShowNotice(false)}
                className="text-muted hover:text-secondary transition-colors p-1"
                aria-label="閉じる"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="tablet-layout py-6">
        {casts.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <User className="h-16 w-16 text-muted mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">キャストデータがありません</h2>
              <p className="text-secondary">管理画面からキャストを追加してください</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* キャスト数表示 */}
            <div className="text-center">
              <p className="text-secondary">
                全 <span className="text-primary font-semibold">{casts.length}</span> 名のキャスト
              </p>
            </div>

            {/* キャストグリッド */}
            <div className="cast-grid">
              {casts.map((cast) => (
                <Link 
                  key={cast.id} 
                  href={`/cast/${cast.id}`}
                  className="cast-card group block"
                >
                  {/* バッジ表示 */}
                  {cast.badges && cast.badges.length > 0 && (
                    <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 max-w-[70%]">
                      {cast.badges
                        .sort((a, b) => a.display_order - b.display_order)
                        .slice(0, 2)
                        .map((badge) => (
                          <span
                            key={badge.id}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md truncate"
                            style={{
                              background: `linear-gradient(135deg, ${badge.color} 0%, ${badge.color}cc 100%)`,
                              boxShadow: `0 2px 4px ${badge.color}40`
                            }}
                          >
                            {badge.name}
                          </span>
                        ))}
                      {cast.badges.length > 2 && (
                        <span className="text-[10px] text-white/80 pl-1">+{cast.badges.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* 画像セクション */}
                  <div className="cast-card-image relative overflow-hidden">
                    {cast.avatar_url ? (
                      <Image
                        src={cast.avatar_url}
                        alt={cast.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                        priority={casts.indexOf(cast) < 5}
                        loading={casts.indexOf(cast) < 5 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-12 w-12 text-muted" />
                      </div>
                    )}
                    
                    {/* ホバーオーバーレイ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* 情報セクション */}
                  <div className="p-4 space-y-3">
                    {/* 名前 */}
                    <h3 className="text-lg font-bold text-center truncate group-hover:text-primary transition-colors">
                      {cast.name}
                    </h3>

                    {/* 基本情報（要件定義書では任意） */}
                    <div className="flex items-center justify-center gap-4 text-xs text-secondary">
                      <span>{cast.age}歳</span>
                      <span className="w-1 h-1 bg-border rounded-full"></span>
                      <span>{cast.height}cm</span>
                    </div>

                    {/* 説明（要件定義書では任意） */}
                    {cast.description && (
                      <p className="text-xs text-muted text-center line-clamp-2 leading-relaxed">
                        {cast.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}