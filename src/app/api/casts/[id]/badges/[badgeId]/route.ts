import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Logger initialization moved

// バッジを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; badgeId: string } }
) {
  try {
    const castId = parseInt(params.id);
    const badgeId = parseInt(params.badgeId);

    await query(
      "DELETE FROM cast_badges WHERE cast_id = $1 AND badge_id = $2",
      [castId, badgeId]
    );

    console.info("バッジ削除", { castId, badgeId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("バッジ削除エラー", error);
    return NextResponse.json(
      { error: "バッジの削除に失敗しました" },
      { status: 500 }
    );
  }
}