'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Clock, Ruler, Heart, Camera } from 'lucide-react';
import { RadarChart } from '@/components/chart';
import { Badge } from '@/components/ui';
import { createClientLogger } from '@/lib/logger/client';
import { CastDetail, ApiResponse } from '@/types/api';



export default function CastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const castId = params.id as string;

  const [cast, setCast] = useState<CastDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setSelectedPhotoIndex] = useState(0);

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">キャスト情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="text-6xl">😔</div>
          <h2 className="text-xl font-bold text-gray-800">キャストが見つかりません</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!cast) {
    return null;
  }

  const mainPhoto = cast.photos.find(photo => photo.is_main) || cast.photos[0];
  const additionalPhotos = cast.photos.filter(photo => !photo.is_main);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            戻る
          </button>
          <h1 className="ml-4 text-lg font-bold text-gray-800 truncate">
            {cast.name}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* メイン情報セクション */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* 写真セクション */}
            <div className="md:w-1/2">
              {/* メイン写真 */}
              <div className="relative aspect-[3/4] bg-gray-100">
                {mainPhoto ? (
                  <Image
                    src={mainPhoto.photo_url}
                    alt={`${cast.name}のメイン写真`}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* 追加写真 */}
              {additionalPhotos.length > 0 && (
                <div className="p-4 bg-gray-50">
                  <div className="flex gap-2 overflow-x-auto">
                    {additionalPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="relative w-16 h-20 flex-shrink-0 bg-gray-100 rounded cursor-pointer overflow-hidden"
                        onClick={() => setSelectedPhotoIndex(index + 1)}
                      >
                        <Image
                          src={photo.photo_url}
                          alt={`${cast.name}の写真${index + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 基本情報セクション */}
            <div className="md:w-1/2 p-6">
              <div className="space-y-4">
                {/* 名前とバッジ */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {cast.name}
                  </h2>
                  {cast.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cast.badges.map((badge) => (
                        <Badge
                          key={badge.id}
                          badge={badge}
                          size="sm"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* 基本データ */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">年齢</span>
                    <span className="font-medium text-gray-800">{cast.age}歳</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Ruler className="h-4 w-4" />
                    <span className="text-sm">身長</span>
                    <span className="font-medium text-gray-800">{cast.height}cm</span>
                  </div>
                  {cast.hobby && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">趣味</span>
                      <span className="font-medium text-gray-800">{cast.hobby}</span>
                    </div>
                  )}
                </div>

                {/* 説明 */}
                {cast.description && (
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">プロフィール</h3>
                    <p className="text-gray-800 leading-relaxed">
                      {cast.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 能力値セクション */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">能力値</h3>
          <div className="flex justify-center">
            <RadarChart
              stats={cast.stats}
              size="lg"
              colors={{
                fill: 'rgba(147, 51, 234, 0.3)',
                stroke: '#9333ea'
              }}
            />
          </div>
        </div>
      </div>

      {/* スペーサー（ナビゲーション用） */}
      <div className="h-20"></div>
    </div>
  );
}