import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Logger initialization moved

// バッジを付与
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const castId = parseInt(params.id);
    const { badge_id } = await request.json();

    // 既に付与されているかチェック
    const existing = await query(
      "SELECT * FROM cast_badges WHERE cast_id = ? AND badge_id = ?",
      [castId, badge_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "このバッジは既に付与されています" },
        { status: 400 }
      );
    }

    // バッジを付与
    await query(
      "INSERT INTO cast_badges (cast_id, badge_id) VALUES (?, ?)",
      [castId, badge_id]
    );

    console.info("バッジ付与", { castId, badgeId: badge_id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("バッジ付与エラー", error);
    return NextResponse.json(
      { error: "バッジの付与に失敗しました" },
      { status: 500 }
    );
  }
}