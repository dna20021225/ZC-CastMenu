'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CastGrid } from '@/components/cast/CastGrid';
import { Button } from '@/components/ui/Button';
import { CastDetail, CastSearchParams } from '@/types';
import { Badge as BadgeType } from '@/types/database';
import { ApiResponse, CastListResponse } from '@/types/api';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [casts, setCasts] = useState<CastDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  // フィルタ状態
  const [availableBadges, setAvailableBadges] = useState<BadgeType[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState<string>('');
  const [ageMax, setAgeMax] = useState<string>('');
  const [heightMin, setHeightMin] = useState<string>('');
  const [heightMax, setHeightMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<CastSearchParams['sort_by']>('created_at');
  const [sortOrder, setSortOrder] = useState<CastSearchParams['sort_order']>('desc');
  
  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 画面向きの検出
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  // バッジ一覧の取得
  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges');
      const result: ApiResponse<BadgeType[]> = await response.json();
      
      if (result.success && result.data) {
        setAvailableBadges(result.data);
      }
    } catch (err) {
      console.error('バッジ一覧の取得に失敗:', err);
    }
  };

  // キャストデータの取得
  const fetchCasts = async (params: CastSearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.badges && params.badges.length > 0) searchParams.set('badges', params.badges.join(','));
      if (params.age_min) searchParams.set('age_min', params.age_min.toString());
      if (params.age_max) searchParams.set('age_max', params.age_max.toString());
      if (params.height_min) searchParams.set('height_min', params.height_min.toString());
      if (params.height_max) searchParams.set('height_max', params.height_max.toString());
      if (params.sort_by) searchParams.set('sort_by', params.sort_by);
      if (params.sort_order) searchParams.set('sort_order', params.sort_order);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      
      const response = await fetch(`/api/casts?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('キャストデータの取得に失敗しました');
      }
      
      const data: ApiResponse<CastListResponse> = await response.json();
      
      if (data.success && data.data) {
        setCasts(data.data.casts || []);
        setTotalItems(data.data.total);
        setCurrentPage(data.data.page);
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
    fetchBadges();
    fetchCasts();
  }, []);

  // 検索・フィルタ実行
  const handleSearch = (page = 1) => {
    const params: CastSearchParams = {
      search: searchQuery || undefined,
      badges: selectedBadges.length > 0 ? selectedBadges : undefined,
      age_min: ageMin ? parseInt(ageMin) : undefined,
      age_max: ageMax ? parseInt(ageMax) : undefined,
      height_min: heightMin ? parseInt(heightMin) : undefined,
      height_max: heightMax ? parseInt(heightMax) : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      limit: itemsPerPage
    };
    fetchCasts(params);
  };

  // フィルタクリア
  const clearFilters = () => {
    setSelectedBadges([]);
    setAgeMin('');
    setAgeMax('');
    setHeightMin('');
    setHeightMax('');
    setSortBy('created_at');
    setSortOrder('desc');
    handleSearch(1); // フィルタクリア後は1ページ目から
  };

  // バッジ選択の切り替え
  const toggleBadge = (badgeName: string) => {
    setSelectedBadges(prev => 
      prev.includes(badgeName) 
        ? prev.filter(b => b !== badgeName)
        : [...prev, badgeName]
    );
  };

  // アクティブなフィルタ数の計算
  const activeFiltersCount = [
    selectedBadges.length > 0,
    ageMin || ageMax,
    heightMin || heightMax,
    sortBy !== 'created_at' || sortOrder !== 'desc'
  ].filter(Boolean).length;

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
            <Button onClick={() => handleSearch(1)} variant="primary" size="md">
              検索
            </Button>
          </div>

          {/* フィルタボタン */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 relative ${
                activeFiltersCount > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              フィルタ
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            
            <div className="text-sm text-gray-500">
              {loading ? '読み込み中...' : 
                totalItems > 0 ? `全${totalItems.toLocaleString()}人中${casts.length}人を表示` : 'キャストがいません'
              }
            </div>
          </div>

          {/* 詳細フィルタエリア */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">詳細フィルタ</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                    クリア ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* バッジフィルタ */}
              {availableBadges.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    バッジ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableBadges.map((badge) => (
                      <button
                        key={badge.id}
                        onClick={() => toggleBadge(badge.name)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                          selectedBadges.includes(badge.name)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {badge.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 年齢フィルタ */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  年齢
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="最小"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min="18"
                    max="99"
                  />
                  <span className="text-xs text-gray-500">〜</span>
                  <input
                    type="number"
                    placeholder="最大"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min="18"
                    max="99"
                  />
                  <span className="text-xs text-gray-500">歳</span>
                </div>
              </div>

              {/* 身長フィルタ */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  身長
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="最小"
                    value={heightMin}
                    onChange={(e) => setHeightMin(e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min="140"
                    max="200"
                  />
                  <span className="text-xs text-gray-500">〜</span>
                  <input
                    type="number"
                    placeholder="最大"
                    value={heightMax}
                    onChange={(e) => setHeightMax(e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min="140"
                    max="200"
                  />
                  <span className="text-xs text-gray-500">cm</span>
                </div>
              </div>

              {/* ソート */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  並び順
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as CastSearchParams['sort_by'])}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="created_at">登録日</option>
                    <option value="name">名前</option>
                    <option value="age">年齢</option>
                    <option value="height">身長</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as CastSearchParams['sort_order'])}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="desc">降順</option>
                    <option value="asc">昇順</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleSearch(1)} variant="primary" size="sm" className="flex-1">
                  フィルタ適用
                </Button>
              </div>
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

      {/* ページネーション */}
      {!loading && !error && totalPages > 1 && (
        <section className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* 件数表示 */}
            <div className="text-sm text-gray-600">
              {totalItems > 0 && (
                <span>
                  全{totalItems.toLocaleString()}件中 {((currentPage - 1) * itemsPerPage + 1).toLocaleString()}-{Math.min(currentPage * itemsPerPage, totalItems).toLocaleString()}件目を表示
                </span>
              )}
            </div>
            
            {/* ページネーションボタン */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleSearch(currentPage - 1)}
                disabled={currentPage <= 1}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
              
              {/* ページ番号 */}
              <div className="flex items-center gap-1">
                {/* 最初のページ */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handleSearch(1)}
                      className="px-2 py-1 text-sm rounded hover:bg-gray-100"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-1 text-sm text-gray-400">...</span>
                    )}
                  </>
                )}
                
                {/* 現在ページ周辺 */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleSearch(pageNum)}
                      className={`px-2 py-1 text-sm rounded transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }).filter(Boolean)}
                
                {/* 最後のページ */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-1 text-sm text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => handleSearch(totalPages)}
                      className="px-2 py-1 text-sm rounded hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <Button
                onClick={() => handleSearch(currentPage + 1)}
                disabled={currentPage >= totalPages}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
