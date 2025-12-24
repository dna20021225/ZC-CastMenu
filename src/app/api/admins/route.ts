import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Logger initialization moved

// 管理者一覧取得
export async function GET() {
  try {
    console.info('管理者一覧取得開始');

    const result = await query(
      'SELECT id, name, email, is_active, created_at FROM admins ORDER BY created_at DESC'
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
    const name = username; // フロントエンドはusernameを送信するのでマッピング

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: '必須項目が入力されていません',
      }, { status: 400 });
    }

    // 名前・メールアドレスの重複チェック
    const existingUser = await query(
      'SELECT id FROM admins WHERE name = ? OR email = ?',
      [name, email]
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
    await query(
      'INSERT INTO admins (name, email, password_hash, is_active) VALUES (?, ?, ?, 1)',
      [name, email, hashedPassword]
    );

    // 最後に挿入されたIDを取得
    const lastIdResult = await query('SELECT last_insert_rowid() as id');
    const adminId = lastIdResult.rows[0]?.id;

    // 作成された管理者を取得
    const result = await query(
      'SELECT id, name, email, is_active, created_at FROM admins WHERE id = ?',
      [adminId]
    );

    console.info('管理者作成完了', { id: result.rows[0]?.id, name });

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