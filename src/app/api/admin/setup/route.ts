import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

/**
 * 管理者リカバリ用エンドポイント。
 *
 * 用途: 管理者がパスワードを忘れた場合の最終手段。
 * 旧 GET 経路は誰でも叩けて admin123 にリセットされる重大ホールだったため、
 * POST + SETUP_SECRET ヘッダ必須に変更した（2026-06-17）。
 *
 * リクエスト:
 *   POST /api/admin/setup
 *   Header: x-setup-secret: <SETUP_SECRET>
 *   Body:   { "username": "admin", "newPassword": "..." }
 *
 * 環境変数 SETUP_SECRET が未設定の場合は 503（誤って本番に GET 経路の名残で
 * 叩かれないようにするため、明示的にエラーにする）。
 */
export async function POST(request: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      { error: "SETUP_SECRET が設定されていません。サーバ管理者に連絡してください。" },
      { status: 503 }
    );
  }

  const provided = request.headers.get("x-setup-secret");
  if (!provided || provided !== setupSecret) {
    return NextResponse.json(
      { error: "認証に失敗しました" },
      { status: 401 }
    );
  }

  let body: { username?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON ボディが不正です" }, { status: 400 });
  }

  const username = body.username?.trim();
  const newPassword = body.newPassword;

  if (!username || !newPassword) {
    return NextResponse.json(
      { error: "username と newPassword は必須です" },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "newPassword は 8 文字以上にしてください" },
      { status: 400 }
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const existing = await query(
      `SELECT id FROM admins WHERE name = ? LIMIT 1`,
      [username]
    );

    if (existing.rows.length > 0) {
      await query(
        `UPDATE admins SET password_hash = ?, is_active = 1, updated_at = datetime('now') WHERE name = ?`,
        [hashedPassword, username]
      );
      return NextResponse.json({
        message: "パスワードをリセットしました",
        username,
      });
    }

    // username に該当するレコードが無い場合は新規作成
    await query(
      `INSERT INTO admins (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [username, `${username}@local`, hashedPassword, "super_admin"]
    );
    return NextResponse.json({
      message: "管理者を新規作成しました",
      username,
    });
  } catch (error) {
    console.error("管理者リカバリ失敗:", error);
    return NextResponse.json(
      { error: "リカバリ中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "GET は廃止されました。POST + x-setup-secret ヘッダで呼び出してください。" },
    { status: 405 }
  );
}
