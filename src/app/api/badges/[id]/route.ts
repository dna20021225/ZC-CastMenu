import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/types/api';
import { Badge } from '@/types/database';

/**
 * バッジ更新 (PUT /api/badges/[id])
 * body: { name?: string, color?: string }
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const body = await request.json() as { name?: unknown; color?: unknown };

    const existing = await query('SELECT * FROM badges WHERE id = ?', [params.id]) as unknown as { rows: Badge[] };
    if (existing.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'バッジが見つかりません'
      } as ApiResponse, { status: 404 });
    }

    const updateFields: string[] = [];
    const updateValues: unknown[] = [];

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json({
          success: false,
          error: 'バッジ名を入力してください'
        } as ApiResponse, { status: 400 });
      }
      const name = body.name.trim();
      // 重複チェック（自身を除外）
      const dup = await query('SELECT id FROM badges WHERE name = ? AND id != ?', [name, params.id]) as unknown as { rows: { id: string }[] };
      if (dup.rows.length > 0) {
        return NextResponse.json({
          success: false,
          error: '同名のバッジが既に存在します'
        } as ApiResponse, { status: 409 });
      }
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (body.color !== undefined) {
      if (typeof body.color !== 'string' || body.color.trim() === '') {
        return NextResponse.json({
          success: false,
          error: '色を指定してください'
        } as ApiResponse, { status: 400 });
      }
      updateFields.push('color = ?');
      updateValues.push(body.color.trim());
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: true,
        data: existing.rows[0],
        message: '更新する項目がありません'
      } as ApiResponse<Badge>);
    }

    updateValues.push(params.id);
    await query(
      `UPDATE badges SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const updated = await query('SELECT * FROM badges WHERE id = ?', [params.id]) as unknown as { rows: Badge[] };
    console.info('バッジ更新完了', { id: params.id });

    return NextResponse.json({
      success: true,
      data: updated.rows[0],
      message: 'バッジを更新しました'
    } as ApiResponse<Badge>);

  } catch (error) {
    console.error('バッジ更新エラー', error instanceof Error ? error : new Error(String(error)), { id: params.id });
    return NextResponse.json({
      success: false,
      error: 'バッジの更新に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}

/**
 * バッジ削除 (DELETE /api/badges/[id])
 * 関連する cast_badges もカスケードで削除（FK の ON DELETE CASCADE）
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const existing = await query('SELECT * FROM badges WHERE id = ?', [params.id]) as unknown as { rows: Badge[] };
    if (existing.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'バッジが見つかりません'
      } as ApiResponse, { status: 404 });
    }

    // 念のため明示的に cast_badges を先に削除（ON DELETE CASCADE が機能しない環境への保険）
    await query('DELETE FROM cast_badges WHERE badge_id = ?', [params.id]);
    await query('DELETE FROM badges WHERE id = ?', [params.id]);

    console.info('バッジ削除完了', { id: params.id });

    return NextResponse.json({
      success: true,
      message: 'バッジを削除しました'
    } as ApiResponse);

  } catch (error) {
    console.error('バッジ削除エラー', error instanceof Error ? error : new Error(String(error)), { id: params.id });
    return NextResponse.json({
      success: false,
      error: 'バッジの削除に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}
