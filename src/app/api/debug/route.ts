import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 本番環境のデバッグ用API（問題解決後に削除）
export async function GET() {
  try {
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      USE_LOCAL_DB: process.env.USE_LOCAL_DB,
      USE_TURSO: process.env.USE_TURSO,
      TURSO_DATABASE_URL_SET: !!process.env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN_SET: !!process.env.TURSO_AUTH_TOKEN,
      // URLの先頭部分のみ表示（セキュリティのため）
      TURSO_DATABASE_URL_PREFIX: process.env.TURSO_DATABASE_URL?.substring(0, 30) || 'NOT SET',
    };

    // データベースクエリテスト
    let dbTest = null;
    let castCount = null;
    let error = null;

    try {
      // 簡単なクエリテスト
      const testResult = await query('SELECT 1 as test');
      dbTest = testResult.rows[0];

      // キャスト数を取得
      const countResult = await query('SELECT COUNT(*) as count FROM casts');
      castCount = countResult.rows[0];

      // is_active=1のキャスト数
      const activeCountResult = await query('SELECT COUNT(*) as count FROM casts WHERE is_active = 1');
      const activeCount = activeCountResult.rows[0];

      return NextResponse.json({
        success: true,
        env,
        dbTest,
        castCount,
        activeCount,
        message: 'Debug info retrieved successfully'
      });
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      return NextResponse.json({
        success: false,
        env,
        error,
        message: 'Database query failed'
      });
    }
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}
