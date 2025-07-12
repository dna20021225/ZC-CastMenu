'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Home, Menu, DollarSign, Coffee, Settings } from 'lucide-react';

interface NavigationProps extends HTMLAttributes<HTMLElement> {
  variant?: 'bottom' | 'side';
}

const navigationItems = [
  {
    id: 'home',
    label: 'ホーム',
    href: '/',
    icon: Home
  },
  {
    id: 'pricing',
    label: '料金',
    href: '/menu/pricing', 
    icon: DollarSign
  },
  {
    id: 'drinks',
    label: 'ドリンク',
    href: '/menu/drinks',
    icon: Coffee
  },
  {
    id: 'admin',
    label: '管理',
    href: '/admin',
    icon: Settings
  }
];

export const Navigation = forwardRef<HTMLElement, NavigationProps>(
  ({ 
    className,
    variant = 'bottom',
    ...props 
  }, ref) => {
    const pathname = usePathname();

    const baseClasses = 'bg-black border-t border-gray-800';
    
    const variantClasses = {
      bottom: 'fixed bottom-0 left-0 right-0 z-50',
      side: 'fixed left-0 top-0 bottom-0 w-20 border-r border-t-0 border-r-gray-800'
    };

    const containerClasses = {
      bottom: 'flex justify-around items-center h-16 px-4',
      side: 'flex flex-col justify-start items-center py-6 space-y-4'
    };

    return (
      <nav
        className={clsx(
          baseClasses,
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        <div className={containerClasses[variant]}>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center transition-colors',
                  variant === 'bottom' ? 'px-3 py-2 min-w-[60px]' : 'w-12 h-12 rounded-lg',
                  isActive 
                    ? 'text-blue-400' 
                    : 'text-gray-400 hover:text-blue-300'
                )}
              >
                <Icon 
                  size={variant === 'bottom' ? 20 : 24} 
                  className="mb-1"
                />
                <span className={clsx(
                  'font-medium',
                  variant === 'bottom' ? 'text-xs' : 'text-[10px]'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';