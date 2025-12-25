'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Info } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--background)' }}>
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
              <h1 className="text-lg font-bold truncate" style={{ color: 'var(--foreground)' }}>料金表</h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8 tablet-layout">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--primary-500)' }}>PRICE</h2>
          <div className="cast-card p-8">
            <Info className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent-600)' }} />
            <p style={{ color: 'var(--foreground)' }}>料金表は準備中です</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--accent-600)' }}>詳細はスタッフにお問い合わせください</p>
          </div>
        </div>
      </main>
    </div>
  );
}
