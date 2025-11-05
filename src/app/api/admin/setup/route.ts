import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // 管理者テーブルの作成
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // パスワードをハッシュ化
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 既存の管理者を確認
    const existing = await query(
      `SELECT * FROM admins WHERE email = ?`,
      ['admin@zc-castmenu.com']
    );

    let result;
    if (existing.rows.length > 0) {
      // 既存の管理者を更新
      await query(
        `UPDATE admins SET password_hash = ?, updated_at = datetime('now') WHERE email = ?`,
        [hashedPassword, 'admin@zc-castmenu.com']
      );
      result = await query(
        `SELECT * FROM admins WHERE email = ?`,
        ['admin@zc-castmenu.com']
      );
    } else {
      // 新規管理者を作成
      await query(
        `INSERT INTO admins (email, password_hash, name, role)
         VALUES (?, ?, ?, ?)`,
        ['admin@zc-castmenu.com', hashedPassword, 'システム管理者', 'super_admin']
      );
      const lastIdResult = await query('SELECT last_insert_rowid() as id');
      const adminId = lastIdResult.rows[0].id;
      result = await query('SELECT * FROM admins WHERE id = ?', [adminId]);
    }

    return NextResponse.json({
      message: '管理者セットアップが完了しました',
      admin: {
        email: result.rows[0].email,
        name: result.rows[0].name,
        role: result.rows[0].role
      },
      credentials: {
        email: 'admin@zc-castmenu.com',
        password: 'admin123',
        note: '本番環境では必ずパスワードを変更してください'
      }
    });
  } catch (error) {
    console.error('セットアップエラー:', error);
    return NextResponse.json(
      { error: 'セットアップ中にエラーが発生しました' },
      { status: 500 }
    );
  }
}