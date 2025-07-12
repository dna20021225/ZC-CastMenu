// API関連の型定義

import { Cast, CastPhoto, CastStats, Badge } from './database';

// APIレスポンスの基本型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// キャスト詳細情報（関連データを含む）
export interface CastDetail extends Cast {
  photos: CastPhoto[];
  stats: CastStats;
  badges: (Badge & { assigned_at: string })[];
}

// キャスト一覧のレスポンス
export interface CastListResponse {
  casts: CastDetail[];
  total: number;
  page: number;
  limit: number;
}

// 検索・フィルタパラメータ
export interface CastSearchParams {
  search?: string;
  badges?: string[];
  age_min?: number;
  age_max?: number;
  height_min?: number;
  height_max?: number;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'age' | 'height' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// キャスト作成・更新用のフォーム型
export interface CastFormData {
  name: string;
  age: number;
  height: number;
  hobby: string;
  description: string;
  avatar_url?: string;
}

export interface CastStatsFormData {
  looks: number;
  talk: number;
  alcohol_tolerance: number;
  intelligence: number;
  energy: number;
  custom_stat?: number;
  custom_stat_name?: string;
}

// 認証関連
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
}

// バッジ付与・削除
export interface BadgeAssignRequest {
  cast_id: string;
  badge_ids: string[];
}

// 写真アップロード
export interface PhotoUploadRequest {
  cast_id: string;
  photo_url: string;
  is_main: boolean;
  order_index: number;
}

// エラーレスポンス
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}