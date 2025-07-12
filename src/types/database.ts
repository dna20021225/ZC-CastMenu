// データベースエンティティ型定義

export interface Cast {
  id: string;
  name: string;
  age: number;
  height: number;
  hobby: string | null;
  description: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CastPhoto {
  id: string;
  cast_id: string;
  photo_url: string;
  is_main: boolean;
  order_index: number;
  created_at: string;
}

export interface CastStats {
  cast_id: string;
  looks: number;
  talk: number;
  alcohol_tolerance: number;
  intelligence: number;
  energy: number;
  custom_stat: number | null;
  custom_stat_name: string | null;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  color: string;
  display_order: number;
  created_at: string;
}

export interface CastBadge {
  cast_id: string;
  badge_id: string;
  assigned_at: string;
  assigned_by: string | null;
}

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// バッジ名の型安全性のための定数型
export type BadgeName = 'No.1' | 'No.2' | 'No.3' | 'オススメ' | '新人';

// 統計項目名の型
export type StatType = 'looks' | 'talk' | 'alcohol_tolerance' | 'intelligence' | 'energy' | 'custom_stat';

export const STAT_LABELS: Record<StatType, string> = {
  looks: 'ルックス',
  talk: 'トーク',
  alcohol_tolerance: '酒の強さ',
  intelligence: '頭脳',
  energy: 'テンション',
  custom_stat: 'カスタム項目'
} as const;