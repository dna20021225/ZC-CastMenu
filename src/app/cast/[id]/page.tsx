'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  User,
  Calendar,
  Ruler,
  Heart,
  Camera,
  Home,
} from 'lucide-react';
import { RadarChart } from '@/components/chart';
import { CastDetail, ApiResponse, CastListResponse } from '@/types/api';
import { useHorizontalSwipe } from '@/hooks/useHorizontalSwipe';

export default function CastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const initialCastId = params.id as string;

  // 表示中のキャストID（スワイプで切り替わる）
  const [currentCastId, setCurrentCastId] = useState<string>(initialCastId);
  const [cast, setCast] = useState<CastDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [castIds, setCastIds] = useState<string[]>([]);

  // 取得済みキャストのキャッシュ
  const cacheRef = useRef<Map<string, CastDetail>>(new Map());
  // 進行中の fetch を共有するための Promise キャッシュ（重複fetch抑止）
  const inflightRef = useRef<Map<string, Promise<CastDetail | null>>>(new Map());

  // 単一キャストfetch（キャッシュ＆重複抑止つき）
  const fetchCastById = useCallback(async (id: string): Promise<CastDetail | null> => {
    if (cacheRef.current.has(id)) return cacheRef.current.get(id)!;
    const existing = inflightRef.current.get(id);
    if (existing) return existing;

    const promise = (async () => {
      try {
        const response = await fetch(`/api/casts/${id}`);
        const result: ApiResponse<CastDetail> = await response.json();
        if (response.ok && result.success && result.data) {
          cacheRef.current.set(id, result.data);
          return result.data;
        }
        throw new Error(result.error || 'キャスト詳細の取得に失敗しました');
      } catch (err) {
        console.error('キャスト詳細取得エラー', err instanceof Error ? err : new Error(String(err)), { id });
        return null;
      } finally {
        inflightRef.current.delete(id);
      }
    })();
    inflightRef.current.set(id, promise);
    return promise;
  }, []);

  // 初期表示
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchCastById(initialCastId);
      if (cancelled) return;
      if (data) {
        setCast(data);
        setError(null);
      } else {
        setError('キャスト詳細の取得に失敗しました');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialCastId, fetchCastById]);

  // 並び順用のID一覧を取得
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/casts?limit=100');
        const result: ApiResponse<CastListResponse> = await response.json();
        if (result.success && result.data?.casts) {
          setCastIds(result.data.casts.map((c) => c.id));
        }
      } catch (err) {
        console.error('キャスト一覧取得エラー（スワイプ用）', err instanceof Error ? err : new Error(String(err)));
      }
    })();
  }, []);

  // currentCastId が変わったら、隣接2件をバックグラウンドでプリフェッチ
  useEffect(() => {
    if (castIds.length < 2 || !currentCastId) return;
    const currentIndex = castIds.indexOf(currentCastId);
    if (currentIndex === -1) return;
    const total = castIds.length;
    const neighbors = [
      castIds[(currentIndex + 1) % total],
      castIds[(currentIndex - 1 + total) % total],
    ];
    neighbors.forEach((id) => {
      if (id && id !== currentCastId) {
        void fetchCastById(id);
      }
    });
  }, [currentCastId, castIds, fetchCastById]);

  // スワイプで前後キャストへ（シームレス切り替え）
  const goToAdjacent = useCallback(
    async (direction: 'prev' | 'next') => {
      if (castIds.length < 2) return;
      const currentIndex = castIds.indexOf(currentCastId);
      if (currentIndex === -1) return;
      const total = castIds.length;
      const nextIndex =
        direction === 'next' ? (currentIndex + 1) % total : (currentIndex - 1 + total) % total;
      const nextId = castIds[nextIndex];

      // キャッシュにあれば即座に切り替え
      const cached = cacheRef.current.get(nextId);
      if (cached) {
        setCast(cached);
        setCurrentCastId(nextId);
        setSelectedPhotoIndex(0);
        // URLだけ静かに更新（履歴に積まない）
        window.history.replaceState(null, '', `/cast/${nextId}`);
        return;
      }

      // キャッシュ未取得：先にURLとIDを進めつつ、現在のキャスト表示を残してフェッチ
      const data = await fetchCastById(nextId);
      if (data) {
        setCast(data);
        setCurrentCastId(nextId);
        setSelectedPhotoIndex(0);
        window.history.replaceState(null, '', `/cast/${nextId}`);
      }
    },
    [castIds, currentCastId, fetchCastById]
  );

  // 写真エリア内のスワイプは写真カルーセルに任せ、外側だけで前後キャストへ
  useHorizontalSwipe({
    onSwipeLeft: () => void goToAdjacent('next'),
    onSwipeRight: () => void goToAdjacent('prev'),
    ignoreInsideSelector: '[data-photo-carousel="true"]',
    disabled: castIds.length < 2,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="loading-spinner mx-auto"></div>
          <p className="text-secondary">キャスト情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 tablet-layout">
          <div className="space-y-4">
            <div className="text-6xl">😔</div>
            <h2 className="text-xl font-bold">キャストが見つかりません</h2>
            <div className="error-message">
              <p>{error}</p>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="btn-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              戻る
            </button>
            <Link href="/" className="btn-primary">
              <Home className="h-4 w-4" />
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cast) {
    return null;
  }

  // 表示用の写真リスト
  // 優先順位: 1) cast_photos の写真群 2) avatar_url を1枚目に 3) プレースホルダー
  const displayPhotos: { id: string; photo_url: string }[] =
    cast.photos.length > 0
      ? cast.photos
      : cast.avatar_url
        ? [{ id: 'avatar-fallback', photo_url: cast.avatar_url }]
        : [{ id: 'no-image-placeholder', photo_url: '/images/placeholder.svg' }];

  return (
    // layout の <main className="pb-16"> を打ち消し、画面全体を活用
    <div className="min-h-screen -mb-16">
      {/* 戻るボタン（右上に固定配置） */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="戻る"
        className="fixed top-3 right-3 z-50 flex items-center gap-1 px-3 py-2 rounded-full bg-surface/90 backdrop-blur-md border border-border shadow-md text-secondary hover:text-primary transition-colors"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium">戻る</span>
      </button>

      {/* メインコンテンツ */}
      <main className="tablet-layout pt-2 pb-2">
        {/* プロフィールカード */}
        <div className="cast-card p-3">
          <div className="lg:flex gap-4 lg:items-start">
            {/* 写真セクション - 横スクロール対応 */}
            <div
              data-photo-carousel="true"
              className="lg:w-2/5 relative border-2 border-primary rounded-lg overflow-hidden flex-shrink-0"
            >
              {/* 写真カルーセル */}
              <div
                key={cast.id}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={(e) => {
                  const container = e.currentTarget;
                  const scrollLeft = container.scrollLeft;
                  const itemWidth = container.offsetWidth;
                  const newIndex = Math.round(scrollLeft / itemWidth);
                  if (newIndex !== selectedPhotoIndex && newIndex >= 0 && newIndex < displayPhotos.length) {
                    setSelectedPhotoIndex(newIndex);
                  }
                }}
              >
                {displayPhotos.length > 0 ? (
                  displayPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="relative aspect-[3/4] flex-shrink-0 w-full snap-center bg-surface-variant"
                    >
                      <Image
                        src={photo.photo_url}
                        alt={`${cast.name}の写真${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  ))
                ) : (
                  <div className="relative aspect-[3/4] flex-shrink-0 w-full flex items-center justify-center bg-surface-variant">
                    <Camera className="h-16 w-16 text-muted" />
                  </div>
                )}
              </div>

              {/* バッジ表示 */}
              {cast.badges && cast.badges.length > 0 && (
                <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                  {cast.badges
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((badge) => (
                      <div
                        key={badge.id}
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
                        style={{ backgroundColor: badge.color }}
                      >
                        {badge.name}
                      </div>
                    ))}
                </div>
              )}

              {/* 写真カウンター（複数枚あるときのみ表示） */}
              {displayPhotos.length > 1 && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2 py-1 rounded-full text-xs font-bold text-white bg-black/50 backdrop-blur-sm">
                    ({selectedPhotoIndex + 1}/{displayPhotos.length})
                  </span>
                </div>
              )}

              {/* インジケーター（ドット） */}
              {displayPhotos.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {displayPhotos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ring-1 ring-black/20 ${
                        selectedPhotoIndex === index
                          ? 'bg-primary w-4'
                          : 'bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 情報セクション */}
            <div className="lg:w-3/5 pt-2 lg:pt-0 space-y-2">
              {/* 名前 */}
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold mb-1">
                  {cast.name}
                </h2>
                <p className="text-secondary text-xs">CAST PROFILE</p>
              </div>

              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-surface-variant rounded-lg">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-secondary">年齢</p>
                    <p className="font-semibold text-sm">
                      {cast.age != null ? `${cast.age}歳` : '非公開'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-surface-variant rounded-lg">
                  <Ruler className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-secondary">身長</p>
                    <p className="font-semibold text-sm">
                      {cast.height != null ? `${cast.height}cm` : '非公開'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 趣味・自己紹介 */}
              <div className="space-y-2">
                {cast.hobby && (
                  <div className="p-2 bg-surface-variant rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-secondary">趣味:</span>
                      <span className="text-xs">{cast.hobby}</span>
                    </div>
                  </div>
                )}
                {/* 自己紹介は常に枠を表示（中身が空でもレイアウトを安定させる） */}
                <div className="p-2 bg-surface-variant rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-xs text-secondary">自己紹介</span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap line-clamp-3 min-h-[1rem]">
                    {cast.description || ''}
                  </p>
                </div>
              </div>

              {/* 能力値レーダーチャート（レイアウトを崩さない範囲で最大化） */}
              <div className="pt-1">
                <div className="text-center mb-1">
                  <h3 className="text-sm font-bold">能力値</h3>
                </div>
                <RadarChart
                  stats={cast.stats}
                  size="md"
                  colors={{
                    fill: 'rgba(59, 130, 246, 0.2)',
                    stroke: 'var(--primary-600)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
