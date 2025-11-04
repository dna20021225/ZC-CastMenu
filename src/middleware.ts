import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // 管理画面のパスの場合のみ認証チェック
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // ログインページとAPIルートは除外
    if (request.nextUrl.pathname === "/admin/login" || 
        request.nextUrl.pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }

    // JWT トークンから認証チェック（Edge Runtime対応）
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (!token || !token.role) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // /admin/loginとapi/authを除外して無限リダイレクトを防止
    "/admin/((?!login|api/auth).*)+"
  ],
};