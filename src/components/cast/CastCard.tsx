'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { CastDetail } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface CastCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  cast: CastDetail;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (cast: CastDetail) => void;
  showBadges?: boolean;
  showStats?: boolean;
}

export const CastCard = forwardRef<HTMLDivElement, CastCardProps>(
  ({
    className,
    cast,
    size = 'md',
    onClick,
    showBadges = true,
    showStats = false,
    ...props
  }, ref) => {
    const baseClasses = 'relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer group';

    const sizes = {
      sm: 'aspect-[3/4]',
      md: 'aspect-[3/4]',
      lg: 'aspect-[3/4]'
    };

    const handleClick = () => {
      if (onClick) {
        onClick(cast);
      }
    };

    const avatarUrl = cast.avatar_url || '/images/placeholder-avatar.jpg';

    return (
      <div
        className={clsx(
          baseClasses,
          sizes[size],
          'bg-gray-900 border border-gray-800',
          'hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/10',
          'hover:scale-[1.02]',
          className
        )}
        ref={ref}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        {/* バッジ表示エリア */}
        {showBadges && cast.badges.length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
            {cast.badges.slice(0, 3).map((badge) => (
              <Badge
                key={badge.id}
                badge={badge}
                size="sm"
                variant="glow"
              />
            ))}
          </div>
        )}

        {/* メイン画像 */}
        <div className="relative h-3/4 w-full overflow-hidden">
          <Image
            src={avatarUrl}
            alt={cast.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={false}
          />
          {/* グラデーションオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
        </div>

        {/* キャスト情報 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent">
          <h3 className="font-bold text-white text-lg truncate mb-1">
            {cast.name}
          </h3>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-yellow-500 font-semibold">{cast.age}</span>
              <span>歳</span>
            </span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1">
              <span className="text-yellow-500 font-semibold">{cast.height}</span>
              <span>cm</span>
            </span>
          </div>

          {/* 統計表示（オプション） */}
          {showStats && cast.stats && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800">
              {[
                { label: 'ルックス', value: cast.stats.looks },
                { label: 'トーク', value: cast.stats.talk },
                { label: 'テンション', value: cast.stats.energy }
              ].map(({ label, value }) => (
                <div key={label} className="flex-1 text-center">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="text-sm font-bold text-yellow-500">{value || '-'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ホバー時のハイライト効果 */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-500/30 rounded-xl transition-colors pointer-events-none" />
      </div>
    );
  }
);

CastCard.displayName = 'CastCard';
