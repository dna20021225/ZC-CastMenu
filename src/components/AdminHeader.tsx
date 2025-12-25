'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  backHref?: string;
}

export function AdminHeader({ title, backHref }: AdminHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border backdrop-blur-md bg-surface/80 py-5 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6">
      <div className="flex items-center gap-4 h-12">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          戻る
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate" style={{ color: 'var(--primary-500)' }}>
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}
