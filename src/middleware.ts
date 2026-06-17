import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// middleware は Edge runtime で動くため、DB アクセスを含む auth.ts ではなく
// Edge 安全な auth.config.ts を直接 NextAuth() に渡してインスタンス化する。
// （/lib/auth.ts を import すると Better-SQLite3 経由で fs が引っ張られて落ちる）
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 管理画面のパスの場合のみ認証チェック
  if (pathname.startsWith("/admin")) {
    // ログインページは除外
    if (pathname === "/admin/login") {
      return;
    }

    // 認証されていない場合はログインページにリダイレクト
    if (!req.auth) {
      const loginUrl = new URL("/admin/login", req.url);
      return Response.redirect(loginUrl);
    }
  }
});

export const config = {
  matcher: [
    // 静的ファイルとAPIを除外
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
