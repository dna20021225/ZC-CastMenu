import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 設定テーブルの初期化
async function initSettingsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

// 設定取得 (GET /api/settings?key=notice)
export async function GET(request: NextRequest) {
  try {
    await initSettingsTable();

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ success: false, error: 'キーが必要です' }, { status: 400 });
    }

    const result = await query('SELECT * FROM settings WHERE key = ?', [key]);
    const setting = result.rows[0];

    return NextResponse.json({
      success: true,
      data: setting ? { key: setting.key, value: setting.value } : null
    });
  } catch (error) {
    console.error('設定取得エラー:', error);
    return NextResponse.json({ success: false, error: '設定の取得に失敗しました' }, { status: 500 });
  }
}

// 設定保存 (POST /api/settings)
export async function POST(request: NextRequest) {
  try {
    await initSettingsTable();

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: 'キーが必要です' }, { status: 400 });
    }

    // UPSERT (INSERT OR REPLACE)
    await query(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')
    `, [key, value || '', value || '']);

    return NextResponse.json({
      success: true,
      message: '設定を保存しました'
    });
  } catch (error) {
    console.error('設定保存エラー:', error);
    return NextResponse.json({ success: false, error: '設定の保存に失敗しました' }, { status: 500 });
  }
}
