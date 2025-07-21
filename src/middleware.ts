import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createAPILogger } from '@/lib/logger/server';

const logger = createAPILogger('middleware');

// レート制限用のマップ
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// レート制限設定
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大リクエスト数
  skipSuccessfulRequests: false,
};

function addSecurityHeaders(response: NextResponse) {
  // XSS保護
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HTTPS リダイレクト（本番環境）
  // CSP ヘッダー
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';"
  );
  
  return response;
}

function checkRateLimit(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

  // API routes にレート制限を適用
  if (pathname.startsWith('/api/')) {
    const now = Date.now();
    const key = `${clientIP}-${pathname}`;
    const limit = rateLimitMap.get(key);

    if (limit) {
      if (now < limit.resetTime) {
        if (limit.count >= RATE_LIMIT.max) {
          logger.warn('Rate limit exceeded', { 
            ip: clientIP, 
            pathname, 
            count: limit.count 
          });
          
          return NextResponse.json({
            success: false,
            error: 'リクエスト回数が上限を超えました。しばらく待ってから再度お試しください。',
            code: 'RATE_LIMIT_EXCEEDED'
          }, { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil((limit.resetTime - now) / 1000).toString(),
            }
          });
        }
        limit.count++;
      } else {
        // リセット時間が過ぎた場合
        rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
      }
    } else {
      // 初回アクセス
      rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    }
  }
  
  return null;
}

export default auth((req) => {
  // レート制限チェック
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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

  const response = NextResponse.next();
  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
};