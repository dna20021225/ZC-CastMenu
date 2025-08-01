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
  Home,
  Smartphone 
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
      <header className="sticky top-0 z-40 border-b border-border backdrop-blur-md bg-surface/80">
        <div className="tablet-layout py-3">
          <div className="flex items-center gap-4">
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

      {/* メインコンテンツ */}
      <main className="tablet-layout py-6 space-y-6">
        {/* プロフィールカード */}
        <div className="cast-card p-0 overflow-hidden">
          <div className="lg:flex">
            {/* 写真セクション */}
            <div className="lg:w-1/2 relative">
              {/* メイン写真表示 */}
              <div className="relative aspect-[3/4] bg-surface-variant">
                {displayPhoto ? (
                  <Image
                    src={displayPhoto.photo_url}
                    alt={`${cast.name}の写真`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="h-16 w-16 text-muted" />
                  </div>
                )}
                
                {/* バッジ表示 */}
                {cast.badges && cast.badges.length > 0 && (
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
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
              </div>

              {/* 写真サムネイル */}
              {cast.photos.length > 1 && (
                <div className="p-4 bg-surface-variant">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {cast.photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        onClick={() => setSelectedPhotoIndex(index)}
                        className={`relative w-16 h-20 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                          selectedPhotoIndex === index 
                            ? 'border-primary shadow-lg' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Image
                          src={photo.photo_url}
                          alt={`${cast.name}の写真${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 情報セクション */}
            <div className="lg:w-1/2 p-6 space-y-6">
              {/* 名前 */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold mb-2">
                  {cast.name}
                </h2>
                <p className="text-secondary text-sm">CAST PROFILE</p>
              </div>

              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-surface-variant rounded-lg">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-secondary">年齢</p>
                    <p className="font-semibold">{cast.age}歳</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-surface-variant rounded-lg">
                  <Ruler className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-secondary">身長</p>
                    <p className="font-semibold">{cast.height}cm</p>
                  </div>
                </div>
              </div>

              {/* 趣味 */}
              {cast.hobby && (
                <div className="p-4 bg-surface-variant rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-secondary">趣味</span>
                  </div>
                  <p className="text-sm leading-relaxed">{cast.hobby}</p>
                </div>
              )}

              {/* 自己紹介 */}
              {cast.description && (
                <div className="p-4 bg-surface-variant rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-secondary">自己紹介</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {cast.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 能力値レーダーチャート */}
        <div className="cast-card p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">能力値</h3>
            <p className="text-secondary text-sm">ABILITY CHART</p>
          </div>
          
          <div className="flex justify-center">
            <RadarChart
              stats={cast.stats}
              size="lg"
              colors={{
                fill: 'rgba(59, 130, 246, 0.2)',
                stroke: 'var(--primary-600)'
              }}
            />
          </div>

          {/* 能力値詳細 */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-surface-variant rounded-lg">
              <p className="text-xs text-secondary mb-1">ルックス</p>
              <p className="text-lg font-bold text-primary">{cast.stats.looks}</p>
            </div>
            <div className="text-center p-3 bg-surface-variant rounded-lg">
              <p className="text-xs text-secondary mb-1">トーク</p>
              <p className="text-lg font-bold text-primary">{cast.stats.talk}</p>
            </div>
            <div className="text-center p-3 bg-surface-variant rounded-lg">
              <p className="text-xs text-secondary mb-1">酒の強さ</p>
              <p className="text-lg font-bold text-primary">{cast.stats.alcohol_tolerance}</p>
            </div>
            <div className="text-center p-3 bg-surface-variant rounded-lg">
              <p className="text-xs text-secondary mb-1">頭脳</p>
              <p className="text-lg font-bold text-primary">{cast.stats.intelligence}</p>
            </div>
            <div className="text-center p-3 bg-surface-variant rounded-lg">
              <p className="text-xs text-secondary mb-1">テンション</p>
              <p className="text-lg font-bold text-primary">{cast.stats.energy}</p>
            </div>
            {cast.stats.custom_stat && cast.stats.custom_stat_name && (
              <div className="text-center p-3 bg-surface-variant rounded-lg">
                <p className="text-xs text-secondary mb-1">{cast.stats.custom_stat_name}</p>
                <p className="text-lg font-bold text-primary">{cast.stats.custom_stat}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ナビゲーション */}
      <nav className="nav-primary">
        <div className="tablet-layout">
          <div className="flex items-center justify-around">
            <Link href="/" className="nav-item">
              <User className="h-5 w-5" />
              <span>キャスト</span>
            </Link>
            <Link href="/menu/pricing" className="nav-item">
              <Smartphone className="h-5 w-5" />
              <span>料金</span>
            </Link>
            <Link href="/menu/drinks" className="nav-item">
              <Smartphone className="h-5 w-5" />
              <span>ドリンク</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}