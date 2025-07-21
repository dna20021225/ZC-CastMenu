import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPath = req.nextUrl.pathname === "/admin/login";

  if (isAdminPath && !isLoginPath && !isAuth) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPath && isAuth) {
    const adminUrl = new URL("/admin", req.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};