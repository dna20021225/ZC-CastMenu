import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { createAPILogger } from '@/lib/logger/server';
import bcrypt from 'bcryptjs';

// Logger initialization moved

// 管理者詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.info('管理者詳細取得開始', { id: params.id });

    const result = await query(
      'SELECT id, username, email, is_active, created_at, last_login FROM admins WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: '管理者が見つかりません',
      }, { status: 404 });
    }

    console.info('管理者詳細取得完了', { id: params.id });

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('管理者詳細取得エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: '管理者情報の取得に失敗しました',
    }, { status: 500 });
  }
}

// 管理者更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.info('管理者更新開始', { id: params.id });

    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email) {
      return NextResponse.json({
        success: false,
        error: '必須項目が入力されていません',
      }, { status: 400 });
    }

    // 他の管理者との重複チェック
    const existingUser = await query(
      'SELECT id FROM admins WHERE (username = $1 OR email = $2) AND id != $3',
      [username, email, params.id]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'ユーザー名またはメールアドレスは既に使用されています',
      }, { status: 400 });
    }

    // パスワード更新がある場合
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'UPDATE admins SET username = $1, email = $2, password = $3, updated_at = NOW() WHERE id = $4',
        [username, email, hashedPassword, params.id]
      );
    } else {
      await query(
        'UPDATE admins SET username = $1, email = $2, updated_at = NOW() WHERE id = $3',
        [username, email, params.id]
      );
    }

    console.info('管理者更新完了', { id: params.id });

    return NextResponse.json({
      success: true,
      message: '管理者情報が更新されました',
    });
  } catch (error) {
    console.error('管理者更新エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: '管理者情報の更新に失敗しました',
    }, { status: 500 });
  }
}

// 管理者削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.info('管理者削除開始', { id: params.id });

    // 管理者が1人だけの場合は削除不可
    const countResult = await query('SELECT COUNT(*) as count FROM admins WHERE is_active = true');
    const activeCount = parseInt(countResult.rows[0].count);

    if (activeCount <= 1) {
      return NextResponse.json({
        success: false,
        error: '最後の有効な管理者は削除できません',
      }, { status: 400 });
    }

    const result = await query(
      'DELETE FROM admins WHERE id = $1 RETURNING username',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: '管理者が見つかりません',
      }, { status: 404 });
    }

    console.info('管理者削除完了', { id: params.id, username: result.rows[0].username });

    return NextResponse.json({
      success: true,
      message: '管理者が削除されました',
    });
  } catch (error) {
    console.error('管理者削除エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: '管理者の削除に失敗しました',
    }, { status: 500 });
  }
}

// 管理者ステータス更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.info('管理者ステータス更新開始', { id: params.id });

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: '無効なステータス値です',
      }, { status: 400 });
    }

    // 無効化する場合、有効な管理者が1人だけなら拒否
    if (!is_active) {
      const countResult = await query('SELECT COUNT(*) as count FROM admins WHERE is_active = true');
      const activeCount = parseInt(countResult.rows[0].count);

      if (activeCount <= 1) {
        return NextResponse.json({
          success: false,
          error: '最後の有効な管理者は無効化できません',
        }, { status: 400 });
      }
    }

    await query(
      'UPDATE admins SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [is_active, params.id]
    );

    console.info('管理者ステータス更新完了', { id: params.id, is_active });

    return NextResponse.json({
      success: true,
      message: 'ステータスが更新されました',
    });
  } catch (error) {
    console.error('管理者ステータス更新エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: 'ステータスの更新に失敗しました',
    }, { status: 500 });
  }
}