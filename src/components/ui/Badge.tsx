'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Badge as BadgeType } from '@/types';
import { Crown, Star, Sparkles, Award, Heart } from 'lucide-react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'glow';
}

// バッジ名に応じたアイコンを取得
const getBadgeIcon = (name: string, size: number) => {
  const iconProps = { className: "flex-shrink-0", size };

  if (name.includes('No.1') || name.includes('1位')) {
    return <Crown {...iconProps} />;
  }
  if (name.includes('No.2') || name.includes('2位')) {
    return <Award {...iconProps} />;
  }
  if (name.includes('No.3') || name.includes('3位')) {
    return <Award {...iconProps} />;
  }
  if (name.includes('オススメ') || name.includes('おすすめ')) {
    return <Heart {...iconProps} />;
  }
  if (name.includes('新人')) {
    return <Sparkles {...iconProps} />;
  }
  return <Star {...iconProps} />;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    badge,
    size = 'md',
    variant = 'glow',
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-bold rounded-full whitespace-nowrap gap-1 transition-all duration-200';

    const sizes = {
      sm: 'h-6 px-2.5 text-xs',
      md: 'h-7 px-3 text-sm',
      lg: 'h-9 px-4 text-base'
    };

    const iconSizes = {
      sm: 12,
      md: 14,
      lg: 16
    };

    const getVariantStyles = () => {
      const color = badge.color;

      if (variant === 'outline') {
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${color}`,
          color: color,
          boxShadow: 'none'
        };
      }

      if (variant === 'glow') {
        return {
          background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`,
          color: '#ffffff',
          boxShadow: `0 2px 8px ${color}60, inset 0 1px 0 rgba(255,255,255,0.3)`,
          border: `1px solid ${adjustColor(color, 20)}`,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        };
      }

      // solid
      return {
        backgroundColor: color,
        color: '#ffffff',
        boxShadow: `0 2px 4px ${color}40`
      };
    };

    return (
      <span
        className={clsx(
          baseClasses,
          sizes[size],
          'hover:scale-105 hover:brightness-110',
          className
        )}
        style={getVariantStyles()}
        ref={ref}
        {...props}
      >
        {getBadgeIcon(badge.name, iconSizes[size])}
        <span>{badge.name}</span>
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// 色を明るく/暗くする補助関数
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);

  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
