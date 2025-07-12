'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CastGrid } from '@/components/cast/CastGrid';
import { Button } from '@/components/ui/Button';
import { CastDetail, CastSearchParams } from '@/types';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [casts, setCasts] = useState<CastDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // 画面向きの検出
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  // キャストデータの取得
  const fetchCasts = async (params: CastSearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      
      const response = await fetch(`/api/casts?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('キャストデータの取得に失敗しました');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCasts(data.data.casts || []);
      } else {
        setError(data.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    fetchCasts();
  }, []);

  // 検索実行
  const handleSearch = () => {
    fetchCasts({ search: searchQuery });
  };

  // キャストクリック時の処理
  const handleCastClick = (cast: CastDetail) => {
    router.push(`/cast/${cast.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            キャスト一覧
          </h1>
        </div>
      </header>

      {/* 検索・フィルタエリア */}
      <section className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          {/* 検索バー */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="キャスト名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <Button onClick={handleSearch} variant="primary" size="md">
              検索
            </Button>
          </div>

          {/* フィルタボタン */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              フィルタ
            </Button>
            
            <div className="text-sm text-gray-500">
              {loading ? '読み込み中...' : `${casts.length}人のキャスト`}
            </div>
          </div>

          {/* フィルタエリア（将来実装） */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                詳細フィルタ機能は次回のアップデートで実装予定です
              </p>
            </div>
          )}
        </div>
      </section>

      {/* エラー表示 */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <Button
            onClick={() => fetchCasts()}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            再試行
          </Button>
        </div>
      )}

      {/* キャスト一覧 */}
      <section className="flex-1">
        <CastGrid
          casts={casts}
          orientation={orientation}
          loading={loading}
          onCastClick={handleCastClick}
          emptyMessage="キャストが見つかりません"
        />
      </section>

      {/* ページネーション（将来実装） */}
      {!loading && !error && casts.length > 0 && (
        <section className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="flex justify-center">
            <p className="text-sm text-gray-600">
              ページネーション機能は次回のアップデートで実装予定です
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
