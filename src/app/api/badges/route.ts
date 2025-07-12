import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { createAPILogger } from '@/lib/logger/server';
import { ApiResponse } from '@/types/api';
import { Badge } from '@/types/database';

const logger = createAPILogger('badges-api');

// バッジ一覧取得 (GET /api/badges)
export async function GET() {
  try {
    logger.info('バッジ一覧取得開始');

    const result = await query(
      'SELECT * FROM badges ORDER BY display_order, name'
    ) as { rows: Badge[] };

    logger.info('バッジ一覧取得完了', { count: result.rows.length });

    return NextResponse.json({
      success: true,
      data: result.rows
    } as ApiResponse<Badge[]>);

  } catch (error) {
    logger.error('バッジ一覧取得エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: 'バッジ一覧の取得に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}