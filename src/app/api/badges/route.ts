import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createAPILogger } from '@/lib/logger';
import { ApiResponse } from '@/types/api';
import { Badge } from '@/types/database';

// Logger initialization moved

// バッジ一覧取得 (GET /api/badges)
export async function GET() {
  try {
    console.info('バッジ一覧取得開始');

    const result = await query(
      'SELECT * FROM badges ORDER BY display_order, name'
    ) as { rows: Badge[] };

    console.info('バッジ一覧取得完了', { count: result.rows.length });

    return NextResponse.json({
      success: true,
      data: result.rows
    } as ApiResponse<Badge[]>);

  } catch (error) {
    console.error('バッジ一覧取得エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: 'バッジ一覧の取得に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}