'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { CastDetail } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface CastCardProps extends HTMLAttributes<HTMLDivElement> {
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
    const baseClasses = 'relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer';
    
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
          <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
            {cast.badges.map((badge) => (
              <Badge
                key={badge.id}
                badge={badge}
                size="sm"
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
            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 16vw"
            className="object-cover"
            priority={false}
          />
        </div>

        {/* キャスト情報 */}
        <div className="h-1/4 p-3 flex flex-col justify-center">
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {cast.name}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <span>{cast.age}歳</span>
            <span>•</span>
            <span>{cast.height}cm</span>
          </div>

          {/* 統計表示（オプション） */}
          {showStats && (
            <div className="flex items-center gap-1 mt-1">
              {Object.entries({
                ルックス: cast.stats.looks,
                トーク: cast.stats.talk,
                テンション: cast.stats.energy
              }).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500">{key}</span>
                  <span className="font-medium text-blue-600">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CastCard.displayName = 'CastCard';