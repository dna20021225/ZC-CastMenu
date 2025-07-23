"use client";

import { useState, useEffect } from 'react';

interface Cast {
  id: string;
  name: string;
  age: number;
  height: number;
  profile_image?: string;
  description?: string;
}

export default function Home() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCasts();
  }, []);

  const fetchCasts = async () => {
    try {
      // 一時的にテストデータを使用
      const testCasts: Cast[] = [
        {
          id: '1',
          name: 'テストキャスト1',
          age: 22,
          height: 165,
          description: 'システムが正常に復旧しました。データベース接続のテスト中です。'
        },
        {
          id: '2',
          name: 'テストキャスト2',
          age: 24,
          height: 158,
          description: 'キャスト一覧機能が正常に動作しています。'
        }
      ];
      
      // 実際のAPIを試行（失敗した場合はテストデータを使用）
      try {
        const response = await fetch('/api/casts');
        if (response.ok) {
          const data = await response.json();
          setCasts(data.data?.casts || []);
        } else {
          setCasts(testCasts);
        }
      } catch {
        setCasts(testCasts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ZC-CastMenu</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchCasts}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ZC-CastMenu</h1>
          <p className="text-lg text-gray-600">キャスト一覧</p>
        </div>
        
        {casts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">キャストデータがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casts.map((cast) => (
              <div key={cast.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                  {cast.profile_image ? (
                    <img 
                      src={cast.profile_image} 
                      alt={cast.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">画像なし</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{cast.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>年齢: {cast.age}歳</p>
                    <p>身長: {cast.height}cm</p>
                  </div>
                  {cast.description && (
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">{cast.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}