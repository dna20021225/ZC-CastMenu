import { NextResponse } from "next/server";

export function middleware() {
  // 一時的に最小限の処理のみ
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};