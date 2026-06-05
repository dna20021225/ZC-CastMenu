'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Wine,
  Sparkles,
  GlassWater,
  Beer,
  Martini,
  Info,
  Loader2
} from 'lucide-react';
import { DRINKS_GUIDE_KEY, DRINKS_GUIDE_DEFAULT, parseGuide } from '@/lib/guides';

interface DrinkItem {
  id: string;
  name: string;
  price: number;
  note: string | null;
}

interface DrinkCategory {
  id: string;
  name: string;
  name_en: string | null;
  icon: string;
  color: string;
  items: DrinkItem[];
}

// アイコン名からコンポーネントを取得
const getIcon = (iconName: string) => {
  const icons: Record<string, typeof Wine> = {
    Wine,
    Sparkles,
    GlassWater,
    Beer,
    Martini,
  };
  return icons[iconName] || Wine;
};

export default function DrinksPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<DrinkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideLines, setGuideLines] = useState<string[]>([]);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const res = await fetch('/api/drinks');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          setError('メニューの取得に失敗しました');
        }
      } catch {
        setError('メニューの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    const fetchGuide = async () => {
      try {
        const res = await fetch(`/api/settings?key=${encodeURIComponent(DRINKS_GUIDE_KEY)}`);
        const data = await res.json();
        const text = data?.data?.value ?? DRINKS_GUIDE_DEFAULT;
        setGuideLines(parseGuide(text));
      } catch {
        setGuideLines(parseGuide(DRINKS_GUIDE_DEFAULT));
      }
    };

    fetchDrinks();
    fetchGuide();
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-50 to-white">
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
              <h1 className="text-lg font-bold truncate">ドリンクメニュー</h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="tablet-layout py-6">
        {/* タイトルセクション */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">DRINK MENU</h2>
          <p className="text-secondary text-sm">※全て税込表記となります</p>
        </div>

        {/* ローディング */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-secondary">メニューを読み込み中...</p>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* メニューが空の場合 */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-16">
            <Wine className="w-16 h-16 mx-auto text-secondary mb-4" />
            <p className="text-secondary">メニューは準備中です</p>
          </div>
        )}

        {/* ドリンクカテゴリ */}
        {!loading && !error && categories.length > 0 && (
          <div className="space-y-6">
            {categories.map((category) => {
              const IconComponent = getIcon(category.icon);
              return (
                <div
                  key={category.id}
                  className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
                >
                  {/* カテゴリヘッダー */}
                  <div
                    className="px-6 py-4 border-b border-gray-200"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}20 0%, transparent 100%)`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className="h-6 w-6"
                        style={{ color: category.color }}
                      />
                      <div>
                        <h3 className="text-xl font-bold">{category.name}</h3>
                        {category.name_en && (
                          <p className="text-sm text-secondary">{category.name_en}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ドリンクリスト */}
                  <div className="p-4">
                    <div className="space-y-2">
                      {category.items.map((drink) => (
                        <div
                          key={drink.id}
                          className="flex justify-between items-center py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{drink.name}</span>
                            {drink.note && (
                              <span className="text-secondary text-sm ml-2">({drink.note})</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold" style={{ color: category.color }}>
                              ¥{drink.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 注意事項（管理画面から編集可能） */}
        {guideLines.length > 0 && (
          <div className="mt-8 rounded-xl p-6 border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Info className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-bold">ご案内</h3>
            </div>
            <div className="space-y-3 text-sm text-secondary">
              {guideLines.map((line, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-yellow-500 font-semibold">•</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
