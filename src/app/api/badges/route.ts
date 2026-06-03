import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/types/api';
import { Badge } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

// バッジ一覧取得 (GET /api/badges)
export async function GET() {
  try {
    console.info('バッジ一覧取得開始');

    const result = await query(
      'SELECT * FROM badges ORDER BY display_order, name'
    ) as unknown as { rows: Badge[] };

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

// バッジ新規作成 (POST /api/badges)
// body: { name: string, color?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name?: unknown; color?: unknown };

    if (typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'バッジ名を入力してください'
      } as ApiResponse, { status: 400 });
    }
    const name = body.name.trim();
    const color = typeof body.color === 'string' && body.color.trim() !== '' ? body.color.trim() : '#3b82f6';

    // 重複チェック
    const dup = await query('SELECT id FROM badges WHERE name = ?', [name]) as unknown as { rows: { id: string }[] };
    if (dup.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: '同名のバッジが既に存在します'
      } as ApiResponse, { status: 409 });
    }

    // 末尾の display_order を取得
    const maxOrderResult = await query(
      `SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order FROM badges`
    );
    const nextOrder = (maxOrderResult.rows[0] as { next_order: number }).next_order;

    const id = uuidv4();
    await query(
      `INSERT INTO badges (id, name, color, display_order) VALUES (?, ?, ?, ?)`,
      [id, name, color, nextOrder]
    );

    const result = await query('SELECT * FROM badges WHERE id = ?', [id]) as unknown as { rows: Badge[] };
    console.info('バッジ作成完了', { id, name });

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'バッジを作成しました'
    } as ApiResponse<Badge>, { status: 201 });

  } catch (error) {
    console.error('バッジ作成エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: 'バッジの作成に失敗しました'
    } as ApiResponse, { status: 500 });
  }
}