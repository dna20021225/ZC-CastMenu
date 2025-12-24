import { z } from 'zod';

// 共通のバリデーションルール
export const commonValidation = {
  id: z.string().uuid('無効なIDです'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  username: z.string().min(3, 'ユーザー名は3文字以上で入力してください').max(50, 'ユーザー名は50文字以内で入力してください'),
  url: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
};

// キャスト関連のスキーマ
export const castStatsSchema = z.object({
  looks: z.number().min(1, '1以上の値を入力してください').max(100, '100以下の値を入力してください'),
  talk: z.number().min(1, '1以上の値を入力してください').max(100, '100以下の値を入力してください'),
  drinking: z.number().min(1, '1以上の値を入力してください').max(100, '100以下の値を入力してください'),
  intelligence: z.number().min(1, '1以上の値を入力してください').max(100, '100以下の値を入力してください'),
  tension: z.number().min(1, '1以上の値を入力してください').max(100, '100以下の値を入力してください'),
  special: z.number().min(1, '1以上の値を入力してください').max(100, '100以下の値を入力してください'),
});

export const createCastSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内で入力してください'),
  age: z.number().min(18, '年齢は18歳以上で入力してください').max(99, '年齢は99歳以下で入力してください'),
  height: z.number().min(140, '身長は140cm以上で入力してください').max(200, '身長は200cm以下で入力してください'),
  blood_type: z.enum(['A', 'B', 'O', 'AB']).optional(),  // DBにカラムがないためオプショナル
  profile_image: z.string().optional(),
  description: z.string().max(1000, '自己紹介は1000文字以内で入力してください').optional(),
  stats: castStatsSchema,
});

export const updateCastSchema = createCastSchema.partial();

// 管理者関連のスキーマ
export const createAdminSchema = z.object({
  username: commonValidation.username,
  email: commonValidation.email,
  password: commonValidation.password,
});

export const updateAdminSchema = z.object({
  username: commonValidation.username,
  email: commonValidation.email,
  password: commonValidation.password.optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'ユーザー名を入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

// 検索パラメータのスキーマ
export const castSearchParamsSchema = z.object({
  search: z.string().optional(),
  badges: z.array(z.string()).optional(),
  age_min: z.number().min(18).optional(),
  age_max: z.number().max(99).optional(),
  height_min: z.number().min(140).optional(),
  height_max: z.number().max(200).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sort_by: z.enum(['name', 'age', 'height', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// ファイルアップロードのスキーマ
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'ファイルサイズは5MB以下にしてください'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    '対応しているファイル形式はJPEG、PNG、WebPのみです'
  ),
});

// バリデーションヘルパー関数
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// エラーメッセージのフォーマット
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  return errors;
}