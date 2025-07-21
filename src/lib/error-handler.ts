import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createAPILogger } from '@/lib/logger/server';

const logger = createAPILogger('error-handler');

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
}

export class CustomError extends Error {
  public code: string;
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'CustomError';
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'リソースが見つかりません') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = '認証が必要です') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'アクセスが拒否されました') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = 'サーバー内部でエラーが発生しました') {
    super(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

// エラーハンドラー関数
export function handleApiError(error: unknown, context?: string): NextResponse {
  // ログ出力
  logger.error(`API Error${context ? ` in ${context}` : ''}`, error instanceof Error ? error : new Error(String(error)));

  // Zodバリデーションエラー
  if (error instanceof ZodError) {
    const validationErrors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!validationErrors[path]) {
        validationErrors[path] = [];
      }
      validationErrors[path].push(err.message);
    });

    return NextResponse.json({
      success: false,
      error: 'バリデーションエラーが発生しました',
      code: 'VALIDATION_ERROR',
      details: validationErrors,
    }, { status: 400 });
  }

  // カスタムエラー
  if (error instanceof CustomError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    }, { status: error.statusCode });
  }

  // データベースエラー
  if (error instanceof Error) {
    if (error.message.includes('duplicate key')) {
      return NextResponse.json({
        success: false,
        error: '既に登録されているデータです',
        code: 'DUPLICATE_ENTRY',
      }, { status: 409 });
    }

    if (error.message.includes('foreign key')) {
      return NextResponse.json({
        success: false,
        error: '関連するデータが見つかりません',
        code: 'FOREIGN_KEY_ERROR',
      }, { status: 400 });
    }

    if (error.message.includes('not null violation')) {
      return NextResponse.json({
        success: false,
        error: '必須項目が入力されていません',
        code: 'NOT_NULL_VIOLATION',
      }, { status: 400 });
    }
  }

  // その他のエラー
  return NextResponse.json({
    success: false,
    error: 'サーバー内部でエラーが発生しました',
    code: 'INTERNAL_SERVER_ERROR',
  }, { status: 500 });
}

// 非同期処理のエラーハンドラー
export function asyncHandler(
  handler: (req: Request, context: any) => Promise<NextResponse>
) {
  return async (req: Request, context: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error, handler.name);
    }
  };
}

// フロントエンド用のエラーハンドラー
export function handleClientError(error: unknown, context?: string): string {
  logger.error(`Client Error${context ? ` in ${context}` : ''}`, error instanceof Error ? error : new Error(String(error)));

  if (error instanceof Error) {
    // ネットワークエラー
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    }

    // タイムアウトエラー
    if (error.message.includes('timeout')) {
      return 'リクエストがタイムアウトしました。再度お試しください。';
    }

    return error.message;
  }

  return '予期しないエラーが発生しました。';
}

// レート制限用のエラー
export class RateLimitError extends CustomError {
  constructor(message: string = 'リクエスト回数が上限を超えました') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}