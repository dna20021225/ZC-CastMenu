// UI関連の型定義

import { ReactNode } from 'react';
import { Badge } from './database';
import { CastDetail } from './api';

// グリッドレイアウト
export interface GridConfig {
  columns: number;
  gap: number;
  aspectRatio?: string;
}

// デバイス画面向き
export type Orientation = 'portrait' | 'landscape';

// レスポンシブ設定
export interface ResponsiveConfig {
  portrait: GridConfig;
  landscape: GridConfig;
}

// レーダーチャートの設定
export interface RadarChartData {
  labels: string[];
  values: number[];
  maxValue: number;
  colors?: {
    fill: string;
    stroke: string;
    point: string;
  };
}

// バッジ表示設定
export interface BadgeDisplayProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
}

// キャストカードのプロパティ
export interface CastCardProps {
  cast: CastDetail;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (cast: CastDetail) => void;
  showBadges?: boolean;
  showStats?: boolean;
}

// 検索・フィルタコンポーネント
export interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  initialQuery?: string;
  initialFilters?: FilterOptions;
}

export interface FilterOptions {
  badges: string[];
  ageRange: [number, number];
  heightRange: [number, number];
  sortBy: 'name' | 'age' | 'height' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

// ナビゲーション
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
}

// モーダル・ダイアログ
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// フォーム関連
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea';
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

// ローディング状態
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  data?: unknown;
}

// 管理画面関連
export interface AdminDashboardData {
  totalCasts: number;
  activeCasts: number;
  totalBadges: number;
  recentlyUpdated: CastDetail[];
}

// カラーテーマ
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

// アニメーション設定
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

// 画面サイズブレークポイント
export const BREAKPOINTS = {
  xs: '320px',
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1536px'
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;