import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from '@/components/layout/Navigation';
import { SplashScreen } from '@/components/SplashScreen';
import { query } from '@/lib/db';
import { DEFAULT_THEME, sanitizeTheme, themeToCssVars } from '@/lib/theme';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZEROCLOUD NAGOYA",
  description: "ZEROCLOUD NAGOYA キャストメニュー",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZEROCLOUD",
  },
  openGraph: {
    title: "ZEROCLOUD NAGOYA",
    description: "ZEROCLOUD NAGOYA キャストメニュー",
    type: "website",
    locale: "ja_JP",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
  viewportFit: "cover",
};

// テーマ保存後すぐに反映させたいので、ルートレイアウトを動的レンダリングに固定する。
// 静的レンダリングのままだと build 時の DEFAULT_THEME が焼き付き、Vercel 上で配色変更が反映されない。
export const dynamic = 'force-dynamic';

// SSR時にDBからテーマを読む。失敗時はデフォルトテーマで安全側に倒す。
async function loadTheme() {
  try {
    const result = await query("SELECT value FROM settings WHERE key = ?", ['theme']);
    const row = result.rows[0];
    if (!row?.value) return DEFAULT_THEME;
    const parsed = JSON.parse(String(row.value));
    return sanitizeTheme(parsed);
  } catch {
    // settings テーブルが未作成の場合などはデフォルト
    return DEFAULT_THEME;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await loadTheme();
  const themeCss = themeToCssVars(theme);
  return (
    <html lang="ja">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-2048-2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1536-2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2224.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1620-2160.png" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1290-2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1179-2556.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1170-2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1125-2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242-2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-828-1792.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-750-1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-640-1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
      </head>
      <body
        className={`${inter.className} antialiased bg-background min-h-screen`}
      >
        <SplashScreen>
          <main className="pb-16">
            {children}
          </main>
          <Navigation />
        </SplashScreen>
      </body>
    </html>
  );
}
