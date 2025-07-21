import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // 管理者テーブルの作成
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // パスワードをハッシュ化
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 初期管理者を作成
    const result = await query(
      `INSERT INTO admins (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING *`,
      ['admin@zc-castmenu.com', hashedPassword, 'システム管理者', 'super_admin']
    );

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