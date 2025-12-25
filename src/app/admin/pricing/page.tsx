'use client';

import { AlertCircle } from 'lucide-react';
import { AdminHeader } from '@/components/AdminHeader';

export default function PricingEditor() {
  return (
    <div className="max-w-4xl mx-auto">
      <AdminHeader title="料金表編集" backHref="/admin" />

      <div className="cast-card p-8">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <AlertCircle className="w-16 h-16 mb-4" style={{ color: 'var(--accent-600)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            料金体系不明のため未実装
          </h2>
          <p className="mb-6" style={{ color: 'var(--accent-600)' }}>
            料金体系が確定次第、ドリンクメニューと同様のエディタを実装予定です。
          </p>
          <div className="p-4 rounded-lg text-left w-full max-w-md" style={{ backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>実装予定の機能:</p>
            <ul className="text-sm space-y-1" style={{ color: 'var(--accent-600)' }}>
              <li>・ 料金カテゴリの追加・編集・削除</li>
              <li>・ 料金項目の追加・編集・削除</li>
              <li>・ アイコン・カラー選択</li>
              <li>・ 並び替え機能</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
