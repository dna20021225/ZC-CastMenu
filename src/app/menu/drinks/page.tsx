"use client";

import { Coffee, Wine, Sparkles, Heart } from 'lucide-react';

interface DrinkItem {
  id: string;
  name: string;
  price: string;
  description: string;
  category: 'alcohol' | 'soft' | 'cocktail' | 'special';
  popular?: boolean;
}

const drinkCategories = {
  alcohol: { name: 'アルコール', icon: Wine },
  soft: { name: 'ソフトドリンク', icon: Coffee },
  cocktail: { name: 'カクテル', icon: Sparkles },
  special: { name: 'スペシャル', icon: Heart }
};

const drinkItems: DrinkItem[] = [
  // アルコール
  {
    id: 'beer',
    name: 'ビール',
    price: '¥600',
    description: 'キリン一番搾り、アサヒスーパードライ等',
    category: 'alcohol',
    popular: true
  },
  {
    id: 'highball',
    name: 'ハイボール',
    price: '¥700',
    description: '角ハイボール、こだわりの炭酸で',
    category: 'alcohol',
    popular: true
  },
  {
    id: 'sake',
    name: '日本酒',
    price: '¥800',
    description: '厳選された純米酒',
    category: 'alcohol'
  },
  {
    id: 'shochu',
    name: '焼酎',
    price: '¥700',
    description: 'ロック、水割り、お湯割り',
    category: 'alcohol'
  },

  // カクテル
  {
    id: 'gin-tonic',
    name: 'ジントニック',
    price: '¥800',
    description: 'さっぱりとした定番カクテル',
    category: 'cocktail',
    popular: true
  },
  {
    id: 'mojito',
    name: 'モヒート',
    price: '¥900',
    description: 'ミントの香りが爽やかな人気カクテル',
    category: 'cocktail'
  },
  {
    id: 'cassis-orange',
    name: 'カシスオレンジ',
    price: '¥800',
    description: '女性に人気のフルーティーカクテル',
    category: 'cocktail',
    popular: true
  },
  {
    id: 'cosmopolitan',
    name: 'コスモポリタン',
    price: '¥900',
    description: 'エレガントなピンク色のカクテル',
    category: 'cocktail'
  },

  // ソフトドリンク
  {
    id: 'cola',
    name: 'コーラ',
    price: '¥400',
    description: 'コカコーラ、ペプシコーラ',
    category: 'soft'
  },
  {
    id: 'orange-juice',
    name: 'オレンジジュース',
    price: '¥450',
    description: '100%フレッシュオレンジ',
    category: 'soft'
  },
  {
    id: 'coffee',
    name: 'コーヒー',
    price: '¥500',
    description: 'ホット・アイス選べます',
    category: 'soft'
  },
  {
    id: 'tea',
    name: '紅茶',
    price: '¥500',
    description: 'アールグレイ、ダージリン等',
    category: 'soft'
  },

  // スペシャル
  {
    id: 'champagne',
    name: 'シャンパン',
    price: '¥3,000',
    description: 'お祝いや特別な日に',
    category: 'special'
  },
  {
    id: 'fruit-cocktail',
    name: 'フルーツカクテル',
    price: '¥1,200',
    description: '季節のフルーツを使った特製カクテル',
    category: 'special',
    popular: true
  }
];

export default function DrinksPage() {
  const groupedDrinks = Object.entries(drinkCategories).map(([key, category]) => ({
    ...category,
    key,
    items: drinkItems.filter(item => item.category === key)
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Coffee className="w-8 h-8 text-pink-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">ドリンクメニュー</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            豊富なドリンクメニューからお好みの一杯をお選びください
          </p>
        </div>

        {/* ドリンクメニュー */}
        <div className="space-y-12">
          {groupedDrinks.map((category) => (
            <div key={category.key} className="bg-white rounded-lg shadow-md overflow-hidden">
              
              {/* カテゴリヘッダー */}
              <div className="bg-pink-50 px-6 py-4 border-b">
                <div className="flex items-center">
                  <category.icon className="w-6 h-6 text-pink-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {category.name}
                  </h2>
                </div>
              </div>

              {/* ドリンクリスト */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((drink) => (
                    <div
                      key={drink.id}
                      className={`relative p-4 rounded-lg border transition-shadow hover:shadow-md ${
                        drink.popular 
                          ? 'border-pink-200 bg-pink-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {drink.popular && (
                        <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                          人気
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {drink.name}
                        </h3>
                        <span className="text-lg font-bold text-pink-600 ml-4">
                          {drink.price}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {drink.description}
                      </p>
                      
                      <button className="mt-3 w-full py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium">
                        注文する
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ドリンク飲み放題プラン */}
        <div className="mt-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg text-white overflow-hidden">
          <div className="p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                ドリンク飲み放題プラン
              </h2>
              <p className="text-lg mb-6 opacity-90">
                対象ドリンクが90分飲み放題でお得にお楽しみいただけます
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">スタンダード</h3>
                  <div className="text-3xl font-bold mb-2">¥2,500</div>
                  <p className="text-sm opacity-90">
                    ビール、ハイボール、基本カクテル、ソフトドリンク
                  </p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">プレミアム</h3>
                  <div className="text-3xl font-bold mb-2">¥3,500</div>
                  <p className="text-sm opacity-90">
                    全メニュー飲み放題（シャンパン除く）
                  </p>
                </div>
              </div>
              
              <button className="mt-6 bg-white text-pink-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                飲み放題を注文
              </button>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            ドリンクについて
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 価格は全て税込み表示です</li>
            <li>• アルコールの提供は20歳以上の方に限ります</li>
            <li>• ドリンクの種類によっては在庫切れの場合があります</li>
            <li>• お酒の飲み過ぎにはご注意ください</li>
            <li>• ノンアルコールカクテルもご用意しております</li>
          </ul>
        </div>
      </div>
    </div>
  );
}