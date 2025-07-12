'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Badge as BadgeType } from '@/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className, 
    badge,
    size = 'md', 
    variant = 'solid',
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap';
    
    const sizes = {
      sm: 'h-5 px-2 text-xs',
      md: 'h-6 px-3 text-sm',
      lg: 'h-8 px-4 text-sm'
    };

    const getVariantClasses = () => {
      const color = badge.color;
      
      if (variant === 'outline') {
        return {
          backgroundColor: 'transparent',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: color,
          color: color
        };
      }
      
      return {
        backgroundColor: color,
        color: '#ffffff'
      };
    };

    return (
      <span
        className={clsx(
          baseClasses,
          sizes[size],
          className
        )}
        style={getVariantClasses()}
        ref={ref}
        {...props}
      >
        {badge.name}
      </span>
    );
  }
);

Badge.displayName = 'Badge';