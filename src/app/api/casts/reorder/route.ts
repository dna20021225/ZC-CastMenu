import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/types/api';

/**
 * キャスト並び順更新 (PATCH /api/casts/reorder)
 * body: { ids: string[] }  // 新しい表示順のキャストID配列
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids?: unknown };

    if (!Array.isArray(body.ids) || body.ids.some(id => typeof id !== 'string')) {
      return NextResponse.json(
        { success: false, error: 'ids は string 配列で指定してください' } as ApiResponse,
        { status: 400 }
      );
    }
    const ids = body.ids as string[];

    console.info('キャスト並び順更新開始', { count: ids.length });

    for (let i = 0; i < ids.length; i++) {
      await query(
        `UPDATE casts SET display_order = ?, updated_at = datetime('now') WHERE id = ?`,
        [i, ids[i]]
      );
    }

    console.info('キャスト並び順更新完了', { count: ids.length });

    return NextResponse.json({
      success: true,
      message: '並び順を更新しました',
    } as ApiResponse);
  } catch (error) {
    console.error(
      'キャスト並び順更新エラー',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { success: false, error: '並び順の更新に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
}
