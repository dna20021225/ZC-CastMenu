import { auth } from "@/lib/auth";

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