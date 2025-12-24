'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Star, AlertCircle, Info } from 'lucide-react';

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
    id: 'basic-60',
    name: 'ベーシック',
    duration: '60分',
    price: 5000,
    description: 'お気軽にお楽しみいただけるプラン',
    features: [
      'キャストとの会話',
      'ハウスボトル飲み放題',
    ]
  },
  {
    id: 'standard-90',
    name: 'スタンダード',
    duration: '90分',
    price: 7500,
    description: 'ゆっくりお話したい方におすすめ',
    features: [
      'キャストとの会話',
      'ハウスボトル飲み放題',
      '指名料込み',
    ],
    popular: true
  },
  {
    id: 'premium-120',
    name: 'プレミアム',
    duration: '120分',
    price: 10000,
    description: 'たっぷり時間をかけて楽しめる',
    features: [
      'キャストとの会話',
      'ハウスボトル飲み放題',
      '指名料込み',
      'VIPルーム利用可',
    ]
  },
];

const additionalServices = [
  { name: '延長料金', price: 2500, note: '30分毎' },
  { name: '指名料', price: 2000, note: '1名様' },
  { name: '同伴料', price: 3000, note: '1名様' },
  { name: 'VIPルーム', price: 5000, note: '1時間' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-900 to-black">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b border-gray-800 backdrop-blur-md bg-gray-900/80">
        <div className="py-3 tablet-layout">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              戻る
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white">料金表</h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-6 tablet-layout">
        {/* サンプル表示の警告 */}
        <div className="p-4 mb-6 border rounded-xl bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="flex-shrink-0 w-5 h-5 text-yellow-500" />
            <p className="text-sm font-medium text-yellow-500">
              ※【鷹さんへ】詳細忘れちゃったので適当に掲載してます。
            </p>
          </div>
        </div>

        {/* タイトルセクション */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">PRICE</h2>
          <p className="text-sm text-gray-400">※料金は全て税込表記です</p>
        </div>

        {/* プラン一覧 */}
        <div className="grid gap-6 mb-10 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl overflow-hidden border ${
                plan.popular
                  ? 'border-yellow-500 bg-gradient-to-b from-yellow-500/10 to-gray-900'
                  : 'border-gray-800 bg-gray-900/50'
              }`}
            >
              {/* 人気プランバッジ */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-center text-black bg-gradient-to-r from-yellow-500 to-amber-500">
                    <Star className="w-4 h-4" />
                    人気プラン
                  </div>
                </div>
              )}

              <div className={`p-6 ${plan.popular ? 'pt-14' : ''}`}>
                {/* プラン名と時間 */}
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{plan.duration}</span>
                  </div>
                </div>

                {/* 価格 */}
                <div className="mb-6 text-center">
                  <div className="mb-1 text-4xl font-bold text-white">
                    <span className="text-yellow-500">¥</span>
                    {plan.price.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </div>

                {/* 機能リスト */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-300">
                      <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 追加サービス */}
        <div className="mb-8 overflow-hidden border border-gray-800 rounded-xl bg-gray-900/50">
          <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/50">
            <h3 className="text-xl font-bold text-white">追加料金</h3>
          </div>
          <div className="p-4">
            <div className="grid gap-3 md:grid-cols-2">
              {additionalServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50"
                >
                  <div>
                    <span className="font-medium text-white">{service.name}</span>
                    <span className="ml-2 text-sm text-gray-500">({service.note})</span>
                  </div>
                  <div className="text-xl font-bold text-yellow-500">
                    ¥{service.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="p-6 border border-gray-800 rounded-xl bg-gray-900/50">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-white">ご利用案内</h3>
          </div>

          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex gap-2">
              <span className="font-semibold text-yellow-500">•</span>
              <span>料金は全て税込み価格です</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-yellow-500">•</span>
              <span>初回のお客様は身分証のご提示をお願いしております</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-yellow-500">•</span>
              <span>クレジットカード・各種電子マネーをご利用いただけます</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-yellow-500">•</span>
              <span>ご予約・お問い合わせはお気軽にどうぞ</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
