import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/types/api';
import { Cast } from '@/types/database';

/**
 * キャスト表示/非表示切替 (PATCH /api/casts/[id]/visibility)
 * body: { is_visible: boolean }
 *
 * is_active（論理削除）とは独立した「非表示」フラグの切替。
 * 非表示にすると顧客向けの一覧／詳細では除外されるが、管理画面では
 * ?includeHidden=true で引き続き取得・編集できる。
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const body = (await request.json()) as { is_visible?: unknown };

    if (typeof body.is_visible !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'is_visible は boolean で指定してください' } as ApiResponse,
        { status: 400 }
      );
    }

    // 削除済みキャストは触らない（is_active = 1 のみ対象）
    const existing = await query(
      'SELECT id FROM casts WHERE id = ? AND is_active = 1',
      [params.id]
    ) as unknown as { rows: Cast[] };

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'キャストが見つかりません' } as ApiResponse,
        { status: 404 }
      );
    }

    await query(
      `UPDATE casts SET is_visible = ?, updated_at = datetime('now') WHERE id = ?`,
      [body.is_visible ? 1 : 0, params.id]
    );

    console.info('キャスト表示状態更新完了', { id: params.id, is_visible: body.is_visible });

    return NextResponse.json({
      success: true,
      message: body.is_visible ? '表示に切り替えました' : '非表示に切り替えました',
    } as ApiResponse);
  } catch (error) {
    console.error(
      'キャスト表示状態更新エラー',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { success: false, error: '表示状態の更新に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
}
