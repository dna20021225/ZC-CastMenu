'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [categories, setCategories] = useState<DrinkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchDrinks();
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-900 to-black">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b border-gray-800 backdrop-blur-md bg-gray-900/80">
        <div className="tablet-layout py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              戻る
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white">ドリンクメニュー</h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="tablet-layout py-6">
        {/* タイトルセクション */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white">DRINK MENU</h2>
          <p className="text-gray-400 text-sm">※全て税込表記となります</p>
        </div>

        {/* ローディング */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-gray-400">メニューを読み込み中...</p>
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
            <Wine className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">メニューは準備中です</p>
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
                  className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900/50 backdrop-blur"
                >
                  {/* カテゴリヘッダー */}
                  <div
                    className="px-6 py-4 border-b border-gray-800"
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
                        <h3 className="text-xl font-bold text-white">{category.name}</h3>
                        {category.name_en && (
                          <p className="text-sm text-gray-400">{category.name_en}</p>
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
                          className="flex justify-between items-center py-3 px-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex-1">
                            <span className="text-white font-medium">{drink.name}</span>
                            {drink.note && (
                              <span className="text-gray-500 text-sm ml-2">({drink.note})</span>
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

        {/* 注意事項 */}
        <div className="mt-8 rounded-xl p-6 border border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-3 mb-4">
            <Info className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-white">ご案内</h3>
          </div>

          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex gap-2">
              <span className="text-yellow-500 font-semibold">•</span>
              <span>価格は全て税込み表示です</span>
            </div>
            <div className="flex gap-2">
              <span className="text-yellow-500 font-semibold">•</span>
              <span>キープボトルは開栓後3ヶ月間お預かりいたします</span>
            </div>
            <div className="flex gap-2">
              <span className="text-yellow-500 font-semibold">•</span>
              <span>シャンパンタワー等の演出もご相談ください</span>
            </div>
            <div className="flex gap-2">
              <span className="text-yellow-500 font-semibold">•</span>
              <span>その他ご要望がございましたらスタッフまでお申し付けください</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
