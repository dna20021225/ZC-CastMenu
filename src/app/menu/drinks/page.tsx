'use client';

import Link from 'next/link';
import { 
  ArrowLeft, 
  Coffee, 
  Wine, 
  Sparkles, 
  Heart,
  Star,
  User,
  Smartphone,
  Info
} from 'lucide-react';

interface DrinkItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'alcohol' | 'soft' | 'cocktail' | 'special';
  popular?: boolean;
}

const drinkCategories = {
  alcohol: { name: 'アルコール', icon: Wine, color: '#dc2626' },
  cocktail: { name: 'カクテル', icon: Sparkles, color: '#7c3aed' },
  soft: { name: 'ソフトドリンク', icon: Coffee, color: '#059669' },
  special: { name: 'スペシャル', icon: Heart, color: '#ea580c' }
};

const drinkItems: DrinkItem[] = [
  // アルコール
  {
    id: 'beer',
    name: 'ビール',
    price: 600,
    description: 'キリン一番搾り、アサヒスーパードライ等',
    category: 'alcohol',
    popular: true
  },
  {
    id: 'highball',
    name: 'ハイボール',
    price: 700,
    description: '角ハイボール、こだわりの炭酸で',
    category: 'alcohol',
    popular: true
  },
  {
    id: 'sake',
    name: '日本酒',
    price: 800,
    description: '厳選された純米酒各種',
    category: 'alcohol'
  },
  {
    id: 'shochu',
    name: '焼酎',
    price: 700,
    description: 'ロック、水割り、お湯割り',
    category: 'alcohol'
  },
  {
    id: 'wine-red',
    name: '赤ワイン',
    price: 900,
    description: 'フルボディの深い味わい',
    category: 'alcohol'
  },
  {
    id: 'wine-white',
    name: '白ワイン',
    price: 900,
    description: 'さっぱりとした辛口',
    category: 'alcohol'
  },

  // カクテル
  {
    id: 'gin-tonic',
    name: 'ジントニック',
    price: 800,
    description: 'さっぱりとした定番カクテル',
    category: 'cocktail',
    popular: true
  },
  {
    id: 'mojito',
    name: 'モヒート',
    price: 900,
    description: 'ミントの香りが爽やかな人気カクテル',
    category: 'cocktail'
  },
  {
    id: 'cassis-orange',
    name: 'カシスオレンジ',
    price: 800,
    description: '女性に人気のフルーティーカクテル',
    category: 'cocktail',
    popular: true
  },
  {
    id: 'cosmopolitan',
    name: 'コスモポリタン',
    price: 900,
    description: 'エレガントなピンク色のカクテル',
    category: 'cocktail'
  },
  {
    id: 'moscow-mule',
    name: 'モスコミュール',
    price: 850,
    description: 'ジンジャーが効いたスパイシーカクテル',
    category: 'cocktail'
  },
  {
    id: 'margarita',
    name: 'マルガリータ',
    price: 950,
    description: 'テキーラベースの定番カクテル',
    category: 'cocktail'
  },

  // ソフトドリンク
  {
    id: 'cola',
    name: 'コーラ',
    price: 400,
    description: 'コカコーラ、ペプシコーラ',
    category: 'soft'
  },
  {
    id: 'orange-juice',
    name: 'オレンジジュース',
    price: 450,
    description: '100%フレッシュオレンジ',
    category: 'soft'
  },
  {
    id: 'coffee',
    name: 'コーヒー',
    price: 500,
    description: 'ホット・アイス選べます',
    category: 'soft'
  },
  {
    id: 'tea',
    name: '紅茶',
    price: 500,
    description: 'アールグレイ、ダージリン等',
    category: 'soft'
  },
  {
    id: 'green-tea',
    name: '緑茶',
    price: 450,
    description: '厳選された日本茶',
    category: 'soft'
  },
  {
    id: 'ginger-ale',
    name: 'ジンジャーエール',
    price: 450,
    description: 'スパイシーな大人の味',
    category: 'soft'
  },

  // スペシャル
  {
    id: 'champagne',
    name: 'シャンパン',
    price: 3000,
    description: 'お祝いや特別な日に',
    category: 'special'
  },
  {
    id: 'fruit-cocktail',
    name: 'フルーツカクテル',
    price: 1200,
    description: '季節のフルーツを使った特製カクテル',
    category: 'special',
    popular: true
  },
  {
    id: 'signature-cocktail',
    name: 'シグネチャーカクテル',
    price: 1500,
    description: '当店オリジナルの特別なカクテル',
    category: 'special'
  }
];

