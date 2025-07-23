import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { createAPILogger } from '@/lib/logger/server';
import bcrypt from 'bcryptjs';

// Logger initialization moved

// 管理者一覧取得
export async function GET() {
  try {
    console.info('管理者一覧取得開始');

    const result = await query(
      'SELECT id, username, email, is_active, created_at, last_login FROM admins ORDER BY created_at DESC'
    );

    console.info('管理者一覧取得完了', { count: result.rows.length });

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('管理者一覧取得エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: '管理者一覧の取得に失敗しました',
    }, { status: 500 });
  }
}

// 管理者作成
export async function POST(request: NextRequest) {
  try {
    console.info('管理者作成開始');

    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({
        success: false,
        error: '必須項目が入力されていません',
      }, { status: 400 });
    }

    // ユーザー名の重複チェック
    const existingUser = await query(
      'SELECT id FROM admins WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'ユーザー名またはメールアドレスは既に使用されています',
      }, { status: 400 });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 管理者作成
    const result = await query(
      'INSERT INTO admins (username, email, password, is_active) VALUES ($1, $2, $3, true) RETURNING id, username, email, is_active, created_at',
      [username, email, hashedPassword]
    );

    console.info('管理者作成完了', { id: result.rows[0].id, username });

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '管理者が正常に作成されました',
    }, { status: 201 });
  } catch (error) {
    console.error('管理者作成エラー', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      success: false,
      error: '管理者の作成に失敗しました',
    }, { status: 500 });
  }
}