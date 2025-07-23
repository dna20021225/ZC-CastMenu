import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // 管理画面のパスの場合のみ認証チェック
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // ログインページは除外
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    // 認証チェック
    const session = await auth();
    
    if (!session?.user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};