const allYouCanDrinkPlans = [
  {
    id: 'standard',
    name: 'スタンダード',
    price: 2500,
    duration: '90分',
    description: 'ビール、ハイボール、基本カクテル、ソフトドリンク'
  },
  {
    id: 'premium',
    name: 'プレミアム',
    price: 3500,
    duration: '90分',
    description: '全メニュー飲み放題（シャンパン除く）',
    popular: true
  }
];

export default function DrinksPage() {
  const groupedDrinks = Object.entries(drinkCategories).map(([key, category]) => ({
    ...category,
    key: key as keyof typeof drinkCategories,
    items: drinkItems.filter(item => item.category === key)
  }));

  return (
    <div className="min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b border-border backdrop-blur-md bg-surface/80">
        <div className="tablet-layout py-3">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              戻る
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold">ドリンクメニュー</h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="tablet-layout py-6">
        {/* タイトルセクション */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">ドリンクメニュー</h2>
          <p className="text-secondary text-sm">豊富なドリンクからお好みの一杯をお選びください</p>
        </div>

        {/* ドリンクカテゴリ */}
        <div className="space-y-8">
          {groupedDrinks.map((category) => (
            <div key={category.key} className="cast-card p-0 overflow-hidden">
              {/* カテゴリヘッダー */}
              <div 
                className="px-6 py-4 border-b border-border"
                style={{ backgroundColor: `${category.color}10` }}
              >
                <div className="flex items-center gap-3">
                  <category.icon 
                    className="h-6 w-6" 
                    style={{ color: category.color }} 
                  />
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <div className="ml-auto text-sm text-secondary">
                    {category.items.length}種類
                  </div>
                </div>
              </div>

              {/* ドリンクリスト */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {category.items.map((drink) => (
                    <div
                      key={drink.id}
                      className={`relative p-4 rounded-lg border transition-all hover:shadow-md ${
                        drink.popular 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-surface-variant/50'
                      }`}
                    >
                      {/* 人気バッジ */}
                      {drink.popular && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            人気
                          </div>
                        </div>
                      )}
                      
                      {/* ドリンク情報 */}
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-semibold">
                          {drink.name}
                        </h4>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-primary">
                            ¥{drink.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-secondary leading-relaxed">
                        {drink.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 飲み放題プラン */}
        <div className="mt-10 cast-card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-white" />
              <h3 className="text-xl font-bold text-white">飲み放題プラン</h3>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-secondary">対象ドリンクが時間内飲み放題でお得にお楽しみいただけます</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {allYouCanDrinkPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    plan.popular 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-surface-variant'
                  }`}
                >
                  {plan.popular && (
                    <div className="flex justify-center mb-3">
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        おすすめ
                      </div>
                    </div>
                  )}

                  <div className="text-center space-y-3">
                    <h4 className="text-xl font-bold">{plan.name}</h4>
                    <div className="text-3xl font-bold text-primary">
                      ¥{plan.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-secondary">
                      {plan.duration}
                    </div>
                    <p className="text-sm leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-8 cast-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">ドリンクについて</h3>
          </div>
          
          <div className="space-y-3 text-sm text-secondary">
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>価格は全て税込み表示です</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>アルコールの提供は20歳以上の方に限ります</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>ドリンクの種類によっては在庫切れの場合があります</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>お酒の飲み過ぎにはご注意ください</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>ノンアルコールカクテルもご用意しております</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>ドリンクのご注文はキャストまでお声がけください</span>
            </div>
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
            <Link href="/menu/drinks" className="nav-item active">
              <Coffee className="h-5 w-5" />
              <span>ドリンク</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}