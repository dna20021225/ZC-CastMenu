import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

/**
 * ログイン中の管理者が自身のパスワードを変更する。
 *
 * リクエスト:
 *   PATCH /api/admins/me/password
 *   Body: { "currentPassword": "...", "newPassword": "..." }
 *
 * 現在のパスワードを必ず検証してから更新する。
 * セッションは継続（再ログインは要求しない）。
 *
 * レガシーログイン（id="1" のハードコード経由）でログイン中の場合は、
 * DB に admins.name='admin' のレコードを作成しつつパスワードを更新する。
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON ボディが不正です" }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "currentPassword と newPassword は必須です" },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "新しいパスワードは 8 文字以上にしてください" },
      { status: 400 }
    );
  }
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "現在のパスワードと同じです" },
      { status: 400 }
    );
  }

  const username = session.user.name;
  if (!username) {
    return NextResponse.json({ error: "セッション情報が不正です" }, { status: 400 });
  }

  try {
    // DB に該当ユーザーが居れば現パスワードを検証
    const existing = await query(
      `SELECT id, password_hash FROM admins WHERE name = ? LIMIT 1`,
      [username]
    );
    const row = existing.rows[0] as { id: number; password_hash: string } | undefined;

    if (row) {
      const ok = await bcrypt.compare(currentPassword, row.password_hash);
      if (!ok) {
        return NextResponse.json(
          { error: "現在のパスワードが正しくありません" },
          { status: 400 }
        );
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await query(
        `UPDATE admins SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
        [newHash, row.id]
      );
      return NextResponse.json({ message: "パスワードを変更しました" });
    }

    // DB に居ない = レガシー経路でログインしている。
    // 現パスワードは固定値（password1234）と照合し、検証後 DB レコードを作成。
    if (currentPassword !== "password1234") {
      return NextResponse.json(
        { error: "現在のパスワードが正しくありません" },
        { status: 400 }
      );
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await query(
      `INSERT INTO admins (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [username, `${username}@local`, newHash, "super_admin"]
    );
    return NextResponse.json({
      message: "パスワードを変更しました（管理者レコードを DB に作成）",
    });
  } catch (error) {
    console.error("パスワード変更エラー:", error);
    return NextResponse.json(
      { error: "パスワード変更中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
