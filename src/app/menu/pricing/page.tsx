'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Star, Gift } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic-30',
    name: 'ベーシック',
    duration: '30分',
    price: 3000,
    description: 'お気軽にお楽しみいただけるプラン',
    features: [
      'キャストとの会話タイム',
      'お飲み物1杯込み',
      '写真撮影OK'
    ]
  },
  {
    id: 'standard-60',
    name: 'スタンダード',
    duration: '60分',
    price: 5500,
    description: 'じっくりお話したい方におすすめ',
    features: [
      'キャストとの会話タイム',
      'お飲み物2杯込み',
      '写真撮影OK',
      'ゲーム参加可能'
    ],
    popular: true
  },
  {
    id: 'premium-90',
    name: 'プレミアム',
    duration: '90分',
    price: 8000,
    description: 'たっぷり時間をかけて楽しめる',
    features: [
      'キャストとの会話タイム',
      'お飲み物3杯込み',
      '写真撮影OK',
      'ゲーム参加可能',
      '軽食サービス'
    ]
  },
  {
    id: 'vip-120',
    name: 'VIP',
    duration: '120分',
    price: 12000,
    description: '特別なひとときをお過ごしください',
    features: [
      'キャストとの会話タイム',
      'お飲み物無制限',
      '写真撮影OK',
      'ゲーム参加可能',
      '軽食サービス',
      '個室利用可能'
    ]
  }
];

const additionalServices = [
  {
    name: 'ドリンク追加',
    price: 500,
    description: 'アルコール・ソフトドリンク各種'
  },
  {
    name: 'フード追加',
    price: 800,
    description: '軽食・おつまみ各種'
  },
  {
    name: '写真プリント',
    price: 300,
    description: 'チェキ風プリント（1枚）'
  },
  {
    name: '延長料金',
    price: 1000,
    description: '15分毎の延長料金'
  }
];

export default function PricingPage() {
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
              <h1 className="text-lg font-bold">料金表</h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="tablet-layout py-6">
        {/* タイトルセクション */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">料金プラン</h2>
          <p className="text-secondary text-sm">お客様のご予算に合わせてお選びください</p>
        </div>

        {/* プラン一覧 */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`cast-card p-6 relative ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* 人気プランバッジ */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    人気プラン
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* プラン名と時間 */}
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{plan.duration}</span>
                  </div>
                </div>

                {/* 価格 */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    ¥{plan.price.toLocaleString()}
                  </div>
                  <p className="text-xs text-secondary">{plan.description}</p>
                </div>

                {/* 機能リスト */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-secondary">含まれるサービス</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 追加サービス */}
        <div className="cast-card p-6 mb-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">追加サービス</h3>
            <p className="text-secondary text-sm">オプションでご利用いただけます</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {additionalServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-surface-variant rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm">{service.name}</h4>
                  <p className="text-xs text-secondary">{service.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    ¥{service.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="cast-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">ご利用について</h3>
          </div>
          
          <div className="space-y-3 text-sm text-secondary">
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>料金は税込み価格です</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>ご予約は事前にお電話またはオンラインでお願いします</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>キャンセルは前日までにご連絡ください</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>延長をご希望の場合は、当日キャストにお申し付けください</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>お支払いは現金またはクレジットカードをご利用いただけます</span>
            </div>
          </div>
        </div>

        {/* お問い合わせセクション */}
        <div className="text-center mt-8">
          <p className="text-secondary text-sm mb-4">
            ご不明な点がございましたら、お気軽にお問い合わせください
          </p>
          <div className="space-y-2">
            <p className="text-lg font-bold">📞 03-XXXX-XXXX</p>
            <p className="text-xs text-secondary">営業時間: 18:00 - 26:00 (月-土)</p>
          </div>
        </div>
      </main>

    </div>
  );
}