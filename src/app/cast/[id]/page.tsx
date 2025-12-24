'use client';

import { useEffect, useState } from 'react';
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
  Home 
} from 'lucide-react';
import { RadarChart } from '@/components/chart';
import { CastDetail, ApiResponse } from '@/types/api';

export default function CastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const castId = params.id as string;

  const [cast, setCast] = useState<CastDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchCastDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        console.info('キャスト詳細取得開始', { castId });

        const response = await fetch(`/api/casts/${castId}`);
        const result: ApiResponse<CastDetail> = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'キャスト詳細の取得に失敗しました');
        }

        if (!result.success || !result.data) {
          throw new Error('キャストデータが取得できませんでした');
        }

        setCast(result.data);
        console.info('キャスト詳細取得完了', { 
          castId, 
          name: result.data.name,
          photosCount: result.data.photos.length,
          badgesCount: result.data.badges.length
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'キャスト詳細の取得に失敗しました';
        setError(errorMessage);
        console.error('キャスト詳細取得エラー', err instanceof Error ? err : new Error(String(err)), { castId });
      } finally {
        setLoading(false);
      }
    };

    if (castId) {
      fetchCastDetail();
    }
  }, [castId]);

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

  const mainPhoto = cast.photos.find(photo => photo.is_main) || cast.photos[0];
  const displayPhoto = cast.photos[selectedPhotoIndex] || mainPhoto;

  return (
    <div className="min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b-2 border-border backdrop-blur-md bg-surface/80 py-5">
        <div className="tablet-layout">
          <div className="flex items-center gap-4 h-12">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              戻る
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">
                {cast.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* スペーサー */}
      <div className="h-8"></div>

      {/* メインコンテンツ */}
      <main className="tablet-layout pb-6">
        {/* プロフィールカード */}
        <div className="cast-card p-4 lg:p-6">
          <div className="lg:flex gap-6">
            {/* 写真セクション - 横スクロール対応 */}
            <div className="lg:w-1/2 relative border-2 border-primary rounded-lg overflow-hidden flex-shrink-0">
              {/* 写真カルーセル */}
              <div
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={(e) => {
                  const container = e.currentTarget;
                  const scrollLeft = container.scrollLeft;
                  const itemWidth = container.offsetWidth;
                  const newIndex = Math.round(scrollLeft / itemWidth);
                  if (newIndex !== selectedPhotoIndex && newIndex >= 0 && newIndex < cast.photos.length) {
                    setSelectedPhotoIndex(newIndex);
                  }
                }}
              >
                {cast.photos.length > 0 ? (
                  cast.photos.map((photo, index) => (
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

              {/* 写真カウンター */}
              {cast.photos.length > 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2 py-1 rounded-full text-xs font-bold text-white bg-black/50 backdrop-blur-sm">
                    ({selectedPhotoIndex + 1}/{cast.photos.length})
                  </span>
                </div>
              )}

              {/* インジケーター（ドット） */}
              {cast.photos.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {cast.photos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedPhotoIndex === index
                          ? 'bg-primary w-4'
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 情報セクション */}
            <div className="lg:w-1/2 pt-4 lg:pt-0 space-y-4">
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
                    <p className="font-semibold text-sm">{cast.age}歳</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-surface-variant rounded-lg">
                  <Ruler className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-secondary">身長</p>
                    <p className="font-semibold text-sm">{cast.height}cm</p>
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
                {cast.description && (
                  <div className="p-2 bg-surface-variant rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-secondary">自己紹介</span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {cast.description}
                    </p>
                  </div>
                )}
              </div>

              {/* 能力値レーダーチャート */}
              <div className="pt-2">
                <div className="text-center mb-2">
                  <h3 className="text-sm font-bold">能力値</h3>
                </div>
                <RadarChart
                  stats={cast.stats}
                  size="lg"
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