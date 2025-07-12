// 型定義の統合エクスポート

// データベース関連
export * from './database';

// API関連
export * from './api';

// UI関連
export * from './ui';

// 共通ユーティリティ型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ID型
export type ID = string;

// 日付型（ISO文字列）
export type DateString = string;

// 環境変数型
export interface EnvironmentVariables {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

// ページネーション共通型
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationParams;
}

// ソート関連
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// アップロード関連
export interface FileUpload {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// 操作ログ用
export interface ActionLog {
  id: string;
  action: string;
  resource: string;
  resource_id: string;
  user_id: string;
  changes?: Record<string, unknown>;
  timestamp: DateString;
}