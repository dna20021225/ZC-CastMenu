"use client";

import { DollarSign, Clock, Users, Star } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'ベーシック',
    price: '¥3,000',
    duration: '30分',
    features: [
      'キャストとの会話',
      'ドリンク1杯込み',
      '基本的なサービス'
    ]
  },
  {
    id: 'standard',
    name: 'スタンダード',
    price: '¥5,500',
    duration: '60分',
    features: [
      'キャストとの会話',
      'ドリンク2杯込み',
      'カラオケ利用可',
      'ゲーム参加可'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'プレミアム',
    price: '¥8,000',
    duration: '90分',
    features: [
      'キャストとの会話',
      'ドリンク飲み放題',
      'カラオケ利用可',
      'ゲーム参加可',
      '写真撮影サービス'
    ]
  },
  {
    id: 'vip',
    name: 'VIP',
    price: '¥12,000',
    duration: '120分',
    features: [
      'キャストとの会話',
      'ドリンク飲み放題',
      'カラオケ利用可',
      'ゲーム参加可',
      '写真撮影サービス',
      '専用個室利用',
      'VIP特別サービス'
    ]
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <DollarSign className="w-8 h-8 text-pink-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">料金プラン</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            お客様のニーズに合わせた様々なプランをご用意しております
          </p>
        </div>

        {/* 料金プラン */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-pink-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-pink-500 text-white text-center py-2">
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">人気</span>
                  </div>
                </div>
              )}
              
              <div className={`p-6 ${plan.popular ? 'pt-12' : ''}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-pink-600">
                    {plan.price}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-6">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{plan.duration}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  プランを選択
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 追加情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ご利用について
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                営業時間
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>平日: 18:00 - 26:00</p>
                <p>土日祝: 16:00 - 27:00</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ご予約・お問い合わせ
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>電話: 03-XXXX-XXXX</p>
                <p>受付時間: 15:00 - 25:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            注意事項
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 料金は税込み価格です</li>
            <li>• 延長料金は15分毎に¥1,000となります</li>
            <li>• キャンセルは当日17:00まで承ります</li>
            <li>• 未成年者のご利用はお断りしております</li>
            <li>• ドリンクの追加注文も承っております</li>
          </ul>
        </div>
      </div>
    </div>
  );
}