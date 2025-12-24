'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Wine,
  Sparkles,
  GlassWater,
  Beer,
  Martini,
  Star,
  Info
} from 'lucide-react';

interface DrinkItem {
  name: string;
  price: number;
  note?: string;
}

interface DrinkCategory {
  id: string;
  name: string;
  nameEn?: string;
  icon: typeof Wine;
  color: string;
  items: DrinkItem[];
}

const drinkCategories: DrinkCategory[] = [
  {
    id: 'soft',
    name: 'ソフトドリンク',
    nameEn: 'SOFT DRINK（1本）',
    icon: GlassWater,
    color: '#059669',
    items: [
      { name: 'ミネラルウォーター', price: 1000 },
      { name: 'ソーダ', price: 1000 },
      { name: 'コーラ', price: 1500 },
      { name: 'ジンジャーエール', price: 1500 },
    ]
  },
  {
    id: 'beer',
    name: 'ビール・チューハイ',
    nameEn: 'BEER・チューハイ（1本）',
    icon: Beer,
    color: '#d97706',
    items: [
      { name: 'スーパードライ', price: 2000 },
      { name: 'スタイルフリー', price: 1500 },
      { name: '氷結 無糖レモン', price: 1500 },
      { name: 'スラット', price: 1500, note: 'アロエ・グレフル・シャルドネ' },
    ]
  },
  {
    id: 'shot',
    name: 'ショットドリンク',
    icon: Martini,
    color: '#dc2626',
    items: [
      { name: 'テキーラ・ローズ', price: 4000, note: '各種' },
      { name: 'タランチュラ', price: 4000 },
      { name: 'コカボムタワー', price: 60000 },
      { name: 'テキーラ観覧車', price: 60000 },
    ]
  },
  {
    id: 'nonalcohol',
    name: 'ノンアルコール',
    nameEn: 'ノンアル各種（1本）',
    icon: GlassWater,
    color: '#0891b2',
    items: [
      { name: 'アサヒ DRY ZERO', price: 1500 },
      { name: 'ノンアル気分', price: 1500, note: 'レモン・カシオレ' },
      { name: 'オリジナルZERO（シャンパン）', price: 45000 },
    ]
  },
  {
    id: 'champagne',
    name: 'シャンパン',
    nameEn: 'Champagne',
    icon: Sparkles,
    color: '#eab308',
    items: [
      { name: 'オリジナル・ホワイト', price: 55000 },
      { name: 'オリジナル・ロゼ', price: 80000 },
      { name: 'オリジナル・LED', price: 150000 },
      { name: 'オリジナル・ゴールド', price: 200000 },
      { name: 'オリジナル・ブラック', price: 300000 },
      { name: 'ドン・ペリニヨン', price: 500000 },
      { name: 'ドン・ペリニヨン・ロゼ', price: 700000 },
    ]
  },
  {
    id: 'brandy',
    name: 'ブランデー',
    nameEn: 'Brandy',
    icon: Wine,
    color: '#7c2d12',
    items: [
      { name: 'コルトンブルー', price: 105000 },
      { name: 'マーテル XO', price: 200000 },
      { name: 'ラーセン・ヴァイキングシップ', price: 270000 },
    ]
  },
  {
    id: 'keepbottle',
    name: 'キープボトル',
    nameEn: 'Keep Bottle',
    icon: Wine,
    color: '#6366f1',
    items: [
      { name: 'JAPAN', price: 15000 },
      { name: 'サントリーウィスキー', price: 20000 },
      { name: '神の河', price: 20000 },
      { name: '茉莉花', price: 20000 },
      { name: '黒霧島', price: 20000 },
      { name: '吉四六', price: 30000 },
    ]
  },
];

export default function DrinksPage() {
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

        {/* ドリンクカテゴリ */}
        <div className="space-y-6">
          {drinkCategories.map((category) => (
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
                  <category.icon
                    className="h-6 w-6"
                    style={{ color: category.color }}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    {category.nameEn && (
                      <p className="text-sm text-gray-400">{category.nameEn}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ドリンクリスト */}
              <div className="p-4">
                <div className="space-y-2">
                  {category.items.map((drink, index) => (
                    <div
                      key={index}
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
          ))}
        </div>

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
