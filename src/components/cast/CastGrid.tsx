'use client';

import { forwardRef, HTMLAttributes, useMemo } from 'react';
import { clsx } from 'clsx';
import { CastDetail, Orientation } from '@/types';
import { CastCard } from './CastCard';

interface CastGridProps extends HTMLAttributes<HTMLDivElement> {
  casts: CastDetail[];
  orientation?: Orientation;
  onCastClick?: (cast: CastDetail) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const CastGrid = forwardRef<HTMLDivElement, CastGridProps>(
  ({ 
    className, 
    casts,
    orientation = 'portrait',
    onCastClick,
    loading = false,
    emptyMessage = 'キャストが見つかりません',
    ...props 
  }, ref) => {
    
    const gridConfig = useMemo(() => {
      // 要件定義: 縦画面3列、横画面5列
      if (orientation === 'landscape') {
        return {
          columns: 5,
          className: 'grid-cols-5'
        };
      }
      return {
        columns: 3,
        className: 'grid-cols-3'
      };
    }, [orientation]);

    const baseClasses = 'grid gap-4 p-4';

    if (loading) {
      return (
        <div className={clsx(baseClasses, gridConfig.className, className)} ref={ref} {...props}>
          {Array.from({ length: gridConfig.columns * 3 }).map((_, index) => (
            <div 
              key={index}
              className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (casts.length === 0) {
      return (
        <div className="flex items-center justify-center h-64" ref={ref} {...props}>
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div
        className={clsx(
          baseClasses,
          gridConfig.className,
          className
        )}
        ref={ref}
        {...props}
      >
        {casts.map((cast) => (
          <CastCard
            key={cast.id}
            cast={cast}
            onClick={onCastClick}
            showBadges={true}
            showStats={false}
          />
        ))}
      </div>
    );
  }
);

CastGrid.displayName = 'CastGrid';